"""
Translation service using API-based translation with caching.
Supports multiple providers: LibreTranslate (free), Google Translate, DeepL
"""
import os
import json
import hashlib
import re
from typing import Dict, Optional, List
import httpx
from app.core.config import settings

SUPPORTED_TRANSLATION_PROVIDERS = ("libretranslate", "google", "deepl")


class TranslationService:
    """Translation service with caching and fallback support"""
    
    def __init__(self):
        self.provider = settings.TRANSLATION_PROVIDER.lower()
        if self.provider not in SUPPORTED_TRANSLATION_PROVIDERS:
            self.provider = "libretranslate"
        self.api_key = settings.TRANSLATION_API_KEY or ""
        self.cache: Dict[str, str] = {}
        self.cache_file = "./translation_cache.json"
        self._load_cache()
    
    def _load_cache(self):
        """Load translation cache from file"""
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    self.cache = json.load(f)
        except Exception as e:
            print(f"Failed to load translation cache: {e}")
            self.cache = {}
    
    def _save_cache(self):
        """Save translation cache to file"""
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save translation cache: {e}")
    
    def _get_cache_key(
        self,
        text: str,
        target_lang: str,
        source_lang: str = "en",
        provider: Optional[str] = None,
    ) -> str:
        """Generate cache key for translation"""
        provider_tag = provider or self.provider
        key_string = f"{provider_tag}:{source_lang}:{target_lang}:{text}"
        return hashlib.md5(key_string.encode()).hexdigest()

    def _normalize_provider(self, provider: Optional[str]) -> str:
        """Return a supported provider or default if invalid."""
        if provider:
            candidate = provider.lower()
            if candidate in SUPPORTED_TRANSLATION_PROVIDERS:
                return candidate
        return self.provider

    def provider_available(self, provider: str) -> bool:
        """Check whether the requested provider can be used."""
        provider = provider.lower()
        if provider == "libretranslate":
            return True
        if provider in ("google", "deepl"):
            return bool(self.api_key)
        return False

    def get_provider_options(self) -> List[Dict[str, str]]:
        """Return metadata for supported providers and their availability."""
        descriptions = {
            "libretranslate": "Free community translation (no API key needed).",
            "google": "Google Cloud Translation for highest quality (API key required).",
            "deepl": "DeepL for nuanced phrasing (API key required).",
        }
        return [
            {
                "id": provider,
                "label": provider.capitalize() if provider != "libretranslate" else "LibreTranslate",
                "description": descriptions.get(provider, ""),
                "available": self.provider_available(provider),
                "requires_api_key": provider in ("google", "deepl"),
            }
            for provider in SUPPORTED_TRANSLATION_PROVIDERS
        ]
    
    def translate_libretranslate(self, text: str, target_lang: str, source_lang: str = "en") -> str:
        """Translate using LibreTranslate (free, open-source)"""
        # LibreTranslate public API endpoint
        api_url = settings.LIBRETRANSLATE_URL or "https://libretranslate.com/translate"
        
        # LibreTranslate might need different language codes
        # Try standard codes first, then try alternatives
        lang_mapping = {
            "hi": "hi",  # Try standard first
            "hi-IN": "hi",  # Fallback
        }
        
        # Normalize language codes for LibreTranslate
        source_code = lang_mapping.get(source_lang, source_lang)
        target_code = lang_mapping.get(target_lang, target_lang)
        
        try:
            response = httpx.post(
                api_url,
                json={
                    "q": text,
                    "source": source_code,
                    "target": target_code,
                    "format": "text"
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                translated = result.get("translatedText", text)
                if translated and translated != text:
                    return translated
                return text
            else:
                error_detail = ""
                try:
                    error_data = response.json()
                    error_detail = f" - {error_data}"
                except:
                    error_detail = f" - {response.text[:200]}"
                print(f"LibreTranslate API error: {response.status_code}{error_detail}")
                # If 400 error and we're trying Hindi, the API might not support it
                if response.status_code == 400 and source_lang == "hi":
                    print("LibreTranslate may not support Hindi. Consider using Google Translate or DeepL.")
                return text
        except Exception as e:
            print(f"LibreTranslate translation error: {e}")
            return text
    
    def translate_google(self, text: str, target_lang: str, source_lang: str = "en") -> str:
        """Translate using Google Cloud Translation API v2"""
        if not self.api_key:
            print("Google Translate API key not configured")
            return text
        
        try:
            # Google Translate API v2 endpoint
            url = "https://translation.googleapis.com/language/translate/v2"
            
            # Use POST for better handling of long texts
            data = {
                "q": text,
                "source": source_lang,
                "target": target_lang,
                "format": "text"
            }
            
            params = {
                "key": self.api_key
            }
            
            response = httpx.post(url, params=params, json=data, timeout=15.0)
            
            if response.status_code == 200:
                result = response.json()
                translations = result.get("data", {}).get("translations", [])
                if translations:
                    translated_text = translations[0].get("translatedText", text)
                    # Google returns HTML entities, decode them
                    import html
                    return html.unescape(translated_text)
            elif response.status_code == 400:
                error_data = response.json()
                print(f"Google Translate API error: {error_data}")
                return text
            else:
                print(f"Google Translate API error: {response.status_code} - {response.text}")
                return text
        except httpx.TimeoutException:
            print("Google Translate API timeout")
            return text
        except Exception as e:
            print(f"Google Translate error: {e}")
            return text
    
    def translate_google_batch(self, texts: List[str], target_lang: str, source_lang: str = "en") -> List[str]:
        """Translate multiple texts using Google Translate API (more efficient)"""
        if not self.api_key:
            print("Google Translate API key not configured")
            return texts
        
        if not texts:
            return []
        
        try:
            url = "https://translation.googleapis.com/language/translate/v2"
            
            data = {
                "q": texts,  # Google API accepts array of texts
                "source": source_lang,
                "target": target_lang,
                "format": "text"
            }
            
            params = {
                "key": self.api_key
            }
            
            response = httpx.post(url, params=params, json=data, timeout=15.0)
            
            if response.status_code == 200:
                result = response.json()
                translations = result.get("data", {}).get("translations", [])
                import html
                return [html.unescape(t.get("translatedText", original)) 
                       for t, original in zip(translations, texts)]
            else:
                print(f"Google Translate batch API error: {response.status_code}")
                return texts
        except Exception as e:
            print(f"Google Translate batch error: {e}")
            return texts
    
    def translate_deepl(self, text: str, target_lang: str, source_lang: str = "en") -> str:
        """Translate using DeepL API"""
        if not self.api_key:
            return text
        
        # DeepL language codes mapping
        deepl_lang_map = {
            "en": "EN",
            "hi": "HI",
            "es": "ES",
            "fr": "FR",
            "de": "DE"
        }
        
        try:
            url = "https://api-free.deepl.com/v2/translate"
            headers = {
                "Authorization": f"DeepL-Auth-Key {self.api_key}"
            }
            data = {
                "text": text,
                "source_lang": deepl_lang_map.get(source_lang, "EN"),
                "target_lang": deepl_lang_map.get(target_lang, "HI")
            }
            
            response = httpx.post(url, headers=headers, json=data, timeout=10.0)
            
            if response.status_code == 200:
                result = response.json()
                translations = result.get("translations", [])
                if translations:
                    return translations[0].get("text", text)
            return text
        except Exception as e:
            print(f"DeepL translation error: {e}")
            return text
    
    def translate(
        self,
        text: str,
        target_lang: str,
        source_lang: str = "en",
        provider_override: Optional[str] = None,
    ) -> str:
        """
        Translate text with caching.
        
        Args:
            text: Text to translate
            target_lang: Target language code (e.g., 'hi', 'en')
            source_lang: Source language code (default: 'en')
        
        Returns:
            Translated text or original text if translation fails
        """
        # If same language, return original
        if source_lang == target_lang:
            return text

        provider = self._normalize_provider(provider_override)
        
        # Check cache first
        cache_key = self._get_cache_key(text, target_lang, source_lang, provider)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # Translate based on provider
        translated_text = text
        if provider == "libretranslate":
            translated_text = self.translate_libretranslate(text, target_lang, source_lang)
        elif provider == "google":
            translated_text = self.translate_google(text, target_lang, source_lang)
        elif provider == "deepl":
            translated_text = self.translate_deepl(text, target_lang, source_lang)
        
        # Fix Hindi TTS issues (remove "है।" which causes pronunciation problems)
        if target_lang == "hi":
            translated_text = self._fix_hindi_tts_issues(translated_text)
        
        # Cache the result
        if translated_text != text:
            self.cache[cache_key] = translated_text
            self._save_cache()
        
        return translated_text
    
    def _fix_hindi_tts_issues(self, text: str) -> str:
        """
        Fix common Hindi TTS pronunciation issues by replacing problematic phrases.
        Specifically fixes "है।" which is often mispronounced by TTS engines.
        """
        # Replace "है।" (hai with period) with "है" (without period)
        # The period after "है" causes TTS pronunciation issues
        text = re.sub(r'है\s*।', 'है', text)
        text = re.sub(r'हैं\s*।', 'हैं', text)
        text = re.sub(r'है\s+।', 'है', text)
        text = re.sub(r'हैं\s+।', 'हैं', text)
        text = re.sub(r'है\s*।\s*\n', 'है\n', text)
        text = re.sub(r'हैं\s*।\s*\n', 'हैं\n', text)
        return text
    
    def translate_batch(
        self,
        texts: List[str],
        target_lang: str,
        source_lang: str = "en",
        provider_override: Optional[str] = None,
    ) -> List[str]:
        """Translate multiple texts efficiently"""
        # If same language, return originals
        if source_lang == target_lang:
            return texts

        provider = self._normalize_provider(provider_override)
        
        # Use provider-specific batch translation if available
        if provider == "google":
            # Google Translate supports native batch translation
            return self.translate_google_batch(texts, target_lang, source_lang)
        else:
            # For other providers, translate sequentially (they'll use cache)
            results = []
            for text in texts:
                results.append(self.translate(text, target_lang, source_lang, provider))
            return results


# Global instance
translation_service = TranslationService()

