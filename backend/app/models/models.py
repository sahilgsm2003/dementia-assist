from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    Date,
    Time,
    DateTime,
    Text,
    JSON,
    Float,
    LargeBinary,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    quick_facts = Column(JSON, nullable=True)  # Store quick facts as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    memory_photos = relationship("MemoryPhoto", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    memory_places = relationship("MemoryPlace", back_populates="user", cascade="all, delete-orphan")
    live_locations = relationship("LiveLocation", back_populates="user", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="user", cascade="all, delete-orphan")
    emergency_info = relationship("EmergencyInfo", back_populates="user", cascade="all, delete-orphan")
    voice_notes = relationship("VoiceNote", back_populates="user", cascade="all, delete-orphan")
    family_memberships = relationship("FamilyMember", back_populates="user", primaryjoin="User.id == FamilyMember.user_id", cascade="all, delete-orphan")
    created_families = relationship("FamilyGroup", back_populates="owner", foreign_keys="FamilyGroup.owner_id")


class FamilyGroup(Base):
    __tablename__ = "family_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    owner = relationship("User", back_populates="created_families", foreign_keys=[owner_id])
    members = relationship("FamilyMember", back_populates="family_group", cascade="all, delete-orphan")


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    family_group_id = Column(Integer, ForeignKey("family_groups.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(20), default="viewer", nullable=False)  # owner, caregiver, viewer
    status = Column(String(20), default="pending", nullable=False)  # pending, accepted, rejected
    invited_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    invited_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    joined_at = Column(DateTime(timezone=True), nullable=True)

    family_group = relationship("FamilyGroup", back_populates="members")
    user = relationship("User", back_populates="family_memberships", foreign_keys=[user_id])


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    family_group_id = Column(Integer, ForeignKey("family_groups.id"), nullable=True, index=True)
    activity_type = Column(String(50), nullable=False)  # memory_added, reminder_created, etc.
    activity_data = Column(JSON, nullable=True)  # Additional data about the activity
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    user = relationship("User")
    family_group = relationship("FamilyGroup")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    content = Column(Text)
    document_metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="documents")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    confidence_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="messages")


class MemoryPhoto(Base):
    __tablename__ = "memory_photos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_path = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    face_encoding = Column(LargeBinary, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="memory_photos")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=True, index=True)  # Made nullable for smart reminders
    time = Column(Time, nullable=True)  # Made nullable for smart reminders
    notification_sound = Column(String(100), nullable=True)
    status = Column(String(20), default="pending", nullable=False, index=True)  # pending, completed, snoozed
    snooze_until = Column(DateTime(timezone=True), nullable=True)
    reminder_type = Column(String(20), default="time", nullable=False)  # time, location, activity, weather, context
    trigger_conditions = Column(JSON, nullable=True)  # Store trigger conditions as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="reminders")


class MemoryPlace(Base):
    __tablename__ = "memory_places"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="memory_places")


class LiveLocation(Base):
    __tablename__ = "live_locations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="live_locations")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(20), nullable=False)  # once, twice, thrice, four-times
    time = Column(Time, nullable=False)  # Primary time
    times = Column(JSON, nullable=True)  # Array of times for multiple doses
    purpose = Column(Text, nullable=True)
    doctor_name = Column(String(200), nullable=True)
    pharmacy = Column(String(200), nullable=True)
    refill_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="medications")


class EmergencyInfo(Base):
    __tablename__ = "emergency_info"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    person_name = Column(String(200), nullable=False)
    emergency_contacts = Column(JSON, nullable=False)  # Array of {name, phone, relationship}
    medical_conditions = Column(Text, nullable=True)
    allergies = Column(String(500), nullable=True)
    medications = Column(Text, nullable=True)
    doctor_name = Column(String(200), nullable=True)
    doctor_phone = Column(String(50), nullable=True)
    home_address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="emergency_info", uselist=False)


class VoiceNote(Base):
    __tablename__ = "voice_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    audio_path = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    memory_id = Column(Integer, ForeignKey("memory_photos.id"), nullable=True, index=True)
    person_id = Column(String(100), nullable=True, index=True)  # Reference to person name/id
    reminder_id = Column(Integer, ForeignKey("reminders.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="voice_notes")