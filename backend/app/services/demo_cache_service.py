"""
Demo Cache Service
Caches questions, answers, and voice synthesis for quick demo presentations.
Persists across server restarts using JSON files.
"""
import os
import json
import hashlib
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime


class DemoCacheService:
    """Service for caching demo questions, answers, and synthesized voice"""
    
    # Predefined simple Hindi demo questions
    HINDI_DEMO_QUESTIONS = [
        "मेरे बेटे का नाम क्या है",
        "मेरे डॉक्टर की जानकारी दो",
        "मेरी दवाई कब लेनी है",
        "मेरा घर कहाँ है",
        "मेरे इंश्योरेंस के बारे में जानकारी दो",
    ]
    
    ENGLISH_DEMO_QUESTIONS = [
        "What is my son's name",
        "Give me information about my doctor",
        "When should I take my medicine",
        "Where is my home",
        "Give me information about my insurance",
    ]
    
    def __init__(self, cache_dir: str = "./demo_cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Subdirectories
        self.qa_cache_dir = self.cache_dir / "qa"
        self.voice_cache_dir = self.cache_dir / "voice"
        self.test_voice_dir = self.cache_dir / "test_voice"
        
        self.qa_cache_dir.mkdir(exist_ok=True)
        self.voice_cache_dir.mkdir(exist_ok=True)
        self.test_voice_dir.mkdir(exist_ok=True)
        
        # In-memory cache for faster access
        self._qa_cache: Dict[str, Dict] = {}
        self._load_qa_cache()
    
    def _get_cache_key(self, text: str, language: str = "") -> str:
        """Generate a unique cache key"""
        content = f"{text}:{language}".lower().strip()
        return hashlib.md5(content.encode()).hexdigest()
    
    def _load_qa_cache(self):
        """Load Q&A cache from disk"""
        cache_file = self.qa_cache_dir / "qa_cache.json"
        if cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    self._qa_cache = json.load(f)
            except:
                self._qa_cache = {}
    
    def _save_qa_cache(self):
        """Save Q&A cache to disk"""
        cache_file = self.qa_cache_dir / "qa_cache.json"
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(self._qa_cache, f, ensure_ascii=False, indent=2)
    
    # ========== Test Voice Caching ==========
    
    def get_test_voice_path(self, user_id: int, language: str) -> Optional[str]:
        """Get cached test voice audio path if it exists"""
        audio_file = self.test_voice_dir / f"test_voice_{user_id}_{language}.wav"
        if audio_file.exists():
            return str(audio_file)
        return None
    
    def save_test_voice(self, user_id: int, language: str, audio_data: bytes) -> str:
        """Save test voice audio to cache"""
        audio_file = self.test_voice_dir / f"test_voice_{user_id}_{language}.wav"
        with open(audio_file, "wb") as f:
            f.write(audio_data)
        return str(audio_file)
    
    def delete_test_voice(self, user_id: int, language: str = None):
        """Delete cached test voice"""
        if language:
            audio_file = self.test_voice_dir / f"test_voice_{user_id}_{language}.wav"
            if audio_file.exists():
                audio_file.unlink()
        else:
            # Delete all languages
            for lang in ["hi", "en"]:
                audio_file = self.test_voice_dir / f"test_voice_{user_id}_{lang}.wav"
                if audio_file.exists():
                    audio_file.unlink()
    
    # ========== Demo Q&A Caching ==========
    
    def get_demo_questions(self, language: str) -> List[str]:
        """Get predefined demo questions for a language"""
        if language == "hi":
            return self.HINDI_DEMO_QUESTIONS.copy()
        return self.ENGLISH_DEMO_QUESTIONS.copy()
    
    def get_cached_answer(self, question: str, language: str, user_id: int) -> Optional[Dict]:
        """Get cached answer for a question"""
        cache_key = self._get_cache_key(f"{user_id}:{question}", language)
        
        if cache_key in self._qa_cache:
            cached = self._qa_cache[cache_key]
            # Check if voice audio still exists
            if cached.get("voice_path") and Path(cached["voice_path"]).exists():
                return cached
            elif cached.get("answer"):
                # Answer exists but voice needs regeneration
                return {"answer": cached["answer"], "voice_path": None}
        
        return None
    
    def cache_answer(
        self, 
        question: str, 
        answer: str, 
        language: str, 
        user_id: int,
        voice_path: Optional[str] = None
    ) -> str:
        """Cache an answer (and optionally voice) for a question"""
        cache_key = self._get_cache_key(f"{user_id}:{question}", language)
        
        self._qa_cache[cache_key] = {
            "question": question,
            "answer": answer,
            "language": language,
            "user_id": user_id,
            "voice_path": voice_path,
            "cached_at": datetime.now().isoformat()
        }
        
        self._save_qa_cache()
        return cache_key
    
    def cache_voice_for_answer(self, question: str, language: str, user_id: int, audio_data: bytes) -> str:
        """Cache voice synthesis for a cached answer"""
        cache_key = self._get_cache_key(f"{user_id}:{question}", language)
        
        # Save audio file
        audio_file = self.voice_cache_dir / f"{cache_key}.wav"
        with open(audio_file, "wb") as f:
            f.write(audio_data)
        
        # Update cache with voice path
        if cache_key in self._qa_cache:
            self._qa_cache[cache_key]["voice_path"] = str(audio_file)
            self._save_qa_cache()
        
        return str(audio_file)
    
    def get_cached_voice(self, question: str, language: str, user_id: int) -> Optional[bytes]:
        """Get cached voice audio for a question"""
        cache_key = self._get_cache_key(f"{user_id}:{question}", language)
        
        if cache_key in self._qa_cache:
            voice_path = self._qa_cache[cache_key].get("voice_path")
            if voice_path and Path(voice_path).exists():
                with open(voice_path, "rb") as f:
                    return f.read()
        
        return None
    
    def clear_user_cache(self, user_id: int):
        """Clear all cached data for a user"""
        # Clear Q&A cache
        keys_to_delete = [
            k for k, v in self._qa_cache.items() 
            if v.get("user_id") == user_id
        ]
        for key in keys_to_delete:
            # Delete voice file if exists
            voice_path = self._qa_cache[key].get("voice_path")
            if voice_path and Path(voice_path).exists():
                Path(voice_path).unlink()
            del self._qa_cache[key]
        
        self._save_qa_cache()
        
        # Delete test voice
        self.delete_test_voice(user_id)
    
    def get_all_cached_qa(self, user_id: int, language: str) -> List[Dict]:
        """Get all cached Q&A for a user"""
        result = []
        for cache_data in self._qa_cache.values():
            if cache_data.get("user_id") == user_id and cache_data.get("language") == language:
                result.append({
                    "question": cache_data["question"],
                    "answer": cache_data["answer"],
                    "has_voice": bool(cache_data.get("voice_path") and Path(cache_data["voice_path"]).exists())
                })
        return result


# Get the backend root directory (where main.py is)
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent

# Global instance with absolute path
demo_cache_service = DemoCacheService(cache_dir=str(_BACKEND_ROOT / "demo_cache"))

