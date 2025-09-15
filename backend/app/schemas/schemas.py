from pydantic import BaseModel
from typing import List, Optional


# Pydantic models for Image
class ImageBase(BaseModel):
    file_path: str


class ImageCreate(ImageBase):
    pass


class Image(ImageBase):
    id: int
    family_member_id: int

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
