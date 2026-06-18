from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import CareerPage, Job, Organization
from app.schemas.schemas import PublicCareerPageResponse, JobStatus

router = APIRouter(prefix="/public", tags=["public"])

@router.get("/careers/{slug}", response_model=PublicCareerPageResponse)
def get_public_career_page(slug: str, db: Session = Depends(get_db)):
    career_page = db.query(CareerPage).filter(CareerPage.slug == slug).first()
    if not career_page:
        raise HTTPException(status_code=404, detail="Career page not found")
        
    organization = db.query(Organization).filter(Organization.id == career_page.organization_id).first()
    
    # Get all open jobs for this organization
    open_jobs = db.query(Job).filter(
        Job.organization_id == career_page.organization_id,
        Job.status == JobStatus.open
    ).all()
    
    return {
        "career_page": career_page,
        "organization_name": organization.name,
        "jobs": open_jobs
    }
