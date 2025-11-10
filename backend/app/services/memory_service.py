import io
import os
from pathlib import Path
from typing import List, Tuple
from uuid import uuid4

import face_recognition  # type: ignore[import-untyped]
import numpy as np
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.models import MemoryPhoto


MEMORY_UPLOAD_SUBDIR = "memory_photos"


def _ensure_directory(root_dir: Path) -> Path:
    upload_dir = root_dir / MEMORY_UPLOAD_SUBDIR
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def _save_file(upload_dir: Path, file: UploadFile) -> str:
    suffix = Path(file.filename or "").suffix or ".jpg"
    filename = f"{uuid4().hex}{suffix}"
    destination = upload_dir / filename
    with destination.open("wb") as buffer:
        buffer.write(file.file.read())
    # Reset file pointer for callers that reuse the object
    file.file.seek(0)
    # Return relative path so we can build URLs later
    return f"{MEMORY_UPLOAD_SUBDIR}/{filename}"


def _encode_face(file: UploadFile) -> bytes | None:
    image_bytes = file.file.read()
    file.file.seek(0)

    if not image_bytes:
        return None

    try:
        image = face_recognition.load_image_file(io.BytesIO(image_bytes))
    except Exception:
        return None

    encodings = face_recognition.face_encodings(image)
    if not encodings:
        return None

    return encodings[0].tobytes()


def create_memory_photo(
    *,
    user_id: int,
    description: str | None,
    file: UploadFile,
    upload_root: Path,
    db: Session,
) -> MemoryPhoto:
    upload_dir = _ensure_directory(upload_root)
    relative_path = _save_file(upload_dir, file)
    encoding = _encode_face(file)

    memory = MemoryPhoto(
        user_id=user_id,
        image_path=relative_path,
        description=description,
        face_encoding=encoding,
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory


def list_memory_photos(*, user_id: int, db: Session) -> List[MemoryPhoto]:
    return (
        db.query(MemoryPhoto)
        .filter(MemoryPhoto.user_id == user_id)
        .order_by(MemoryPhoto.created_at.desc())
        .all()
    )


def find_matching_memories(
    *,
    user_id: int,
    file: UploadFile,
    db: Session,
    tolerance: float = 0.6,
    max_results: int = 10,
) -> List[Tuple[MemoryPhoto, float]]:
    query_bytes = file.file.read()
    file.file.seek(0)

    if not query_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file",
        )

    try:
        image = face_recognition.load_image_file(io.BytesIO(query_bytes))
        query_encodings = face_recognition.face_encodings(image)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to process image",
        )

    if not query_encodings:
        return []

    query_encoding = query_encodings[0]

    candidates = (
        db.query(MemoryPhoto)
        .filter(
            MemoryPhoto.user_id == user_id,
            MemoryPhoto.face_encoding.isnot(None),
        )
        .all()
    )

    matches: List[Tuple[MemoryPhoto, float]] = []
    for candidate in candidates:
        if candidate.face_encoding is None:
            continue

        stored_encoding = np.frombuffer(candidate.face_encoding, dtype=np.float64)
        distance = face_recognition.face_distance([stored_encoding], query_encoding)[0]
        if distance <= tolerance:
            matches.append((candidate, float(distance)))

    matches.sort(key=lambda item: item[1])
    return matches[:max_results]

