from typing import Optional

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import schemas
from app.services import emergency_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/emergency", tags=["emergency"])


@router.get("/", response_model=Optional[schemas.EmergencyInfo])
async def get_emergency_info(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    emergency_info = emergency_service.get_emergency_info(
        user_id=current_user.id,
        db=db,
    )
    if not emergency_info:
        return None
    
    # Convert JSON contacts back to list of EmergencyContact
    contacts = [
        schemas.EmergencyContact(**contact)
        for contact in emergency_info.emergency_contacts
    ]
    
    return schemas.EmergencyInfo(
        id=emergency_info.id,
        person_name=emergency_info.person_name,
        emergency_contacts=contacts,
        medical_conditions=emergency_info.medical_conditions,
        allergies=emergency_info.allergies,
        medications=emergency_info.medications,
        doctor_name=emergency_info.doctor_name,
        doctor_phone=emergency_info.doctor_phone,
        home_address=emergency_info.home_address,
        created_at=emergency_info.created_at,
        updated_at=emergency_info.updated_at,
    )


@router.post(
    "/",
    response_model=schemas.EmergencyInfo,
    status_code=status.HTTP_201_CREATED,
)
async def create_emergency_info(
    payload: schemas.EmergencyInfoCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check if already exists
    existing = emergency_service.get_emergency_info(current_user.id, db)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Emergency info already exists. Use PUT to update."
        )
    
    emergency_info = emergency_service.create_emergency_info(
        user_id=current_user.id,
        payload=payload,
        db=db,
    )
    
    contacts = [
        schemas.EmergencyContact(**contact)
        for contact in emergency_info.emergency_contacts
    ]
    
    return schemas.EmergencyInfo(
        id=emergency_info.id,
        person_name=emergency_info.person_name,
        emergency_contacts=contacts,
        medical_conditions=emergency_info.medical_conditions,
        allergies=emergency_info.allergies,
        medications=emergency_info.medications,
        doctor_name=emergency_info.doctor_name,
        doctor_phone=emergency_info.doctor_phone,
        home_address=emergency_info.home_address,
        created_at=emergency_info.created_at,
        updated_at=emergency_info.updated_at,
    )


@router.put("/", response_model=schemas.EmergencyInfo)
async def update_emergency_info(
    payload: schemas.EmergencyInfoUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    emergency_info = emergency_service.update_emergency_info(
        user_id=current_user.id,
        payload=payload,
        db=db,
    )
    
    if not emergency_info:
        # Create if doesn't exist
        # Convert update to create (requires person_name and contacts)
        if not payload.person_name or not payload.emergency_contacts:
            raise HTTPException(
                status_code=400,
                detail="person_name and emergency_contacts are required for initial creation"
            )
        create_payload = schemas.EmergencyInfoCreate(
            person_name=payload.person_name,
            emergency_contacts=payload.emergency_contacts,
            medical_conditions=payload.medical_conditions,
            allergies=payload.allergies,
            medications=payload.medications,
            doctor_name=payload.doctor_name,
            doctor_phone=payload.doctor_phone,
            home_address=payload.home_address,
        )
        emergency_info = emergency_service.create_emergency_info(
            user_id=current_user.id,
            payload=create_payload,
            db=db,
        )
    
    contacts = [
        schemas.EmergencyContact(**contact)
        for contact in emergency_info.emergency_contacts
    ]
    
    return schemas.EmergencyInfo(
        id=emergency_info.id,
        person_name=emergency_info.person_name,
        emergency_contacts=contacts,
        medical_conditions=emergency_info.medical_conditions,
        allergies=emergency_info.allergies,
        medications=emergency_info.medications,
        doctor_name=emergency_info.doctor_name,
        doctor_phone=emergency_info.doctor_phone,
        home_address=emergency_info.home_address,
        created_at=emergency_info.created_at,
        updated_at=emergency_info.updated_at,
    )

