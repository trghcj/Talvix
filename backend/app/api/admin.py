from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import User, Organization, OrganizationMember, Job, Application, Candidate
from app.core.security import get_current_user
from pydantic import BaseModel
from sqlalchemy import func

router = APIRouter(prefix="/admin", tags=["Organization Admin"])

class InviteMemberRequest(BaseModel):
    email: str
    role: str = "recruiter"

def verify_org_owner(db: Session, user_id: int, org_id: int):
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user_id,
        OrganizationMember.organization_id == org_id,
        OrganizationMember.role == "owner"
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Must be an organization owner")
    return member

@router.get("/analytics")
def get_org_analytics(
    organization_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_org_owner(db, current_user.id, organization_id)
    
    total_jobs = db.query(Job).filter(Job.organization_id == organization_id).count()
    
    total_applications = db.query(Application).join(Job).filter(Job.organization_id == organization_id).count()
    
    hired_applications = db.query(Application).join(Job).filter(
        Job.organization_id == organization_id,
        Application.current_stage == "Hired"
    ).count()
    
    total_recruiters = db.query(OrganizationMember).filter(OrganizationMember.organization_id == organization_id).count()
    
    return {
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "hired_candidates": hired_applications,
        "active_recruiters": total_recruiters
    }

@router.get("/members")
def get_org_members(
    organization_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_org_owner(db, current_user.id, organization_id)
    members = db.query(OrganizationMember).filter(OrganizationMember.organization_id == organization_id).all()
    
    result = []
    for member in members:
        result.append({
            "id": member.id,
            "user_id": member.user.id,
            "name": member.user.name,
            "email": member.user.email,
            "role": member.role,
            "joined_at": member.created_at
        })
    return result

@router.post("/members")
def invite_org_member(
    organization_id: int,
    invite_data: InviteMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_org_owner(db, current_user.id, organization_id)
    
    # Find user by email
    target_user = db.query(User).filter(func.lower(User.email) == invite_data.email.lower()).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found. They must sign up for Talvix first.")
        
    # Check if already a member
    existing_member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == target_user.id,
        OrganizationMember.organization_id == organization_id
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member of this organization")
        
    # Add member
    new_member = OrganizationMember(
        organization_id=organization_id,
        user_id=target_user.id,
        role=invite_data.role
    )
    db.add(new_member)
    db.commit()
    
    return {"message": "Recruiter invited successfully"}

@router.delete("/members/{member_id}")
def remove_org_member(
    organization_id: int,
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_org_owner(db, current_user.id, organization_id)
    
    member = db.query(OrganizationMember).filter(
        OrganizationMember.id == member_id,
        OrganizationMember.organization_id == organization_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    if member.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
        
    db.delete(member)
    db.commit()
    return {"message": "Member removed successfully"}
