from datetime import datetime
from typing import Optional

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


class KnowledgeBaseStats(BaseModel):
    total_documents: int
    total_text_chunks: int
    total_conversations: int
    knowledge_base_ready: bool

