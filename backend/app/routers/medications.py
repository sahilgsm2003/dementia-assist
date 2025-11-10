from datetime import date, time
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import schemas
from app.services import medication_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/medications", tags=["medications"])


@router.get("/", response_model=List[schemas.Medication])
async def list_medications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medications = medication_service.list_medications(
        user_id=current_user.id,
        db=db,
    )
    return [
        schemas.Medication(
            id=med.id,
            name=med.name,
            dosage=med.dosage,
            frequency=med.frequency,
            time=med.time,
            times=med.times,
            purpose=med.purpose,
            doctor_name=med.doctor_name,
            pharmacy=med.pharmacy,
            refill_date=med.refill_date,
            created_at=med.created_at,
        )
        for med in medications
    ]


@router.get("/today", response_model=List[schemas.Medication])
async def get_today_medications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medications = medication_service.get_today_medications(
        user_id=current_user.id,
        db=db,
    )
    return [
        schemas.Medication(
            id=med.id,
            name=med.name,
            dosage=med.dosage,
            frequency=med.frequency,
            time=med.time,
            times=med.times,
            purpose=med.purpose,
            doctor_name=med.doctor_name,
            pharmacy=med.pharmacy,
            refill_date=med.refill_date,
            created_at=med.created_at,
        )
        for med in medications
    ]


@router.post(
    "/",
    response_model=schemas.Medication,
    status_code=status.HTTP_201_CREATED,
)
async def create_medication(
    payload: schemas.MedicationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medication = medication_service.create_medication(
        user_id=current_user.id,
        payload=payload,
        db=db,
    )
    return schemas.Medication(
        id=medication.id,
        name=medication.name,
        dosage=medication.dosage,
        frequency=medication.frequency,
        time=medication.time,
        times=medication.times,
        purpose=medication.purpose,
        doctor_name=medication.doctor_name,
        pharmacy=medication.pharmacy,
        refill_date=medication.refill_date,
        created_at=medication.created_at,
    )


@router.put("/{medication_id}", response_model=schemas.Medication)
async def update_medication(
    medication_id: int,
    payload: schemas.MedicationUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medication = medication_service.update_medication(
        medication_id=medication_id,
        user_id=current_user.id,
        payload=payload,
        db=db,
    )
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    return schemas.Medication(
        id=medication.id,
        name=medication.name,
        dosage=medication.dosage,
        frequency=medication.frequency,
        time=medication.time,
        times=medication.times,
        purpose=medication.purpose,
        doctor_name=medication.doctor_name,
        pharmacy=medication.pharmacy,
        refill_date=medication.refill_date,
        created_at=medication.created_at,
    )


@router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication(
    medication_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    success = medication_service.delete_medication(
        medication_id=medication_id,
        user_id=current_user.id,
        db=db,
    )
    if not success:
        raise HTTPException(status_code=404, detail="Medication not found")


@router.post("/{medication_id}/track", response_model=schemas.Medication)
async def track_medication(
    medication_id: int,
    payload: schemas.MedicationTrack,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medication = medication_service.track_medication(
        medication_id=medication_id,
        user_id=current_user.id,
        taken=payload.taken,
        db=db,
    )
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    return schemas.Medication(
        id=medication.id,
        name=medication.name,
        dosage=medication.dosage,
        frequency=medication.frequency,
        time=medication.time,
        times=medication.times,
        purpose=medication.purpose,
        doctor_name=medication.doctor_name,
        pharmacy=medication.pharmacy,
        refill_date=medication.refill_date,
        created_at=medication.created_at,
    )

