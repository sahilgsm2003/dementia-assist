"""
Translation API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.services.translation_service import translation_service, SUPPORTED_TRANSLATION_PROVIDERS
from app.services.auth_service import get_current_user
from app.schemas import schemas
from app.db.database import get_db
from app.models.models import User

router = APIRouter(prefix="/translation", tags=["translation"])


class TranslationRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: Optional[str] = "en"


class BatchTranslationRequest(BaseModel):
    texts: List[str]
    target_lang: str
    source_lang: Optional[str] = "en"


class TranslationResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str


class BatchTranslationResponse(BaseModel):
    translated_texts: List[str]
    source_lang: str
    target_lang: str


@router.post("/translate", response_model=TranslationResponse)
async def translate_text(
    request: TranslationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Translate a single text string.
    Requires authentication.
    """
    try:
        translated = translation_service.translate(
            request.text,
            request.target_lang,
            request.source_lang,
            provider_override=getattr(current_user, "translation_provider", None)
        )
        
        return TranslationResponse(
            translated_text=translated,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.post("/translate/batch", response_model=BatchTranslationResponse)
async def translate_batch(
    request: BatchTranslationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Translate multiple texts in a single request.
    More efficient than multiple single requests.
    """
    try:
        translated_texts = translation_service.translate_batch(
            request.texts,
            request.target_lang,
            request.source_lang,
            provider_override=getattr(current_user, "translation_provider", None)
        )
        
        return BatchTranslationResponse(
            translated_texts=translated_texts,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch translation failed: {str(e)}")


@router.get("/providers")
async def list_translation_providers(
    current_user: User = Depends(get_current_user)
):
    """
    Return supported translation providers and availability info.
    """
    return {
        "providers": translation_service.get_provider_options(),
        "active_provider": getattr(current_user, "translation_provider", translation_service.provider),
    }


@router.put("/provider", response_model=schemas.User)
async def update_translation_provider(
    update: schemas.TranslationProviderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the user's preferred translation provider.
    """
    provider = (update.translation_provider or "").lower()
    if provider not in SUPPORTED_TRANSLATION_PROVIDERS:
        raise HTTPException(status_code=400, detail="Unsupported translation provider")
    
    if not translation_service.provider_available(provider):
        raise HTTPException(
            status_code=400,
            detail="Requested provider is not available. Please configure the required API key.",
        )
    
    db_user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.translation_provider = provider
    db.commit()
    db.refresh(db_user)
    return db_user

