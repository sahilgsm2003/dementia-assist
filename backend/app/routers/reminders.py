from datetime import date, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import schemas
from app.services import reminder_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("/", response_model=List[schemas.Reminder])
async def list_reminders(
    current_user=Depends(get_current_user),
    for_date: Optional[date] = Query(default=None, alias="date"),
    db: Session = Depends(get_db),
):
    reminders = reminder_service.list_reminders(
        user_id=current_user.id,
        target_date=for_date,
        db=db,
    )
    return [
        schemas.Reminder(
            id=reminder.id,
            title=reminder.title,
            description=reminder.description,
            date=reminder.date,
            time=reminder.time,
            notification_sound=reminder.notification_sound,
            status=reminder.status,
            created_at=reminder.created_at,
        )
        for reminder in reminders
    ]


@router.post(
    "/",
    response_model=schemas.Reminder,
    status_code=status.HTTP_201_CREATED,
)
async def create_reminder(
    payload: schemas.ReminderCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reminder = reminder_service.create_reminder(
        user_id=current_user.id,
        payload=payload,
        db=db,
    )
    return schemas.Reminder(
        id=reminder.id,
        title=reminder.title,
        description=reminder.description,
        date=reminder.date,
        time=reminder.time,
        notification_sound=reminder.notification_sound,
        status=reminder.status,
        created_at=reminder.created_at,
    )


@router.put("/{reminder_id}", response_model=schemas.Reminder)
async def update_reminder(
    reminder_id: int,
    payload: schemas.ReminderUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reminder = reminder_service.update_reminder(
        reminder_id=reminder_id,
        user_id=current_user.id,
        payload=payload,
        db=db,
    )
    return schemas.Reminder(
        id=reminder.id,
        title=reminder.title,
        description=reminder.description,
        date=reminder.date,
        time=reminder.time,
        notification_sound=reminder.notification_sound,
        status=reminder.status,
        created_at=reminder.created_at,
    )


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    reminder_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reminder_service.delete_reminder(
        reminder_id=reminder_id,
        user_id=current_user.id,
        db=db,
    )


@router.post("/{reminder_id}/complete", response_model=schemas.Reminder)
async def complete_reminder(
    reminder_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reminder = reminder_service.mark_reminder_complete(
        reminder_id=reminder_id,
        user_id=current_user.id,
        db=db,
    )
    return schemas.Reminder(
        id=reminder.id,
        title=reminder.title,
        description=reminder.description,
        date=reminder.date,
        time=reminder.time,
        notification_sound=reminder.notification_sound,
        status=reminder.status,
        created_at=reminder.created_at,
    )


@router.post("/{reminder_id}/snooze", response_model=schemas.Reminder)
async def snooze_reminder(
    reminder_id: int,
    snooze_minutes: int = Query(default=5, ge=1, le=60),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reminder = reminder_service.snooze_reminder(
        reminder_id=reminder_id,
        user_id=current_user.id,
        snooze_minutes=snooze_minutes,
        db=db,
    )
    return schemas.Reminder(
        id=reminder.id,
        title=reminder.title,
        description=reminder.description,
        date=reminder.date,
        time=reminder.time,
        notification_sound=reminder.notification_sound,
        status=reminder.status,
        created_at=reminder.created_at,
    )

