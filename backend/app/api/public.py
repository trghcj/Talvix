from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import CareerPage, Job, Organization, User
from app.schemas.schemas import PublicCareerPageResponse, JobStatus
from fastapi import UploadFile, File
from app.core.security import get_current_user

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

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        import cloudinary.uploader
        upload_result = cloudinary.uploader.upload(
            file.file,
            resource_type="auto"
        )
        return {"url": upload_result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
