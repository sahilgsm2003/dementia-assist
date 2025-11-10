from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import LiveLocation, MemoryPlace
from app.schemas import schemas


def list_places(*, user_id: int, db: Session) -> List[MemoryPlace]:
    return (
        db.query(MemoryPlace)
        .filter(MemoryPlace.user_id == user_id)
        .order_by(MemoryPlace.created_at.desc())
        .all()
    )


def create_place(
    *,
    user_id: int,
    payload: schemas.MemoryPlaceCreate,
    db: Session,
) -> MemoryPlace:
    place = MemoryPlace(
        user_id=user_id,
        name=payload.name,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(place)
    db.commit()
    db.refresh(place)
    return place


def update_place(
    *,
    place_id: int,
    user_id: int,
    payload: schemas.MemoryPlaceUpdate,
    db: Session,
) -> MemoryPlace:
    place = (
        db.query(MemoryPlace)
        .filter(MemoryPlace.id == place_id, MemoryPlace.user_id == user_id)
        .first()
    )
    if place is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(place, field, value)

    db.add(place)
    db.commit()
    db.refresh(place)
    return place


def delete_place(*, place_id: int, user_id: int, db: Session) -> None:
    place = (
        db.query(MemoryPlace)
        .filter(MemoryPlace.id == place_id, MemoryPlace.user_id == user_id)
        .first()
    )
    if place is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")

    db.delete(place)
    db.commit()


def update_live_location(
    *,
    user_id: int,
    latitude: float,
    longitude: float,
    accuracy: Optional[float],
    db: Session,
) -> LiveLocation:
    record = (
        db.query(LiveLocation)
        .filter(LiveLocation.user_id == user_id)
        .order_by(LiveLocation.updated_at.desc())
        .first()
    )

    if record is None:
        record = LiveLocation(
            user_id=user_id,
            latitude=latitude,
            longitude=longitude,
            accuracy=accuracy,
        )
    else:
        record.latitude = latitude
        record.longitude = longitude
        record.accuracy = accuracy

    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_live_location(*, user_id: int, db: Session) -> Optional[LiveLocation]:
    return (
        db.query(LiveLocation)
        .filter(LiveLocation.user_id == user_id)
        .order_by(LiveLocation.updated_at.desc())
        .first()
    )

