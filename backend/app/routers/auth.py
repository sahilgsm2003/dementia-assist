from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas import schemas
from app.services import auth_service
from app.models import models
from app.db.database import get_db

router = APIRouter(tags=["authentication"])


@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    db: Session = Depends(auth_service.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """
    Authenticates a user and returns an access token.
    """
    user = auth_service.get_user(db, form_data.username)
    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(auth_service.get_db)):
    """
    Creates a new user in the database.
    """
    db_user = auth_service.get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth_service.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(auth_service.get_current_active_user)):
    """
    Fetches the current logged-in user's details.
    A test endpoint to verify authentication is working.
    """
    return current_user


@router.get("/users/me/quick-facts", response_model=schemas.QuickFacts)
async def get_quick_facts(
    current_user=Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's quick facts"""
    # current_user is already a User model instance from get_current_user
    facts = current_user.quick_facts or {}
    # Ensure all fields are present (even if None)
    return schemas.QuickFacts(
        name=facts.get("name"),
        address=facts.get("address"),
        birthday=facts.get("birthday"),
        phone=facts.get("phone"),
    )


@router.put("/users/me/quick-facts", response_model=schemas.QuickFacts)
async def update_quick_facts(
    facts: schemas.QuickFactsUpdate,
    current_user=Depends(auth_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Update user's quick facts"""
    # current_user is already a User model instance from get_current_user
    # Get current facts or empty dict
    current_facts = current_user.quick_facts or {}
    
    # Update with new values (only non-None values)
    updated_facts = {**current_facts}
    if facts.name is not None:
        if facts.name == "":
            updated_facts.pop("name", None)
        else:
            updated_facts["name"] = facts.name
    if facts.address is not None:
        if facts.address == "":
            updated_facts.pop("address", None)
        else:
            updated_facts["address"] = facts.address
    if facts.birthday is not None:
        if facts.birthday == "":
            updated_facts.pop("birthday", None)
        else:
            updated_facts["birthday"] = facts.birthday
    if facts.phone is not None:
        if facts.phone == "":
            updated_facts.pop("phone", None)
        else:
            updated_facts["phone"] = facts.phone
    
    current_user.quick_facts = updated_facts
    db.commit()
    db.refresh(current_user)
    
    return schemas.QuickFacts(
        name=updated_facts.get("name"),
        address=updated_facts.get("address"),
        birthday=updated_facts.get("birthday"),
        phone=updated_facts.get("phone"),
    )
