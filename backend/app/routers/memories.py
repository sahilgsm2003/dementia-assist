from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile, Request
from fastapi import status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import schemas
from app.services.auth_service import get_current_user
from app.services import memory_service

router = APIRouter(prefix="/memories", tags=["memories"])

UPLOAD_ROOT = Path(__file__).resolve().parent.parent.parent / "uploads"


def _build_image_url(request: Request, relative_path: str) -> str:
    return str(request.url_for("uploads", path=relative_path))


@router.post(
    "/photos",
    response_model=schemas.MemoryPhoto,
    status_code=status.HTTP_201_CREATED,
)
async def create_memory_photo(
    request: Request,
    description: str = Form(default=None),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memory = memory_service.create_memory_photo(
        user_id=current_user.id,
        description=description,
        file=file,
        upload_root=UPLOAD_ROOT,
        db=db,
    )
    return schemas.MemoryPhoto(
        id=memory.id,
        description=memory.description,
        image_url=_build_image_url(request, memory.image_path),
        created_at=memory.created_at,
    )


@router.get("/photos", response_model=List[schemas.MemoryPhoto])
async def list_memory_photos(
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memories = memory_service.list_memory_photos(user_id=current_user.id, db=db)
    return [
        schemas.MemoryPhoto(
            id=memory.id,
            description=memory.description,
            image_url=_build_image_url(request, memory.image_path),
            created_at=memory.created_at,
        )
        for memory in memories
    ]


@router.post("/photos/search", response_model=schemas.MemoryPhotoSearchResponse)
async def search_memory_photos(
    request: Request,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    matches = memory_service.find_matching_memories(
        user_id=current_user.id,
        file=file,
        db=db,
    )

    responses = [
        schemas.MemoryPhotoMatch(
            image_url=_build_image_url(request, memory.image_path),
            description=memory.description,
            created_at=memory.created_at,
            confidence=max(0.0, 1.0 - distance),
        )
        for memory, distance in matches
    ]

    return schemas.MemoryPhotoSearchResponse(matches=responses)

