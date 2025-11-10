from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.models import VoiceNote


def _ensure_directory(upload_root: Path) -> Path:
    upload_dir = upload_root / "voice_notes"
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def _save_audio_file(upload_dir: Path, file: UploadFile) -> str:
    # Get file extension or default to .webm
    suffix = Path(file.filename or "").suffix or ".webm"
    filename = f"{uuid4().hex}{suffix}"
    destination = upload_dir / filename
    
    with destination.open("wb") as buffer:
        buffer.write(file.file.read())
    
    # Reset file pointer
    file.file.seek(0)
    
    # Return relative path
    return f"voice_notes/{filename}"


def create_voice_note(
    *,
    user_id: int,
    audio_file: UploadFile,
    description: Optional[str],
    memory_id: Optional[int],
    person_id: Optional[str],
    reminder_id: Optional[int],
    upload_root: Path,
    db: Session,
) -> VoiceNote:
    """Create a new voice note"""
    upload_dir = _ensure_directory(upload_root)
    relative_path = _save_audio_file(upload_dir, audio_file)

    voice_note = VoiceNote(
        user_id=user_id,
        audio_path=relative_path,
        description=description,
        memory_id=memory_id,
        person_id=person_id,
        reminder_id=reminder_id,
    )
    
    db.add(voice_note)
    db.commit()
    db.refresh(voice_note)
    return voice_note


def get_voice_note(
    *,
    voice_note_id: int,
    user_id: int,
    db: Session,
) -> Optional[VoiceNote]:
    """Get a voice note by ID"""
    return db.query(VoiceNote).filter(
        VoiceNote.id == voice_note_id,
        VoiceNote.user_id == user_id,
    ).first()


def list_voice_notes(
    *,
    user_id: int,
    memory_id: Optional[int] = None,
    person_id: Optional[str] = None,
    reminder_id: Optional[int] = None,
    db: Session,
) -> List[VoiceNote]:
    """List voice notes with optional filters"""
    query = db.query(VoiceNote).filter(VoiceNote.user_id == user_id)
    
    if memory_id is not None:
        query = query.filter(VoiceNote.memory_id == memory_id)
    
    if person_id is not None:
        query = query.filter(VoiceNote.person_id == person_id)
    
    if reminder_id is not None:
        query = query.filter(VoiceNote.reminder_id == reminder_id)
    
    return query.order_by(VoiceNote.created_at.desc()).all()


def delete_voice_note(
    *,
    voice_note_id: int,
    user_id: int,
    upload_root: Path,
    db: Session,
) -> None:
    """Delete a voice note and its file"""
    voice_note = db.query(VoiceNote).filter(
        VoiceNote.id == voice_note_id,
        VoiceNote.user_id == user_id,
    ).first()
    
    if not voice_note:
        return
    
    # Delete file
    file_path = upload_root / voice_note.audio_path
    if file_path.exists():
        file_path.unlink()
    
    # Delete database record
    db.delete(voice_note)
    db.commit()

