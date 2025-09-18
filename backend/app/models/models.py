from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    DateTime,
    Text,
    JSON,
    Float,
    func,
)
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family_members = relationship("FamilyMember", back_populates="user")
    quiz_sessions = relationship("QuizSession", back_populates="user")


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    # Renamed the attribute to `relationship_name` to avoid conflict
    # with SQLAlchemy's `relationship` function.
    # The actual database column will still be named "relationship".
    relationship_name = Column("relationship", String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="family_members")
    images = relationship("Image", back_populates="family_member", cascade="all, delete-orphan")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    family_member_id = Column(Integer, ForeignKey("family_members.id"), nullable=False)
    file_path = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family_member = relationship("FamilyMember", back_populates="images")


class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prompted_family_member_id = Column(Integer, ForeignKey("family_members.id"), nullable=False)
    selected_family_member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)
    is_correct = Column(Boolean, nullable=False)
    response_time_ms = Column(Integer)
    session_timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="quiz_sessions")
    prompted_family_member = relationship("FamilyMember", foreign_keys=[prompted_family_member_id])
    selected_family_member = relationship("FamilyMember", foreign_keys=[selected_family_member_id])


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    content = Column(Text)
    document_metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    confidence_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
