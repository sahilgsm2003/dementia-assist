from datetime import date, datetime, timedelta, timezone
from typing import Iterable, List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import Reminder
from app.schemas import schemas


def list_reminders(
    *,
    user_id: int,
    target_date: Optional[date],
    db: Session,
) -> List[Reminder]:
    query = db.query(Reminder).filter(Reminder.user_id == user_id)
    if target_date is not None:
        query = query.filter(Reminder.date == target_date)
    
    # Only show pending reminders (or snoozed reminders that are ready)
    now = datetime.now(timezone.utc)
    query = query.filter(
        (Reminder.status == "pending") | 
        ((Reminder.status == "snoozed") & (Reminder.snooze_until <= now))
    )

    return query.order_by(Reminder.date.asc(), Reminder.time.asc()).all()


def create_reminder(
    *,
    user_id: int,
    payload: schemas.ReminderCreate,
    db: Session,
) -> Reminder:
    reminder = Reminder(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        date=payload.date,
        time=payload.time,
        notification_sound=payload.notification_sound,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


def update_reminder(
    *,
    reminder_id: int,
    user_id: int,
    payload: schemas.ReminderUpdate,
    db: Session,
) -> Reminder:
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
        .first()
    )
    if reminder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(reminder, field, value)

    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


def delete_reminder(
    *,
    reminder_id: int,
    user_id: int,
    db: Session,
) -> None:
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
        .first()
    )
    if reminder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    db.delete(reminder)
    db.commit()


def mark_reminder_complete(
    *,
    reminder_id: int,
    user_id: int,
    db: Session,
) -> Reminder:
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
        .first()
    )
    if reminder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    reminder.status = "completed"
    reminder.snooze_until = None
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


def snooze_reminder(
    *,
    reminder_id: int,
    user_id: int,
    snooze_minutes: int = 5,
    db: Session,
) -> Reminder:
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
        .first()
    )
    if reminder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    reminder.status = "snoozed"
    reminder.snooze_until = datetime.now(timezone.utc) + timedelta(minutes=snooze_minutes)
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder

