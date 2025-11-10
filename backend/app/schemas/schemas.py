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
    date: date
    time: time
    notification_sound: Optional[str] = None


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    notification_sound: Optional[str] = None


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
