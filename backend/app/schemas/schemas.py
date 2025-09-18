from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


# Pydantic models for Image
class ImageBase(BaseModel):
    file_path: str


class ImageCreate(ImageBase):
    pass


class Image(ImageBase):
    id: int
    family_member_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Pydantic models for FamilyMember
class FamilyMemberBase(BaseModel):
    name: str
    relationship_name: Optional[str] = None


class FamilyMemberCreate(FamilyMemberBase):
    pass


class FamilyMember(FamilyMemberBase):
    id: int
    user_id: int
    created_at: datetime
    images: List[Image] = []

    class Config:
        from_attributes = True


# Pydantic models for User
class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    family_members: List[FamilyMember] = []

    class Config:
        from_attributes = True


# Pydantic models for Authentication
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Pydantic models for Quiz Logic
class QuizOption(BaseModel):
    id: int
    name: str


class QuizQuestion(BaseModel):
    image_url: str
    options: List[QuizOption]
    prompted_family_member_id: int


class QuizAnswer(BaseModel):
    prompted_family_member_id: int
    selected_family_member_id: int
    response_time_ms: Optional[int] = None


# Pydantic models for RAG/Chat functionality
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


class KnowledgeBaseStats(BaseModel):
    total_documents: int
    total_text_chunks: int
    total_conversations: int
    knowledge_base_ready: bool
