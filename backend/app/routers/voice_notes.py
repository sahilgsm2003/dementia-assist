from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import schemas
from app.services.auth_service import get_current_user
from app.services import voice_note_service

router = APIRouter(prefix="/voice-notes", tags=["voice-notes"])

# Configure upload directory
UPLOAD_ROOT = Path(__file__).resolve().parent.parent.parent / "uploads"
VOICE_UPLOAD_SUBDIR = "voice_notes"
VOICE_UPLOAD_DIR = UPLOAD_ROOT / VOICE_UPLOAD_SUBDIR
VOICE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _build_audio_url(request: Request, relative_path: str) -> str:
    return str(request.url_for("uploads", path=relative_path))


@router.post(
    "/",
    response_model=schemas.VoiceNote,
    status_code=status.HTTP_201_CREATED,
)
async def create_voice_note(
    request: Request,
    audio_file: UploadFile = File(...),
    description: Optional[str] = Form(default=None),
    memory_id: Optional[int] = Form(default=None),
    person_id: Optional[str] = Form(default=None),
    reminder_id: Optional[int] = Form(default=None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a voice note"""
    try:
        # Validate file type
        if not audio_file.content_type or not audio_file.content_type.startswith("audio/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only audio files are supported"
            )

        voice_note = voice_note_service.create_voice_note(
            user_id=current_user.id,
            audio_file=audio_file,
            description=description,
            memory_id=memory_id,
            person_id=person_id,
            reminder_id=reminder_id,
            upload_root=UPLOAD_ROOT,
            db=db,
        )

        return schemas.VoiceNote(
            id=voice_note.id,
            audio_url=_build_audio_url(request, voice_note.audio_path),
            description=voice_note.description,
            memory_id=voice_note.memory_id,
            person_id=voice_note.person_id,
            reminder_id=voice_note.reminder_id,
            created_at=voice_note.created_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading voice note: {str(e)}"
        )


@router.get("/{voice_note_id}", response_class=FileResponse)
async def get_voice_note(
    voice_note_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get voice note audio file"""
    voice_note = voice_note_service.get_voice_note(
        voice_note_id=voice_note_id,
        user_id=current_user.id,
        db=db,
    )

    if not voice_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice note not found"
        )

    file_path = UPLOAD_ROOT / voice_note.audio_path
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found"
        )

    return FileResponse(
        path=str(file_path),
        media_type="audio/webm",
        filename=f"voice-note-{voice_note_id}.webm"
    )


@router.get("/", response_model=List[schemas.VoiceNote])
async def list_voice_notes(
    request: Request,
    memory_id: Optional[int] = Query(default=None),
    person_id: Optional[str] = Query(default=None),
    reminder_id: Optional[int] = Query(default=None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List voice notes with optional filters"""
    voice_notes = voice_note_service.list_voice_notes(
        user_id=current_user.id,
        memory_id=memory_id,
        person_id=person_id,
        reminder_id=reminder_id,
        db=db,
    )

    return [
        schemas.VoiceNote(
            id=vn.id,
            audio_url=_build_audio_url(request, vn.audio_path),
            description=vn.description,
            memory_id=vn.memory_id,
            person_id=vn.person_id,
            reminder_id=vn.reminder_id,
            created_at=vn.created_at,
        )
        for vn in voice_notes
    ]


@router.delete("/{voice_note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_voice_note(
    voice_note_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a voice note"""
    voice_note_service.delete_voice_note(
        voice_note_id=voice_note_id,
        user_id=current_user.id,
        upload_root=UPLOAD_ROOT,
        db=db,
    )

