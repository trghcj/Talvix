from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List, Optional
from app.db.database import get_db
from app.db.models import User, Application, Job, OrganizationMember, ApplicationStatus, JobStatus
from app.schemas.schemas import JobResponse, ApplicationResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/recruiter", tags=["Recruiter"])

def verify_org_member(db: Session, user_id: int, org_id: int):
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user_id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this organization")
    return member

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_metrics(
    organization_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_org_member(db, current_user.id, organization_id)

    # 1. Metrics Cards
    active_jobs = db.query(Job).filter(Job.organization_id == organization_id, Job.status == JobStatus.open).count()
    total_applicants = db.query(Application).join(Job).filter(Job.organization_id == organization_id).count()
    
    interviews_scheduled = db.query(Application).join(Job).filter(
        Job.organization_id == organization_id, 
        Application.status.in_([ApplicationStatus.technical_interview, ApplicationStatus.hr_interview])
    ).count()
    
    offers_extended = db.query(Application).join(Job).filter(
        Job.organization_id == organization_id, 
        Application.status == ApplicationStatus.offer_extended
    ).count()

    hired = db.query(Application).join(Job).filter(
        Job.organization_id == organization_id, 
        Application.status == ApplicationStatus.hired
    ).count()

    hiring_rate = f"{(hired / total_applicants * 100):.1f}%" if total_applicants > 0 else "0%"

    # 2. ATS Funnel
    funnel = {
        "Applied": db.query(Application).join(Job).filter(Job.organization_id == organization_id, Application.status == ApplicationStatus.applied).count(),
        "Screening": db.query(Application).join(Job).filter(Job.organization_id == organization_id, Application.status == ApplicationStatus.screening).count(),
        "Shortlisted": db.query(Application).join(Job).filter(Job.organization_id == organization_id, Application.status == ApplicationStatus.shortlisted).count(),
        "Technical Interview": db.query(Application).join(Job).filter(Job.organization_id == organization_id, Application.status == ApplicationStatus.technical_interview).count(),
        "HR Interview": db.query(Application).join(Job).filter(Job.organization_id == organization_id, Application.status == ApplicationStatus.hr_interview).count(),
        "Offer Extended": offers_extended,
        "Hired": hired,
        "Rejected": db.query(Application).join(Job).filter(Job.organization_id == organization_id, Application.status == ApplicationStatus.rejected).count(),
        "Withdrawn": db.query(Application).join(Job).filter(Job.organization_id == organization_id, Application.status == ApplicationStatus.withdrawn).count(),
    }

    return {
        "metrics": {
            "active_jobs": active_jobs,
            "total_applicants": total_applicants,
            "interviews_scheduled": interviews_scheduled,
            "offers_extended": offers_extended,
            "hiring_rate": hiring_rate
        },
        "funnel": funnel
    }

@router.get("/jobs", response_model=List[JobResponse])
def get_recruiter_jobs(
    organization_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_org_member(db, current_user.id, organization_id)
    jobs = db.query(Job).filter(Job.organization_id == organization_id, Job.status != JobStatus.deleted).order_by(Job.created_at.desc()).all()
    return jobs

@router.get("/applicants", response_model=List[ApplicationResponse])
def get_recruiter_applicants(
    organization_id: int,
    job_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_org_member(db, current_user.id, organization_id)
        
    query = db.query(Application).join(Job).filter(Job.organization_id == organization_id)
    if job_id:
        query = query.filter(Job.id == job_id)
        
    # Sort by candidate score descending by default
    apps = query.order_by(Application.candidate_score.desc().nullslast()).all()
    return apps
