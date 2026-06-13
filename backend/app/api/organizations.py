from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import Organization, OrganizationMember, User
from app.schemas.schemas import OrganizationResponse, OrganizationCreate, OrganizationMemberResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/organizations", tags=["organizations"])

@router.post("/", response_model=OrganizationResponse)
def create_organization(
    org_in: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create Organization
    new_org = Organization(name=org_in.name, owner_id=current_user.id)
    db.add(new_org)
    db.commit()
    db.refresh(new_org)

    # Automatically add owner as an OrganizationMember
    member = OrganizationMember(
        organization_id=new_org.id,
        user_id=current_user.id,
        role="owner"
    )
    db.add(member)
    db.commit()
    
    return new_org

@router.get("/my", response_model=List[OrganizationMemberResponse])
def get_my_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Returns the organization memberships for the current user
    memberships = db.query(OrganizationMember).filter(OrganizationMember.user_id == current_user.id).all()
    return memberships
