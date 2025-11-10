from datetime import date, time
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.models import Medication
from app.schemas import schemas


def list_medications(user_id: int, db: Session) -> List[Medication]:
    """Get all medications for a user"""
    return db.query(Medication).filter(Medication.user_id == user_id).all()


def get_medication(medication_id: int, user_id: int, db: Session) -> Optional[Medication]:
    """Get a specific medication"""
    return db.query(Medication).filter(
        Medication.id == medication_id,
        Medication.user_id == user_id
    ).first()


def create_medication(user_id: int, payload: schemas.MedicationCreate, db: Session) -> Medication:
    """Create a new medication"""
    medication = Medication(
        user_id=user_id,
        name=payload.name,
        dosage=payload.dosage,
        frequency=payload.frequency,
        time=payload.time,
        times=payload.times,
        purpose=payload.purpose,
        doctor_name=payload.doctor_name,
        pharmacy=payload.pharmacy,
        refill_date=payload.refill_date,
    )
    db.add(medication)
    db.commit()
    db.refresh(medication)
    return medication


def update_medication(
    medication_id: int,
    user_id: int,
    payload: schemas.MedicationUpdate,
    db: Session
) -> Optional[Medication]:
    """Update a medication"""
    medication = get_medication(medication_id, user_id, db)
    if not medication:
        return None
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(medication, field, value)
    
    db.commit()
    db.refresh(medication)
    return medication


def delete_medication(medication_id: int, user_id: int, db: Session) -> bool:
    """Delete a medication"""
    medication = get_medication(medication_id, user_id, db)
    if not medication:
        return False
    
    db.delete(medication)
    db.commit()
    return True


def get_today_medications(user_id: int, db: Session) -> List[Medication]:
    """Get medications scheduled for today"""
    # For now, return all medications
    # Later can filter by schedule
    return list_medications(user_id, db)


def track_medication(medication_id: int, user_id: int, taken: bool, db: Session) -> Optional[Medication]:
    """Track medication intake (for future implementation with tracking table)"""
    # For now, just return the medication
    # Later can create a MedicationTracking table
    return get_medication(medication_id, user_id, db)

