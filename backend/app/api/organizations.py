from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import Organization, OrganizationMember, User
from app.schemas.schemas import OrganizationResponse, OrganizationCreate, OrganizationMemberResponse
from app.core.security import get_current_user
from sqlalchemy import func
from app.db.models import Job, Application, Interview

router = APIRouter(prefix="/organizations", tags=["organizations"])

@router.post("", response_model=OrganizationResponse)
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

from app.schemas.schemas import OrganizationUpdate

@router.put("/{org_id}", response_model=OrganizationResponse)
def update_organization(
    org_id: int,
    org_update: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify owner
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id,
        OrganizationMember.role == "owner"
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Must be an owner to update organization settings")
        
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    for key, value in org_update.model_dump(exclude_unset=True).items():
        setattr(org, key, value)
        
    db.commit()
    db.refresh(org)
    return org

@router.delete("/{org_id}")
def delete_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify owner
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id,
        OrganizationMember.role == "owner"
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Must be an owner to delete organization")
        
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    db.delete(org)
    db.commit()
    return {"message": "Organization deleted successfully"}


@router.get("/{org_id}/metrics")
def get_organization_metrics(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify organization membership
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized for this organization")

    # Metrics queries
    total_jobs = db.query(func.count(Job.id)).filter(Job.organization_id == org_id).scalar() or 0
    
    # We join Application with Job to only count applications for this org's jobs
    total_applications = db.query(func.count(Application.id)).join(Job).filter(Job.organization_id == org_id).scalar() or 0
    
    # Applications by status
    status_counts = db.query(
        Application.status, func.count(Application.id)
    ).join(Job).filter(Job.organization_id == org_id).group_by(Application.status).all()
    
    status_breakdown = {status.value: count for status, count in status_counts}
    
    # Total Interviews Scheduled
    total_interviews = db.query(func.count(Interview.id)).join(Application).join(Job).filter(Job.organization_id == org_id).scalar() or 0

    return {
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "status_breakdown": status_breakdown,
        "interviews_scheduled": total_interviews
    }

from app.db.models import CareerPage
from app.schemas.schemas import CareerPageResponse, CareerPageUpdate

@router.get("/{org_id}/career-page", response_model=CareerPageResponse)
def get_career_page(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify organization membership
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized for this organization")
        
    page = db.query(CareerPage).filter(CareerPage.organization_id == org_id).first()
    if not page:
        # Create a default one
        org = db.query(Organization).filter(Organization.id == org_id).first()
        slug = "".join(e for e in org.name.lower() if e.isalnum())
        page = CareerPage(
            organization_id=org_id,
            slug=f"{slug}-{org_id}",
            title=f"Careers at {org.name}",
            description="Join our team!",
            primary_color="#3B82F6"
        )
        db.add(page)
        db.commit()
        db.refresh(page)
        
    return page

@router.put("/{org_id}/career-page", response_model=CareerPageResponse)
def update_career_page(
    org_id: int,
    page_update: CareerPageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify organization membership
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized for this organization")
        
    page = db.query(CareerPage).filter(CareerPage.organization_id == org_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Career page not found")
        
    # Check if new slug is taken
    existing_slug = db.query(CareerPage).filter(CareerPage.slug == page_update.slug, CareerPage.id != page.id).first()
    if existing_slug:
        raise HTTPException(status_code=400, detail="Slug already taken")
        
    for key, value in page_update.model_dump().items():
        setattr(page, key, value)
        
    db.commit()
    db.refresh(page)
    return page
