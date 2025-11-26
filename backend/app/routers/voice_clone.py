"""
Voice Cloning API endpoints
Allows users to upload voice samples and synthesize speech with cloned voice
"""
import os
import shutil
import asyncio
from pathlib import Path
from typing import Optional, List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import io

# Processing delay for cached responses to show backend activity (in seconds)
CACHE_PROCESSING_DELAY = 3.5

from app.db.database import get_db
from app.services.auth_service import get_current_user
from app.services.voice_clone_service import voice_clone_service
from app.services.demo_cache_service import demo_cache_service
from app.models.models import User, VoiceProfile

router = APIRouter(prefix="/voice-clone", tags=["voice-clone"])

# Upload directory for voice samples
UPLOAD_ROOT = Path(__file__).resolve().parent.parent.parent / "uploads"
VOICE_SAMPLES_DIR = UPLOAD_ROOT / "voice_samples"
VOICE_SAMPLES_DIR.mkdir(parents=True, exist_ok=True)


class SynthesizeRequest(BaseModel):
    """Request body for text-to-speech synthesis"""
    text: str
    language: Optional[str] = None  # If None, uses user's preference


class VoiceProfileResponse(BaseModel):
    """Response for voice profile operations"""
    id: int
    user_id: int
    language: str
    is_active: bool
    sample_audio_url: str

    class Config:
        from_attributes = True


class SynthesisResponse(BaseModel):
    """Response for synthesis operations"""
    success: bool
    audio_url: Optional[str] = None
    duration: Optional[float] = None
    error: Optional[str] = None


@router.get("/status")
async def get_voice_clone_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the status of voice cloning for the current user.
    Returns whether they have a voice profile and model status.
    """
    # Check if user has a voice profile
    voice_profile = db.query(VoiceProfile).filter(
        VoiceProfile.user_id == current_user.id
    ).first()
    
    model_status = voice_clone_service.get_model_status()
    
    return {
        "has_voice_profile": voice_profile is not None,
        "voice_profile": {
            "id": voice_profile.id,
            "language": voice_profile.language,
            "is_active": voice_profile.is_active == 1,
            "sample_audio_url": f"/uploads/{voice_profile.sample_audio_path}"
        } if voice_profile else None,
        "model_status": model_status
    }


@router.post("/upload-sample")
async def upload_voice_sample(
    audio_file: UploadFile = File(..., description="Voice sample audio (6-30 seconds of clear speech)"),
    language: str = Form(default="en", description="Language of the voice sample (en or hi)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a voice sample for voice cloning.
    
    Requirements:
    - Audio should be 6-30 seconds of clear speech
    - Supported formats: WAV, MP3, M4A, OGG, WEBM
    - Single speaker (the voice you want to clone)
    - Minimal background noise
    
    The audio will be preprocessed for optimal voice cloning.
    """
    # Validate language
    if language not in ["en", "hi"]:
        raise HTTPException(status_code=400, detail="Language must be 'en' or 'hi'")
    
    # Validate file type
    allowed_extensions = {".wav", ".mp3", ".m4a", ".ogg", ".webm", ".flac"}
    file_ext = Path(audio_file.filename or "").suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Save the uploaded file temporarily
        temp_filename = f"temp_{uuid4().hex}{file_ext}"
        temp_path = VOICE_SAMPLES_DIR / temp_filename
        
        with open(temp_path, "wb") as f:
            content = await audio_file.read()
            f.write(content)
        
        # Preprocess the audio
        processed_filename = f"voice_sample_{current_user.id}_{uuid4().hex}.wav"
        processed_path = VOICE_SAMPLES_DIR / processed_filename
        
        preprocess_result = voice_clone_service.preprocess_reference_audio(
            str(temp_path),
            str(processed_path)
        )
        
        # Clean up temp file
        temp_path.unlink(missing_ok=True)
        
        if not preprocess_result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=preprocess_result.get("error", "Failed to process audio")
            )
        
        # Validate the processed audio
        validation = voice_clone_service.validate_audio_file(str(processed_path))
        if not validation.get("valid"):
            processed_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=400,
                detail=validation.get("error", "Audio validation failed")
            )
        
        # Check for existing voice profile and delete old file
        existing_profile = db.query(VoiceProfile).filter(
            VoiceProfile.user_id == current_user.id
        ).first()
        
        if existing_profile:
            # Delete old audio file
            old_path = UPLOAD_ROOT / existing_profile.sample_audio_path
            if old_path.exists():
                old_path.unlink(missing_ok=True)
            
            # Update existing profile
            existing_profile.sample_audio_path = f"voice_samples/{processed_filename}"
            existing_profile.language = language
            existing_profile.is_active = 1
            db.commit()
            db.refresh(existing_profile)
            voice_profile = existing_profile
        else:
            # Create new voice profile
            voice_profile = VoiceProfile(
                user_id=current_user.id,
                sample_audio_path=f"voice_samples/{processed_filename}",
                language=language,
                is_active=1
            )
            db.add(voice_profile)
            db.commit()
            db.refresh(voice_profile)
        
        return {
            "success": True,
            "message": "Voice sample uploaded successfully",
            "voice_profile": {
                "id": voice_profile.id,
                "language": voice_profile.language,
                "is_active": voice_profile.is_active == 1,
                "sample_audio_url": f"/uploads/{voice_profile.sample_audio_path}",
                "duration": validation.get("duration")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading voice sample: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to upload voice sample: {str(e)}")


@router.post("/synthesize", response_model=SynthesisResponse)
async def synthesize_speech(
    request: SynthesizeRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Synthesize speech using the user's cloned voice.
    
    The text will be spoken in the cloned voice.
    Language can be specified or will use the user's preference.
    """
    # Get user's voice profile
    voice_profile = db.query(VoiceProfile).filter(
        VoiceProfile.user_id == current_user.id,
        VoiceProfile.is_active == 1
    ).first()
    
    if not voice_profile:
        raise HTTPException(
            status_code=404,
            detail="No voice profile found. Please upload a voice sample first."
        )
    
    # Determine language
    language = request.language or current_user.language or "en"
    if language not in ["en", "hi"]:
        language = "en"
    
    # Get the speaker audio path
    speaker_audio_path = UPLOAD_ROOT / voice_profile.sample_audio_path
    if not speaker_audio_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Voice sample file not found. Please re-upload your voice sample."
        )
    
    # Synthesize speech
    result = voice_clone_service.synthesize_speech(
        text=request.text,
        speaker_audio_path=str(speaker_audio_path),
        language=language,
        use_cache=True
    )
    
    if not result.get("success"):
        return SynthesisResponse(
            success=False,
            error=result.get("error", "Synthesis failed")
        )
    
    # Copy the generated audio to uploads for serving
    generated_path = Path(result["audio_path"])
    serve_filename = f"tts_{current_user.id}_{uuid4().hex}.wav"
    serve_path = UPLOAD_ROOT / "voice_cache" / serve_filename
    serve_path.parent.mkdir(parents=True, exist_ok=True)
    
    shutil.copy(generated_path, serve_path)
    
    return SynthesisResponse(
        success=True,
        audio_url=f"/uploads/voice_cache/{serve_filename}",
        duration=result.get("duration")
    )


@router.post("/synthesize-stream")
async def synthesize_speech_stream(
    request: SynthesizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Synthesize speech and return audio as a streaming response.
    Useful for direct playback in the browser.
    """
    try:
        # Get user's voice profile
        voice_profile = db.query(VoiceProfile).filter(
            VoiceProfile.user_id == current_user.id,
            VoiceProfile.is_active == 1
        ).first()
        
        if not voice_profile:
            raise HTTPException(
                status_code=404,
                detail="No voice profile found. Please upload a voice sample first."
            )
        
        # Determine language
        language = request.language or current_user.language or "en"
        if language not in ["en", "hi"]:
            language = "en"
        
        # Get the speaker audio path
        speaker_audio_path = UPLOAD_ROOT / voice_profile.sample_audio_path
        if not speaker_audio_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Voice sample file not found."
            )
        
        # Synthesize speech
        audio_bytes = voice_clone_service.synthesize_speech_stream(
            text=request.text,
            speaker_audio_path=str(speaker_audio_path),
            language=language
        )
        
        if audio_bytes is None:
            raise HTTPException(status_code=500, detail="Speech synthesis failed")
        
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={
                "Content-Disposition": "inline",
                "Cache-Control": "no-cache"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[VoiceClone] Synthesis stream error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")


@router.delete("/profile")
async def delete_voice_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the user's voice profile and associated audio sample.
    """
    voice_profile = db.query(VoiceProfile).filter(
        VoiceProfile.user_id == current_user.id
    ).first()
    
    if not voice_profile:
        raise HTTPException(status_code=404, detail="No voice profile found")
    
    # Delete the audio file
    audio_path = UPLOAD_ROOT / voice_profile.sample_audio_path
    if audio_path.exists():
        audio_path.unlink(missing_ok=True)
    
    # Delete the database record
    db.delete(voice_profile)
    db.commit()
    
    return {"success": True, "message": "Voice profile deleted successfully"}


@router.put("/profile/toggle")
async def toggle_voice_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle the voice profile active/inactive.
    When inactive, the chatbot will use browser TTS instead.
    """
    voice_profile = db.query(VoiceProfile).filter(
        VoiceProfile.user_id == current_user.id
    ).first()
    
    if not voice_profile:
        raise HTTPException(status_code=404, detail="No voice profile found")
    
    # Toggle active state
    voice_profile.is_active = 0 if voice_profile.is_active == 1 else 1
    db.commit()
    db.refresh(voice_profile)
    
    return {
        "success": True,
        "is_active": voice_profile.is_active == 1,
        "message": f"Voice cloning {'enabled' if voice_profile.is_active == 1 else 'disabled'}"
    }


@router.post("/preload-model")
async def preload_model(
    current_user: User = Depends(get_current_user)
):
    """
    Preload the voice cloning model.
    This can be called in advance to avoid latency on first synthesis.
    The model is ~1.8GB and will be downloaded on first load.
    """
    try:
        # This will trigger model download/loading
        voice_clone_service._load_model()
        return {
            "success": True,
            "message": "Voice cloning model loaded successfully",
            "status": voice_clone_service.get_model_status()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")


# ========== PERSISTENT CACHING FOR DEMO ==========

class TestVoiceRequest(BaseModel):
    """Request for test voice synthesis"""
    language: str = "hi"
    force_regenerate: bool = False


@router.post("/test-voice")
async def test_voice_cached(
    request: TestVoiceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get test voice audio. Uses persistent cache - same audio every time.
    Only regenerates if force_regenerate=True or cache doesn't exist.
    """
    # Get user's voice profile
    voice_profile = db.query(VoiceProfile).filter(
        VoiceProfile.user_id == current_user.id,
        VoiceProfile.is_active == 1
    ).first()
    
    if not voice_profile:
        raise HTTPException(status_code=404, detail="No voice profile found")
    
    language = request.language if request.language in ["hi", "en"] else "hi"
    
    # Check persistent cache first (unless force regenerate)
    if not request.force_regenerate:
        cached_path = demo_cache_service.get_test_voice_path(current_user.id, language)
        if cached_path and Path(cached_path).exists():
            print(f"[VoiceClone] Serving cached test voice (with {CACHE_PROCESSING_DELAY}s processing delay): {cached_path}")
            # Add processing delay for cached responses
            await asyncio.sleep(CACHE_PROCESSING_DELAY)
            with open(cached_path, "rb") as f:
                audio_bytes = f.read()
            return StreamingResponse(
                io.BytesIO(audio_bytes),
                media_type="audio/wav",
                headers={
                    "Content-Disposition": "inline",
                    "X-Cache-Status": "HIT",
                    "X-Processing-Delayed": "true"
                }
            )
    
    # Generate new test voice
    test_text = "यह आपकी आवाज़ है आप मुझे सुन सकते हैं" if language == "hi" else "Hello this is your cloned voice speaking"
    
    speaker_audio_path = UPLOAD_ROOT / voice_profile.sample_audio_path
    if not speaker_audio_path.exists():
        raise HTTPException(status_code=404, detail="Voice sample file not found")
    
    print(f"[VoiceClone] Generating test voice for user {current_user.id}")
    
    audio_bytes = voice_clone_service.synthesize_speech_stream(
        text=test_text,
        speaker_audio_path=str(speaker_audio_path),
        language=language
    )
    
    if audio_bytes is None:
        raise HTTPException(status_code=500, detail="Speech synthesis failed")
    
    # Save to persistent cache
    demo_cache_service.save_test_voice(current_user.id, language, audio_bytes)
    print(f"[VoiceClone] Test voice cached for user {current_user.id}")
    
    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/wav",
        headers={
            "Content-Disposition": "inline",
            "X-Cache-Status": "MISS"
        }
    )


@router.get("/demo-questions")
async def get_demo_questions(
    language: str = "hi",
    current_user: User = Depends(get_current_user)
):
    """
    Get predefined demo questions for the chatbot.
    These are simple questions designed for quick demo presentations.
    """
    questions = demo_cache_service.get_demo_questions(language)
    
    # Also return any cached Q&A for this user
    cached_qa = demo_cache_service.get_all_cached_qa(current_user.id, language)
    
    return {
        "questions": questions,
        "cached_qa": cached_qa,
        "language": language
    }


class CacheDemoRequest(BaseModel):
    """Request to cache a demo Q&A"""
    question: str
    answer: str
    language: str = "hi"


@router.post("/cache-demo-answer")
async def cache_demo_answer(
    request: CacheDemoRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cache a demo question and answer. Also generates and caches the voice.
    Use this after getting a good response that you want to reuse in demos.
    """
    # Get user's voice profile
    voice_profile = db.query(VoiceProfile).filter(
        VoiceProfile.user_id == current_user.id,
        VoiceProfile.is_active == 1
    ).first()
    
    # Cache the Q&A
    cache_key = demo_cache_service.cache_answer(
        question=request.question,
        answer=request.answer,
        language=request.language,
        user_id=current_user.id
    )
    
    voice_cached = False
    
    # If voice profile exists, also cache the synthesized voice
    if voice_profile:
        speaker_audio_path = UPLOAD_ROOT / voice_profile.sample_audio_path
        if speaker_audio_path.exists():
            print(f"[VoiceClone] Caching voice for demo answer: {request.question[:30]}...")
            
            audio_bytes = voice_clone_service.synthesize_speech_stream(
                text=request.answer,
                speaker_audio_path=str(speaker_audio_path),
                language=request.language
            )
            
            if audio_bytes:
                demo_cache_service.cache_voice_for_answer(
                    question=request.question,
                    language=request.language,
                    user_id=current_user.id,
                    audio_data=audio_bytes
                )
                voice_cached = True
    
    return {
        "success": True,
        "cache_key": cache_key,
        "voice_cached": voice_cached,
        "message": "Demo answer cached successfully"
    }


@router.post("/get-cached-demo")
async def get_cached_demo(
    question: str,
    language: str = "hi",
    current_user: User = Depends(get_current_user)
):
    """
    Get a cached demo answer and voice for a question.
    Returns null if not cached. Adds processing delay for cached responses.
    """
    print(f"[Demo] Checking cache for: {question[:30]}...")
    cached = demo_cache_service.get_cached_answer(question, language, current_user.id)
    
    if not cached:
        print(f"[Demo] No cache found for: {question[:30]}")
        return {
            "found": False,
            "answer": None,
            "has_voice": False,
            "simulated": False
        }
    
    # Add processing delay for cached responses
    print(f"[Demo] Cache found! Adding {CACHE_PROCESSING_DELAY}s processing delay...")
    await asyncio.sleep(CACHE_PROCESSING_DELAY)
    
    has_voice = bool(cached.get("voice_path"))
    print(f"[Demo] Serving cached response. has_voice={has_voice}")
    
    return {
        "found": True,
        "answer": cached.get("answer"),
        "has_voice": has_voice,
        "simulated": True
    }


@router.post("/play-cached-voice")
async def play_cached_voice(
    question: str,
    language: str = "hi",
    current_user: User = Depends(get_current_user)
):
    """
    Get the cached voice audio for a demo question.
    Adds processing delay for cached responses.
    """
    try:
        print(f"[VoiceClone] Playing cached voice for question: {question[:30]}...")
        audio_bytes = demo_cache_service.get_cached_voice(question, language, current_user.id)
        
        if not audio_bytes:
            print(f"[VoiceClone] No cached voice found for: {question[:30]}")
            raise HTTPException(status_code=404, detail="No cached voice found for this question")
        
        # Add processing delay for cached responses
        print(f"[VoiceClone] Serving cached voice with {CACHE_PROCESSING_DELAY}s processing delay ({len(audio_bytes)} bytes)")
        await asyncio.sleep(CACHE_PROCESSING_DELAY)
        
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={
                "Content-Disposition": "inline",
                "X-Cache-Status": "HIT",
                "X-Processing-Delayed": "true"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[VoiceClone] Error playing cached voice: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to play cached voice: {str(e)}")


@router.delete("/clear-demo-cache")
async def clear_demo_cache(
    current_user: User = Depends(get_current_user)
):
    """
    Clear all demo cache for the current user.
    """
    demo_cache_service.clear_user_cache(current_user.id)
    return {
        "success": True,
        "message": "Demo cache cleared"
    }

