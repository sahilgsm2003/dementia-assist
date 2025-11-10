from typing import Optional
from sqlalchemy.orm import Session

from app.models.models import EmergencyInfo
from app.schemas import schemas


def get_emergency_info(user_id: int, db: Session) -> Optional[EmergencyInfo]:
    """Get emergency info for a user"""
    return db.query(EmergencyInfo).filter(EmergencyInfo.user_id == user_id).first()


def create_emergency_info(user_id: int, payload: schemas.EmergencyInfoCreate, db: Session) -> EmergencyInfo:
    """Create emergency info for a user"""
    # Convert emergency contacts to JSON format
    contacts_json = [contact.model_dump() if hasattr(contact, "model_dump") else contact for contact in payload.emergency_contacts]
    
    emergency_info = EmergencyInfo(
        user_id=user_id,
        person_name=payload.person_name,
        emergency_contacts=contacts_json,
        medical_conditions=payload.medical_conditions,
        allergies=payload.allergies,
        medications=payload.medications,
        doctor_name=payload.doctor_name,
        doctor_phone=payload.doctor_phone,
        home_address=payload.home_address,
    )
    db.add(emergency_info)
    db.commit()
    db.refresh(emergency_info)
    return emergency_info


def update_emergency_info(
    user_id: int,
    payload: schemas.EmergencyInfoUpdate,
    db: Session
) -> Optional[EmergencyInfo]:
    """Update emergency info for a user"""
    emergency_info = get_emergency_info(user_id, db)
    if not emergency_info:
        return None
    
    update_data = payload.model_dump(exclude_unset=True)
    
    # Handle emergency_contacts conversion
    if "emergency_contacts" in update_data and update_data["emergency_contacts"]:
        update_data["emergency_contacts"] = [
            contact.model_dump() if hasattr(contact, "model_dump") else (contact if isinstance(contact, dict) else contact.dict())
            for contact in update_data["emergency_contacts"]
        ]
    
    for field, value in update_data.items():
        setattr(emergency_info, field, value)
    
    db.commit()
    db.refresh(emergency_info)
    return emergency_info


def upsert_emergency_info(user_id: int, payload: schemas.EmergencyInfoCreate, db: Session) -> EmergencyInfo:
    """Create or update emergency info"""
    existing = get_emergency_info(user_id, db)
    if existing:
        # Convert to update payload
        update_payload = schemas.EmergencyInfoUpdate(**payload.dict())
        return update_emergency_info(user_id, update_payload, db) or existing
    else:
        return create_emergency_info(user_id, payload, db)

