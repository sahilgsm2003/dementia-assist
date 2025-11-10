from datetime import date, datetime, time
from typing import List, Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class ChatQuery(BaseModel):
    question: str


class ChatResponse(BaseModel):
    question: str
    response: str
    confidence_score: float
    sources_used: int
    created_at: Optional[datetime] = None


class DocumentInfo(BaseModel):
    id: int
    filename: str
    created_at: datetime
    chunks_count: Optional[int] = None


class DocumentUploadResponse(BaseModel):
    success: bool
    document_id: Optional[int] = None
    filename: str
    chunks_processed: Optional[int] = None
    message: str


class ChatHistory(BaseModel):
    id: int
    question: str
    response: str
    confidence_score: Optional[float] = None
    created_at: datetime


# Memory photo schemas
class MemoryPhotoBase(BaseModel):
    description: Optional[str] = None


class MemoryPhotoCreate(MemoryPhotoBase):
    pass


class MemoryPhoto(MemoryPhotoBase):
    id: int
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class MemoryPhotoMatch(BaseModel):
    image_url: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    confidence: float


# Reminder schemas
class ReminderBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    notification_sound: Optional[str] = None
    reminder_type: str = "time"  # time, location, activity, weather, context
    trigger_conditions: Optional[dict] = None


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    notification_sound: Optional[str] = None
    reminder_type: Optional[str] = None
    trigger_conditions: Optional[dict] = None


class Reminder(ReminderBase):
    id: int
    status: str = "pending"
    created_at: datetime

    class Config:
        from_attributes = True


# Memory place schemas
class MemoryPlaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float


class MemoryPlaceCreate(MemoryPlaceBase):
    pass


class MemoryPlaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class MemoryPlace(MemoryPlaceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LiveLocationBase(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None


class LiveLocationUpdate(LiveLocationBase):
    pass


class LiveLocation(LiveLocationBase):
    updated_at: datetime

    class Config:
        from_attributes = True


class LiveLocationResponse(LiveLocation):
    user_id: int


class MemoryPhotoSearchResponse(BaseModel):
    matches: List[MemoryPhotoMatch]


# Medication schemas
class MedicationBase(BaseModel):
    name: str
    dosage: str
    frequency: str  # once, twice, thrice, four-times
    time: time
    times: Optional[List[str]] = None  # Array of time strings for multiple doses
    purpose: Optional[str] = None
    doctor_name: Optional[str] = None
    pharmacy: Optional[str] = None
    refill_date: Optional[date] = None


class MedicationCreate(MedicationBase):
    pass


class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    time: Optional[time] = None
    times: Optional[List[str]] = None
    purpose: Optional[str] = None
    doctor_name: Optional[str] = None
    pharmacy: Optional[str] = None
    refill_date: Optional[date] = None


class Medication(MedicationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MedicationTrack(BaseModel):
    taken: bool
    date: Optional[date] = None


# Emergency Info schemas
class EmergencyContact(BaseModel):
    name: str
    phone: str
    relationship: str


class EmergencyInfoBase(BaseModel):
    person_name: str
    emergency_contacts: List[EmergencyContact]
    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    home_address: Optional[str] = None


class EmergencyInfoCreate(EmergencyInfoBase):
    pass


class EmergencyInfoUpdate(BaseModel):
    person_name: Optional[str] = None
    emergency_contacts: Optional[List[EmergencyContact]] = None
    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    home_address: Optional[str] = None


class EmergencyInfo(EmergencyInfoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Quick Facts schemas
class QuickFacts(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    birthday: Optional[str] = None  # YYYY-MM-DD format
    phone: Optional[str] = None


class QuickFactsUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    birthday: Optional[str] = None
    phone: Optional[str] = None


# Voice Note schemas
class VoiceNoteBase(BaseModel):
    description: Optional[str] = None
    memory_id: Optional[int] = None
    person_id: Optional[str] = None
    reminder_id: Optional[int] = None


class VoiceNoteCreate(VoiceNoteBase):
    pass


class VoiceNote(VoiceNoteBase):
    id: int
    audio_url: str
    created_at: datetime

    class Config:
        from_attributes = True


# Family Sharing schemas
class FamilyGroupBase(BaseModel):
    name: str


class FamilyGroupCreate(FamilyGroupBase):
    pass


class FamilyGroup(FamilyGroupBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FamilyMemberBase(BaseModel):
    role: str = "viewer"  # owner, caregiver, viewer


class FamilyMemberInvite(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    role: str = "viewer"


class FamilyMember(FamilyMemberBase):
    id: int
    family_group_id: int
    user_id: int
    status: str  # pending, accepted, rejected
    invited_at: datetime
    joined_at: Optional[datetime] = None
    user: Optional["User"] = None  # User info

    class Config:
        from_attributes = True


class ActivityLogBase(BaseModel):
    activity_type: str
    activity_data: Optional[dict] = None


class ActivityLog(ActivityLogBase):
    id: int
    user_id: int
    family_group_id: Optional[int] = None
    created_at: datetime
    user: Optional["User"] = None

    class Config:
        from_attributes = True