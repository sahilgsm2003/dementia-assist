from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import get_db
from app.services.auth_service import get_current_user
from app.models import models

router = APIRouter(prefix="/search", tags=["search"])


def _build_image_url(request: Request, relative_path: str) -> str:
    """Build full image URL"""
    base_url = str(request.base_url).rstrip("/")
    return f"{base_url}/uploads/{relative_path}"


@router.get("/")
async def global_search(
    request: Request,
    q: str = Query(..., description="Search query"),
    type: Optional[str] = Query(None, description="Comma-separated types: person,memory,reminder,place,document"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Global search across all content types
    """
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query must be at least 2 characters")
    
    query_lower = q.lower().strip()
    types = [t.strip() for t in type.split(",")] if type else []
    
    results = []
    
    # Search People (from memory descriptions)
    if not types or "person" in types:
        memories = db.query(models.MemoryPhoto).filter(
            models.MemoryPhoto.user_id == current_user.id,
            models.MemoryPhoto.description.ilike(f"%{query_lower}%")
        ).limit(5).all()
        
        # Extract person names from memory descriptions
        found_people = set()
        for memory in memories:
            if memory.description:
                # Try to extract names (capitalized words)
                words = memory.description.split()
                for word in words:
                    if len(word) > 2 and word[0].isupper() and word.lower() in query_lower:
                        found_people.add(word)
        
        for person_name in found_people:
            results.append({
                "id": person_name.lower(),
                "type": "person",
                "title": person_name,
                "description": f"Person mentioned in memories",
                "imageUrl": None,
            })
    
    # Search Memories
    if not types or "memory" in types:
        memories = db.query(models.MemoryPhoto).filter(
            models.MemoryPhoto.user_id == current_user.id,
            or_(
                models.MemoryPhoto.description.ilike(f"%{query_lower}%"),
            )
        ).limit(10).all()
        
        for memory in memories:
            # Build image URL
            image_url = _build_image_url(request, memory.image_path) if memory.image_path else None
            
            results.append({
                "id": memory.id,
                "type": "memory",
                "title": memory.description or "Untitled Memory",
                "description": memory.description,
                "imageUrl": image_url,
                "metadata": {
                    "date": memory.created_at.strftime("%Y-%m-%d") if memory.created_at else None,
                },
            })
    
    # Search Reminders
    if not types or "reminder" in types:
        reminders = db.query(models.Reminder).filter(
            models.Reminder.user_id == current_user.id,
            or_(
                models.Reminder.title.ilike(f"%{query_lower}%"),
                models.Reminder.description.ilike(f"%{query_lower}%"),
            )
        ).limit(10).all()
        
        for reminder in reminders:
            results.append({
                "id": reminder.id,
                "type": "reminder",
                "title": reminder.title,
                "description": reminder.description,
                "metadata": {
                    "date": reminder.date.strftime("%Y-%m-%d") if reminder.date else None,
                    "time": reminder.time.strftime("%H:%M") if reminder.time else None,
                },
            })
    
    # Search Places
    if not types or "place" in types:
        places = db.query(models.MemoryPlace).filter(
            models.MemoryPlace.user_id == current_user.id,
            or_(
                models.MemoryPlace.name.ilike(f"%{query_lower}%"),
                models.MemoryPlace.description.ilike(f"%{query_lower}%"),
            )
        ).limit(10).all()
        
        for place in places:
            results.append({
                "id": place.id,
                "type": "place",
                "title": place.name,
                "description": place.description,
                "metadata": {
                    "location": f"{place.latitude:.4f}, {place.longitude:.4f}",
                },
            })
    
    # Search Documents
    if not types or "document" in types:
        documents = db.query(models.Document).filter(
            models.Document.user_id == current_user.id,
            models.Document.filename.ilike(f"%{query_lower}%")
        ).limit(10).all()
        
        for doc in documents:
            results.append({
                "id": doc.id,
                "type": "document",
                "title": doc.filename,
                "description": f"Document uploaded on {doc.created_at.strftime('%Y-%m-%d') if doc.created_at else 'unknown date'}",
                "metadata": {
                    "date": doc.created_at.strftime("%Y-%m-%d") if doc.created_at else None,
                },
            })
    
    return results

