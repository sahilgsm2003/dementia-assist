from typing import List, Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import schemas
from app.services import location_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("/", response_model=List[schemas.MemoryPlace])
async def list_locations(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    places = location_service.list_places(user_id=current_user.id, db=db)
    return [
        schemas.MemoryPlace(
            id=place.id,
            name=place.name,
            description=place.description,
            latitude=place.latitude,
            longitude=place.longitude,
            created_at=place.created_at,
        )
        for place in places
    ]


@router.post(
    "/",
    response_model=schemas.MemoryPlace,
    status_code=status.HTTP_201_CREATED,
)
async def create_location(
    payload: schemas.MemoryPlaceCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    place = location_service.create_place(
        user_id=current_user.id,
        payload=payload,
        db=db,
    )
    return schemas.MemoryPlace(
        id=place.id,
        name=place.name,
        description=place.description,
        latitude=place.latitude,
        longitude=place.longitude,
        created_at=place.created_at,
    )


@router.patch("/{place_id}", response_model=schemas.MemoryPlace)
async def update_location(
    place_id: int,
    payload: schemas.MemoryPlaceUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    place = location_service.update_place(
        place_id=place_id,
        user_id=current_user.id,
        payload=payload,
        db=db,
    )
    return schemas.MemoryPlace(
        id=place.id,
        name=place.name,
        description=place.description,
        latitude=place.latitude,
        longitude=place.longitude,
        created_at=place.created_at,
    )


@router.delete("/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    place_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    location_service.delete_place(place_id=place_id, user_id=current_user.id, db=db)


@router.post("/live", response_model=schemas.LiveLocationResponse)
async def update_live_location(
    payload: schemas.LiveLocationUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    location = location_service.update_live_location(
        user_id=current_user.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        accuracy=payload.accuracy,
        db=db,
    )
    return schemas.LiveLocationResponse(
        user_id=location.user_id,
        latitude=location.latitude,
        longitude=location.longitude,
        accuracy=location.accuracy,
        updated_at=location.updated_at,
    )


@router.get("/live", response_model=Optional[schemas.LiveLocationResponse])
async def get_live_location(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    location = location_service.get_live_location(user_id=current_user.id, db=db)
    if location is None:
        return None

    return schemas.LiveLocationResponse(
        user_id=location.user_id,
        latitude=location.latitude,
        longitude=location.longitude,
        accuracy=location.accuracy,
        updated_at=location.updated_at,
    )

