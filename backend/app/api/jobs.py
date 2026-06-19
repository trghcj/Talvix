from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
import time
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import User, Job, OrganizationMember, JobStatus
from app.schemas.schemas import JobCreate, JobResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])

def verify_org_member(db: Session, user_id: int, org_id: int):
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user_id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this organization")
    return member

@router.post("", response_model=JobResponse)
def create_job(
    job_in: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_org_member(db, current_user.id, job_in.organization_id)

    new_job = Job(**job_in.model_dump())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("", response_model=List[JobResponse])
def list_jobs(
    title: Optional[str] = None,
    location: Optional[str] = None,
    work_mode: Optional[str] = None,
    employment_type: Optional[str] = None,
    job_level: Optional[str] = None,
    min_salary: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.status == JobStatus.open)
    
    if title:
        query = query.filter(Job.title.ilike(f"%{title}%"))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if work_mode:
        query = query.filter(Job.work_mode == work_mode)
    if employment_type:
        query = query.filter(Job.employment_type == employment_type)
    if job_level:
        query = query.filter(Job.job_level == job_level)
    if min_salary:
        query = query.filter(Job.salary_max >= min_salary)
        
    jobs = query.order_by(Job.created_at.desc()).all()
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    verify_org_member(db, current_user.id, job.organization_id)
        
    update_data = job_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)
        
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    verify_org_member(db, current_user.id, job.organization_id)
        
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}

@router.post("/upload-jd")
async def upload_jd_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        file_contents = await file.read()
        
        timestamp = int(time.time())
        safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
        
        import cloudinary.uploader
        upload_result = cloudinary.uploader.upload(
            file_contents,
            resource_type="auto",
            use_filename=True,
            folder="jds",
            public_id=safe_filename
        )
        
        return {"url": upload_result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload JD: {str(e)}")
