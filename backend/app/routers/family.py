from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime

from app.db.database import get_db
from app.services.auth_service import get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/family", tags=["family"])


@router.post("/invite", response_model=schemas.FamilyMember)
async def invite_family_member(
    invite: schemas.FamilyMemberInvite,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Invite a family member to join your family group
    """
    # Find or create a family group for the current user
    family_group = db.query(models.FamilyGroup).filter(
        models.FamilyGroup.owner_id == current_user.id
    ).first()

    if not family_group:
        # Create a family group for the user
        family_group = models.FamilyGroup(
            name=f"{current_user.username}'s Family",
            owner_id=current_user.id,
        )
        db.add(family_group)
        db.flush()

        # Add owner as a member
        owner_member = models.FamilyMember(
            family_group_id=family_group.id,
            user_id=current_user.id,
            role="owner",
            status="accepted",
            joined_at=datetime.utcnow(),
        )
        db.add(owner_member)

    # Find the user to invite
    user_to_invite = None
    if invite.email:
        # In a real app, you'd look up by email
        # For now, we'll use username
        user_to_invite = db.query(models.User).filter(
            models.User.username == invite.username
        ).first()
    elif invite.username:
        user_to_invite = db.query(models.User).filter(
            models.User.username == invite.username
        ).first()

    if not user_to_invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if already a member
    existing_member = db.query(models.FamilyMember).filter(
        and_(
            models.FamilyMember.family_group_id == family_group.id,
            models.FamilyMember.user_id == user_to_invite.id,
        )
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this family group"
        )

    # Create invitation
    new_member = models.FamilyMember(
        family_group_id=family_group.id,
        user_id=user_to_invite.id,
        role=invite.role,
        status="pending",
        invited_by=current_user.id,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return schemas.FamilyMember(
        id=new_member.id,
        family_group_id=new_member.family_group_id,
        user_id=new_member.user_id,
        role=new_member.role,
        status=new_member.status,
        invited_at=new_member.invited_at,
        joined_at=new_member.joined_at,
        user=schemas.User(
            id=user_to_invite.id,
            username=user_to_invite.username,
            created_at=user_to_invite.created_at,
        ),
    )


@router.get("/members", response_model=List[schemas.FamilyMember])
async def list_family_members(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all family members in your family group
    """
    # Find user's family group
    family_member = db.query(models.FamilyMember).filter(
        models.FamilyMember.user_id == current_user.id,
        models.FamilyMember.status == "accepted",
    ).first()

    if not family_member:
        return []

    # Get all members of the same family group
    members = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_group_id == family_member.family_group_id,
    ).all()

    result = []
    for member in members:
        user = db.query(models.User).filter(models.User.id == member.user_id).first()
        result.append(schemas.FamilyMember(
            id=member.id,
            family_group_id=member.family_group_id,
            user_id=member.user_id,
            role=member.role,
            status=member.status,
            invited_at=member.invited_at,
            joined_at=member.joined_at,
            user=schemas.User(
                id=user.id,
                username=user.username,
                created_at=user.created_at,
            ) if user else None,
        ))

    return result


@router.post("/accept-invite/{member_id}", response_model=schemas.FamilyMember)
async def accept_invite(
    member_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accept a family invitation
    """
    member = db.query(models.FamilyMember).filter(
        models.FamilyMember.id == member_id,
        models.FamilyMember.user_id == current_user.id,
        models.FamilyMember.status == "pending",
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )

    member.status = "accepted"
    member.joined_at = datetime.utcnow()
    db.commit()
    db.refresh(member)

    user = db.query(models.User).filter(models.User.id == member.user_id).first()
    return schemas.FamilyMember(
        id=member.id,
        family_group_id=member.family_group_id,
        user_id=member.user_id,
        role=member.role,
        status=member.status,
        invited_at=member.invited_at,
        joined_at=member.joined_at,
        user=schemas.User(
            id=user.id,
            username=user.username,
            created_at=user.created_at,
        ) if user else None,
    )


@router.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_family_member(
    member_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Remove a family member (only owner can do this)
    """
    member = db.query(models.FamilyMember).filter(
        models.FamilyMember.id == member_id,
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    # Check if current user is owner
    family_group = db.query(models.FamilyGroup).filter(
        models.FamilyGroup.id == member.family_group_id,
        models.FamilyGroup.owner_id == current_user.id,
    ).first()

    if not family_group:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the family owner can remove members"
        )

    # Don't allow removing the owner
    if member.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the family owner"
        )

    db.delete(member)
    db.commit()


@router.get("/activity", response_model=List[schemas.ActivityLog])
async def get_activity_feed(
    limit: int = 20,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get activity feed for the user's family group
    """
    # Find user's family group
    family_member = db.query(models.FamilyMember).filter(
        models.FamilyMember.user_id == current_user.id,
        models.FamilyMember.status == "accepted",
    ).first()

    if not family_member:
        return []

    # Get activity logs for the family group
    activities = db.query(models.ActivityLog).filter(
        models.ActivityLog.family_group_id == family_member.family_group_id,
    ).order_by(models.ActivityLog.created_at.desc()).limit(limit).all()

    result = []
    for activity in activities:
        user = db.query(models.User).filter(models.User.id == activity.user_id).first()
        result.append(schemas.ActivityLog(
            id=activity.id,
            user_id=activity.user_id,
            family_group_id=activity.family_group_id,
            activity_type=activity.activity_type,
            activity_data=activity.activity_data,
            created_at=activity.created_at,
            user=schemas.User(
                id=user.id,
                username=user.username,
                created_at=user.created_at,
            ) if user else None,
        ))

    return result

