"""
Gemini-based Translation Service for Hindi to English translation.
Uses Google's Gemini API for high-quality translation of Hindi queries.
Optimized for RAG query translation to improve document retrieval.
"""
import hashlib
import json
import os
from pathlib import Path
from typing import Optional, Dict
import google.generativeai as genai
from app.core.config import settings


class GeminiTranslationService:
    """
    Translation service using Google Gemini for high-quality Hindi to English translation.
    Specifically optimized for translating user queries for RAG retrieval.
    """
    
    def __init__(self, cache_dir: str = "./translation_cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.cache_file = self.cache_dir / "gemini_translations.json"
        self._cache: Dict[str, str] = {}
        self._load_cache()
        self._model = None
        
        # Configure Gemini API
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            print("[GeminiTranslation] Initialized with Gemini API")
        else:
            print("[GeminiTranslation] Warning: GEMINI_API_KEY not set")
    
    def _load_cache(self):
        """Load translation cache from disk"""
        try:
            if self.cache_file.exists():
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    self._cache = json.load(f)
                print(f"[GeminiTranslation] Loaded {len(self._cache)} cached translations")
        except Exception as e:
            print(f"[GeminiTranslation] Failed to load cache: {e}")
            self._cache = {}
    
    def _save_cache(self):
        """Save translation cache to disk"""
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self._cache, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"[GeminiTranslation] Failed to save cache: {e}")
    
    def _get_cache_key(self, text: str, source_lang: str, target_lang: str) -> str:
        """Generate a unique cache key"""
        content = f"{source_lang}:{target_lang}:{text.lower().strip()}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def _get_model(self):
        """Get or create the Gemini model instance"""
        if self._model is None:
            self._model = genai.GenerativeModel('models/gemini-2.0-flash')
        return self._model
    
    def _is_devanagari(self, text: str) -> bool:
        """Check if text contains Devanagari script characters"""
        for char in text:
            if '\u0900' <= char <= '\u097F':
                return True
        return False
    
    def _is_hinglish(self, text: str) -> bool:
        """
        Check if text appears to be Hinglish (Hindi written in Roman script).
        Uses common Hinglish patterns and words.
        """
        text_lower = text.lower()
        
        # Common Hinglish words and patterns
        hinglish_markers = [
            'mera', 'meri', 'mere', 'kya', 'kaun', 'kab', 'kahan', 'kaise',
            'hai', 'hain', 'ho', 'hoon', 'tha', 'thi', 'the',
            'aur', 'ya', 'bhi', 'se', 'ke', 'ki', 'ko', 'mein', 'par',
            'batao', 'bataao', 'batana', 'karo', 'karna',
            'dawai', 'dawa', 'ghar', 'naam', 'parivar', 'bachche',
            'beti', 'beta', 'patni', 'pati', 'doctor', 'appointment',
            'insurance', 'bima', 'leni', 'lena', 'umar', 'address',
            'rehta', 'rehti', 'rehte', 'kahan', 'chahiye', 'chahte',
            'aaj', 'kal', 'abhi', 'baad', 'pehle', 'kabhi',
        ]
        
        words = text_lower.split()
        hinglish_count = sum(1 for word in words if word in hinglish_markers)
        
        # If at least 20% of words are Hinglish markers, consider it Hinglish
        return hinglish_count >= max(1, len(words) * 0.2)
    
    def translate_hindi_to_english(self, text: str) -> str:
        """
        Translate Hindi (Devanagari or Roman/Hinglish) text to English.
        Optimized for query translation for RAG retrieval.
        
        Args:
            text: Hindi text (in Devanagari script or Roman/Hinglish)
            
        Returns:
            English translation of the text
        """
        if not text or not text.strip():
            return text
        
        text = text.strip()
        
        # Check cache first
        cache_key = self._get_cache_key(text, "hi", "en")
        if cache_key in self._cache:
            cached = self._cache[cache_key]
            print(f"[GeminiTranslation] Cache hit: '{text[:50]}...' -> '{cached[:50]}...'")
            return cached
        
        # Determine if text is Devanagari or Hinglish
        is_devanagari = self._is_devanagari(text)
        is_hinglish = self._is_hinglish(text) if not is_devanagari else False
        
        # If text doesn't appear to be Hindi at all, return as-is
        if not is_devanagari and not is_hinglish:
            print(f"[GeminiTranslation] Text doesn't appear to be Hindi: '{text[:50]}...'")
            return text
        
        try:
            translated = self._translate_with_gemini(text, is_devanagari)
            
            if translated and translated != text:
                # Cache the successful translation
                self._cache[cache_key] = translated
                self._save_cache()
                print(f"[GeminiTranslation] Translated: '{text[:50]}...' -> '{translated[:50]}...'")
                return translated
            else:
                print(f"[GeminiTranslation] Translation returned original text")
                return text
                
        except Exception as e:
            print(f"[GeminiTranslation] Error translating: {e}")
            # Try fallback translation
            fallback = self._fallback_translation(text)
            if fallback != text:
                return fallback
            return text
    
    def _translate_with_gemini(self, text: str, is_devanagari: bool) -> str:
        """Use Gemini API to translate Hindi to English"""
        
        script_type = "Devanagari script" if is_devanagari else "Roman script (Hinglish)"
        
        prompt = f"""You are a Hindi to English translator. Translate the following Hindi text to English.

IMPORTANT RULES:
1. The input is in Hindi ({script_type})
2. Translate to natural, conversational English
3. Preserve the meaning and intent of the original text
4. If the text is a question, the translation should also be a question
5. Keep proper nouns (names, places) as they are
6. Return ONLY the English translation, nothing else
7. Do NOT add any explanations, notes, or formatting

Hindi Text: {text}

English Translation:"""
        
        try:
            model = self._get_model()
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,  # Low temperature for consistent translations
                    max_output_tokens=256,
                    top_p=0.9
                )
            )
            
            if response and response.text:
                # Clean up the response
                translated = response.text.strip()
                # Remove any quotes that might be added
                translated = translated.strip('"\'')
                # Remove "English Translation:" prefix if present
                if translated.lower().startswith("english translation:"):
                    translated = translated[20:].strip()
                return translated
            
            return text
            
        except Exception as e:
            print(f"[GeminiTranslation] Gemini API error: {e}")
            raise
    
    def _fallback_translation(self, text: str) -> str:
        """
        Fallback keyword-based translation for common Hindi patterns.
        Used when Gemini API fails.
        """
        text_lower = text.lower().strip()
        
        # Direct translations for common queries
        translations = {
            # Family questions
            "मेरी बेटी का नाम क्या है": "what is my daughter's name",
            "मेरे बेटे का नाम क्या है": "what is my son's name",
            "मेरा डॉक्टर कौन है": "who is my doctor",
            "मेरे डॉक्टर की जानकारी दो": "give me information about my doctor",
            "मेरी दवाई कब लेनी है": "when should I take my medicine",
            "मेरा घर कहाँ है": "where is my home",
            "मेरे इंश्योरेंस के बारे में बताओ": "tell me about my insurance",
            "मेरे इंश्योरेंस के बारे में जानकारी दो": "give me information about my insurance",
            
            # Hinglish versions
            "meri beti ka naam kya hai": "what is my daughter's name",
            "mere bete ka naam kya hai": "what is my son's name",
            "mera doctor kaun hai": "who is my doctor",
            "mere doctor ki jankari do": "give me information about my doctor",
            "meri dawai kab leni hai": "when should I take my medicine",
            "mera ghar kahan hai": "where is my home",
            "mere insurance ke bare mein batao": "tell me about my insurance",
            "mere insurance ke baar me batao": "tell me about my insurance",
            "mere insurance ke baar me jankari do": "give me information about my insurance",
            
            # Additional common queries
            "mera naam kya hai": "what is my name",
            "meri umar kya hai": "what is my age",
            "mera address kya hai": "what is my address",
            "mera parivar": "my family",
            "mere bachche": "my children",
            "meri dawai": "my medicine",
            "mera bima": "my insurance",
        }
        
        # Try exact match first
        if text_lower in translations:
            return translations[text_lower]
        
        # Try partial match
        for hindi, english in translations.items():
            if hindi in text_lower or text_lower in hindi:
                return english
        
        # Word-by-word translation as last resort
        word_map = {
            'mera': 'my', 'meri': 'my', 'mere': 'my',
            'kya': 'what', 'kaun': 'who', 'kab': 'when', 'kahan': 'where', 'kaise': 'how',
            'hai': 'is', 'hain': 'are', 'tha': 'was', 'the': 'were',
            'batao': 'tell me', 'bataao': 'tell me',
            'jankari': 'information', 'jaankari': 'information',
            'do': 'give',
            'naam': 'name', 'umar': 'age', 'ghar': 'home', 'address': 'address',
            'doctor': 'doctor', 'dawai': 'medicine', 'dawa': 'medicine',
            'beti': 'daughter', 'beta': 'son', 'bete': 'son', 'patni': 'wife', 'pati': 'husband',
            'parivar': 'family', 'bachche': 'children',
            'insurance': 'insurance', 'bima': 'insurance',
            'leni': 'take', 'lena': 'take',
            'ke': '', 'ki': '', 'ka': '', 'ko': '', 'se': 'from', 'mein': 'in',
            'bare': 'about', 'baar': 'about', 'baare': 'about',
        }
        
        words = text_lower.split()
        translated_words = []
        for word in words:
            if word in word_map:
                if word_map[word]:  # Skip empty translations
                    translated_words.append(word_map[word])
            else:
                translated_words.append(word)
        
        result = ' '.join(translated_words)
        return result if result != text_lower else text
    
    def translate(self, text: str, target_lang: str, source_lang: str = "auto") -> str:
        """
        General translation method.
        Currently optimized for Hindi to English translation.
        
        Args:
            text: Text to translate
            target_lang: Target language code ('en')
            source_lang: Source language code ('hi' or 'auto')
            
        Returns:
            Translated text
        """
        if not text or not text.strip():
            return text
        
        # Auto-detect: if Devanagari or Hinglish, treat as Hindi
        if source_lang == "auto":
            if self._is_devanagari(text) or self._is_hinglish(text):
                source_lang = "hi"
            else:
                source_lang = "en"
        
        # If source and target are same, return original
        if source_lang == target_lang:
            return text
        
        # Currently we only support Hindi to English
        if source_lang == "hi" and target_lang == "en":
            return self.translate_hindi_to_english(text)
        
        # For other language pairs, return original (could be extended later)
        return text
    
    def clear_cache(self):
        """Clear the translation cache"""
        self._cache = {}
        if self.cache_file.exists():
            self.cache_file.unlink()
        print("[GeminiTranslation] Cache cleared")


# Get the backend root directory
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent

# Global instance
gemini_translation_service = GeminiTranslationService(
    cache_dir=str(_BACKEND_ROOT / "translation_cache")
)

