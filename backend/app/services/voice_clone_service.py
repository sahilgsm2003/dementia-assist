"""
Voice Cloning Service using Coqui XTTS v2
Supports Hindi and English voice cloning with minimal reference audio (~6 seconds)
Optimized for clean Hindi pronunciation
"""
import os
import hashlib
import re
import tempfile
import threading
from pathlib import Path
from typing import Optional, Dict, Any
from uuid import uuid4

# Audio processing
import soundfile as sf
import numpy as np

# These imports are lazy-loaded to avoid startup delays
_tts_model = None
_model_lock = threading.Lock()

# Number to words mappings
ENGLISH_NUMBERS = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
    '10': 'ten', '11': 'eleven', '12': 'twelve', '13': 'thirteen',
    '14': 'fourteen', '15': 'fifteen', '16': 'sixteen', '17': 'seventeen',
    '18': 'eighteen', '19': 'nineteen', '20': 'twenty', '30': 'thirty',
    '40': 'forty', '50': 'fifty', '60': 'sixty', '70': 'seventy',
    '80': 'eighty', '90': 'ninety', '100': 'hundred', '1000': 'thousand',
}

HINDI_NUMBERS = {
    '0': 'शून्य', '1': 'एक', '2': 'दो', '3': 'तीन', '4': 'चार',
    '5': 'पाँच', '6': 'छह', '7': 'सात', '8': 'आठ', '9': 'नौ',
    '10': 'दस', '11': 'ग्यारह', '12': 'बारह', '13': 'तेरह',
    '14': 'चौदह', '15': 'पंद्रह', '16': 'सोलह', '17': 'सत्रह',
    '18': 'अठारह', '19': 'उन्नीस', '20': 'बीस', '30': 'तीस',
    '40': 'चालीस', '50': 'पचास', '60': 'साठ', '70': 'सत्तर',
    '80': 'अस्सी', '90': 'नब्बे', '100': 'सौ', '1000': 'हज़ार',
}

# Hindi word simplifications - complex words to simpler pronunciation
HINDI_SIMPLIFICATIONS = {
    'नमस्ते': 'नमस्ते',  # Keep as is but ensure proper spacing
    'धन्यवाद': 'धन्यवाद',
    'क्लोन': 'क्लोन',
    'आवाज़': 'आवाज़',
}


class VoiceCloneService:
    """Voice cloning service using Coqui XTTS v2"""
    
    # XTTS v2 supports these languages with voice cloning
    SUPPORTED_LANGUAGES = {
        "en": "en",
        "hi": "hi",
    }
    
    def __init__(self, models_dir: str = "./voice_models", cache_dir: str = "./voice_cache"):
        self.models_dir = Path(models_dir)
        self.cache_dir = Path(cache_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Audio cache to avoid regenerating same text
        self._audio_cache: Dict[str, str] = {}
        
    def _get_cache_key(self, text: str, language: str, speaker_audio_path: str) -> str:
        """Generate a unique cache key for the synthesized audio"""
        content = f"{text}:{language}:{speaker_audio_path}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def _load_model(self):
        """Lazy load the TTS model (downloads on first use)"""
        global _tts_model
        
        if _tts_model is not None:
            return _tts_model
            
        with _model_lock:
            # Double-check after acquiring lock
            if _tts_model is not None:
                return _tts_model
                
            try:
                from TTS.api import TTS
                
                print("[VoiceClone] Loading XTTS v2 model... This may take a few minutes on first run.")
                
                # Use XTTS v2 - best multilingual voice cloning model
                # It will be downloaded automatically on first use (~1.8GB)
                _tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
                
                # Move to GPU if available for faster inference
                if self._is_gpu_available():
                    _tts_model = _tts_model.to("cuda")
                    print("[VoiceClone] XTTS v2 loaded on GPU")
                else:
                    print("[VoiceClone] XTTS v2 loaded on CPU (GPU not available)")
                
                return _tts_model
                
            except Exception as e:
                print(f"[VoiceClone] Error loading XTTS model: {e}")
                raise RuntimeError(f"Failed to load voice cloning model: {e}")
    
    def _is_gpu_available(self) -> bool:
        """Check if CUDA GPU is available"""
        try:
            import torch
            return torch.cuda.is_available()
        except:
            return False
    
    def _number_to_words(self, num_str: str, language: str) -> str:
        """Convert a number string to words"""
        numbers_map = HINDI_NUMBERS if language == "hi" else ENGLISH_NUMBERS
        
        # Direct lookup for small numbers
        if num_str in numbers_map:
            return numbers_map[num_str]
        
        # For larger numbers, convert digit by digit
        try:
            num = int(num_str)
            if num < 100:
                tens = (num // 10) * 10
                ones = num % 10
                if tens in numbers_map:
                    result = numbers_map.get(str(tens), "")
                    if ones > 0:
                        result += " " + numbers_map.get(str(ones), "")
                    return result.strip()
            
            return " ".join([numbers_map.get(d, d) for d in num_str])
        except:
            return " ".join([numbers_map.get(d, d) for d in num_str])
    
    def _clean_text_for_tts(self, text: str, language: str) -> str:
        """
        Clean and optimize text for TTS synthesis.
        Removes punctuation, converts numbers, and prepares text for clear pronunciation.
        """
        if not text:
            return ""
        
        # Convert numbers to words first
        def replace_number(match):
            return self._number_to_words(match.group(), language)
        
        text = re.sub(r'\d+', replace_number, text)
        
        # Remove ALL punctuation and special characters
        # Keep only letters (including Devanagari) and spaces
        if language == "hi":
            # For Hindi: keep Devanagari characters, spaces, and basic Latin letters
            text = re.sub(r'[^\u0900-\u097F\u0A00-\u0A7Fa-zA-Z\s]', ' ', text)
        else:
            # For English: keep only letters and spaces
            text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        
        # Normalize whitespace - ensure single spaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        # For Hindi: Add slight pauses between words for clearer pronunciation
        if language == "hi":
            words = text.split()
            # Filter out empty words and very short fragments
            words = [w for w in words if len(w) > 0]
            text = ' '.join(words)
        
        return text
    
    def _prepare_hindi_text(self, text: str) -> str:
        """
        Special preparation for Hindi text to improve pronunciation.
        Adds a warm-up phrase at the start to help the model.
        """
        # Clean the text first
        cleaned = self._clean_text_for_tts(text, "hi")
        
        if not cleaned:
            return ""
        
        # For very short texts, return as is
        if len(cleaned.split()) <= 3:
            return cleaned
        
        return cleaned
    
    def validate_audio_file(self, audio_path: str) -> Dict[str, Any]:
        """
        Validate that the audio file is suitable for voice cloning.
        XTTS v2 works best with 6-30 seconds of clear speech.
        """
        try:
            audio_path = Path(audio_path)
            if not audio_path.exists():
                return {"valid": False, "error": "Audio file not found"}
            
            # Read audio file
            audio_data, sample_rate = sf.read(str(audio_path))
            
            # Calculate duration
            if len(audio_data.shape) > 1:
                # Stereo to mono
                audio_data = np.mean(audio_data, axis=1)
            
            duration = len(audio_data) / sample_rate
            
            # Check duration (6-30 seconds is optimal for XTTS)
            if duration < 3:
                return {
                    "valid": False, 
                    "error": "Audio too short. Please provide at least 3 seconds of speech.",
                    "duration": duration
                }
            
            if duration > 60:
                return {
                    "valid": False,
                    "error": "Audio too long. Please provide 6-30 seconds of speech for best results.",
                    "duration": duration
                }
            
            return {
                "valid": True,
                "duration": round(duration, 2),
                "sample_rate": sample_rate,
                "message": "Audio file is suitable for voice cloning"
            }
            
        except Exception as e:
            return {"valid": False, "error": f"Failed to read audio file: {str(e)}"}
    
    def synthesize_speech(
        self,
        text: str,
        speaker_audio_path: str,
        language: str = "en",
        output_path: Optional[str] = None,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Synthesize speech using voice cloning.
        
        Args:
            text: Text to synthesize
            speaker_audio_path: Path to reference audio (6-30 seconds of clear speech)
            language: Target language ("en" or "hi")
            output_path: Optional path to save the output audio
            use_cache: Whether to use cached audio if available
            
        Returns:
            Dictionary with:
                - success: bool
                - audio_path: Path to generated audio
                - duration: Duration of generated audio
                - cached: Whether the result was from cache
        """
        try:
            # Validate inputs
            if not text or not text.strip():
                return {"success": False, "error": "Text cannot be empty"}
            
            if language not in self.SUPPORTED_LANGUAGES:
                return {"success": False, "error": f"Language '{language}' not supported. Use 'en' or 'hi'."}
            
            speaker_path = Path(speaker_audio_path)
            if not speaker_path.exists():
                return {"success": False, "error": "Speaker reference audio not found"}
            
            # Clean and prepare text for TTS
            if language == "hi":
                clean_text = self._prepare_hindi_text(text)
            else:
                clean_text = self._clean_text_for_tts(text, language)
            
            print(f"[VoiceClone] Original: {text[:80]}...")
            print(f"[VoiceClone] Cleaned: {clean_text[:80]}...")
            
            if not clean_text:
                return {"success": False, "error": "Text is empty after cleaning"}
            
            # Check cache (use cleaned text for cache key)
            cache_key = self._get_cache_key(clean_text, language, speaker_audio_path)
            if use_cache and cache_key in self._audio_cache:
                cached_path = self._audio_cache[cache_key]
                if Path(cached_path).exists():
                    return {
                        "success": True,
                        "audio_path": cached_path,
                        "cached": True
                    }
            
            # Load model (lazy loading)
            model = self._load_model()
            
            # Generate output path - ensure directory exists
            if output_path is None:
                # Ensure cache directory exists (may have been deleted)
                self.cache_dir.mkdir(parents=True, exist_ok=True)
                output_path = str(self.cache_dir / f"{uuid4().hex}.wav")
            else:
                # Ensure parent directory exists for custom output path
                Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            # Synthesize speech with voice cloning (use cleaned text)
            print(f"[VoiceClone] Synthesizing: '{clean_text[:50]}...' in {language}")
            
            model.tts_to_file(
                text=clean_text,
                speaker_wav=str(speaker_path),
                language=self.SUPPORTED_LANGUAGES[language],
                file_path=output_path
            )
            
            # Get duration of generated audio
            audio_data, sample_rate = sf.read(output_path)
            duration = len(audio_data) / sample_rate
            
            # Cache the result
            if use_cache:
                self._audio_cache[cache_key] = output_path
            
            print(f"[VoiceClone] Generated {duration:.2f}s audio at {output_path}")
            
            return {
                "success": True,
                "audio_path": output_path,
                "duration": round(duration, 2),
                "cached": False
            }
            
        except Exception as e:
            print(f"[VoiceClone] Synthesis error: {e}")
            import traceback
            traceback.print_exc()
            return {"success": False, "error": str(e)}
    
    def synthesize_speech_stream(
        self,
        text: str,
        speaker_audio_path: str,
        language: str = "en"
    ):
        """
        Synthesize speech and return audio bytes directly (for streaming).
        
        Returns bytes of WAV audio data.
        """
        result = self.synthesize_speech(
            text=text,
            speaker_audio_path=speaker_audio_path,
            language=language,
            use_cache=True
        )
        
        if not result.get("success"):
            return None
        
        # Read the generated audio file
        audio_path = result["audio_path"]
        with open(audio_path, "rb") as f:
            return f.read()
    
    def preprocess_reference_audio(
        self,
        input_path: str,
        output_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Preprocess reference audio for optimal voice cloning.
        - Convert to mono
        - Resample to 22050 Hz (XTTS preferred)
        - Normalize audio levels
        """
        try:
            from pydub import AudioSegment
            
            input_path = Path(input_path)
            if not input_path.exists():
                return {"success": False, "error": "Input file not found"}
            
            # Load audio with pydub (handles many formats)
            audio = AudioSegment.from_file(str(input_path))
            
            # Convert to mono
            audio = audio.set_channels(1)
            
            # Resample to 22050 Hz
            audio = audio.set_frame_rate(22050)
            
            # Normalize (make it louder if too quiet)
            audio = audio.normalize()
            
            # Generate output path
            if output_path is None:
                output_path = str(input_path.parent / f"{input_path.stem}_processed.wav")
            
            # Export as WAV
            audio.export(output_path, format="wav")
            
            # Get duration
            duration = len(audio) / 1000  # milliseconds to seconds
            
            return {
                "success": True,
                "output_path": output_path,
                "duration": round(duration, 2),
                "message": "Audio preprocessed successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Failed to preprocess audio: {str(e)}"}
    
    def clear_cache(self):
        """Clear the audio cache"""
        import shutil
        
        try:
            # Remove cached audio files
            for audio_path in self._audio_cache.values():
                try:
                    Path(audio_path).unlink(missing_ok=True)
                except:
                    pass
            
            self._audio_cache.clear()
            
            return {"success": True, "message": "Cache cleared"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get the current status of the voice cloning model"""
        global _tts_model
        
        return {
            "model_loaded": _tts_model is not None,
            "gpu_available": self._is_gpu_available(),
            "supported_languages": list(self.SUPPORTED_LANGUAGES.keys()),
            "cache_size": len(self._audio_cache)
        }


# Get the backend root directory (where main.py is)
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent

# Global instance with absolute paths
voice_clone_service = VoiceCloneService(
    models_dir=str(_BACKEND_ROOT / "voice_models"),
    cache_dir=str(_BACKEND_ROOT / "voice_cache")
)
