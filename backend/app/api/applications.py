from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import User, Application, Job, Candidate, OrganizationMember, ApplicationStatus
from app.schemas.schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.core.security import get_current_user
from app.core.scoring import calculate_candidate_score
from app.core.email import send_email_background

router = APIRouter(prefix="/applications", tags=["Applications"])

def verify_org_member(db: Session, user_id: int, org_id: int):
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user_id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this organization")
    return member

@router.post("", response_model=ApplicationResponse)
def apply_to_job(
    app_in: ApplicationCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=400, detail="Please complete your Candidate profile to apply.")

    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Check for duplicate applications
    existing_app = db.query(Application).filter(
        Application.candidate_id == candidate.id,
        Application.job_id == job.id
    ).first()
    
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    # Calculate Candidate Score
    score = calculate_candidate_score(candidate, job)

    new_app = Application(
        job_id=job.id,
        candidate_id=candidate.id,
        candidate_score=score,
        resume_snapshot_url=candidate.resume_url,
        current_stage="Applied",
        status=ApplicationStatus.applied
    )
    
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    # Send confirmation email
    background_tasks.add_task(
        send_email_background,
        to_email=current_user.email,
        subject=f"Application Received: {job.title}",
        html_body=f"<h1>Hi {current_user.name},</h1><p>We have successfully received your application for <strong>{job.title}</strong> at {job.organization.name}.</p><p>We will keep you updated on your application status.</p>"
    )
    
    return new_app

@router.get("", response_model=List[ApplicationResponse])
def get_applications(
    organization_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if organization_id:
        verify_org_member(db, current_user.id, organization_id)
        # Get all applications for jobs posted by this organization
        apps = db.query(Application).join(Job).filter(Job.organization_id == organization_id).order_by(Application.applied_at.desc()).all()
        return apps
    else:
        # Get candidate applications
        candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not candidate:
            return []
        apps = db.query(Application).filter(Application.candidate_id == candidate.id).order_by(Application.applied_at.desc()).all()
        return apps

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(app_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # User is the candidate who applied
    if app.candidate.user_id == current_user.id:
        return app
    
    # Or user is an org member
    verify_org_member(db, current_user.id, app.job.organization_id)
    return app

@router.patch("/{app_id}/status", response_model=ApplicationResponse)
def update_application_status(
    app_id: int,
    app_update: ApplicationUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    verify_org_member(db, current_user.id, app.job.organization_id)
        
    update_data = app_update.model_dump(exclude_unset=True)
    status_changed = False
    new_status = None
    
    if "status" in update_data and update_data["status"] != app.status:
        status_changed = True
        new_status = update_data["status"]

    for key, value in update_data.items():
        setattr(app, key, value)
        
    db.commit()
    db.refresh(app)
    
    if status_changed:
        background_tasks.add_task(
            send_email_background,
            to_email=app.candidate.user.email,
            subject=f"Application Update: {app.job.title}",
            html_body=f"<h1>Hi {app.candidate.user.name},</h1><p>Your application status for <strong>{app.job.title}</strong> at {app.job.organization.name} has been updated to: <strong>{new_status.value}</strong>.</p><p>Check your dashboard for more details.</p>"
        )
        
    return app

from app.db.models import Interview
from app.schemas.schemas import InterviewCreate, InterviewResponse

@router.post("/{app_id}/interview", response_model=InterviewResponse)
def schedule_interview(
    app_id: int,
    interview_in: InterviewCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    verify_org_member(db, current_user.id, app.job.organization_id)
    
    existing_interview = db.query(Interview).filter(Interview.application_id == app_id).first()
    if existing_interview:
        raise HTTPException(status_code=400, detail="Interview already scheduled for this application")
        
    new_interview = Interview(
        application_id=app_id,
        date=interview_in.date,
        mode=interview_in.mode,
        meet_link=interview_in.meet_link,
        duration=interview_in.duration,
        feedback=interview_in.feedback,
        status=interview_in.status
    )
    
    # Also update application interview_date for convenience
    app.interview_date = interview_in.date
    
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    
    # Send interview scheduled email
    formatted_date = new_interview.date.strftime("%B %d, %Y at %I:%M %p") if new_interview.date else "TBD"
    meet_link_html = f'<p><strong>Meeting Link:</strong> <a href="{new_interview.meet_link}">{new_interview.meet_link}</a></p>' if new_interview.meet_link else ''
    
    background_tasks.add_task(
        send_email_background,
        to_email=app.candidate.user.email,
        subject=f"Interview Scheduled: {app.job.title}",
        html_body=f"<h1>Hi {app.candidate.user.name},</h1><p>We are excited to invite you to an interview for the <strong>{app.job.title}</strong> role at {app.job.organization.name}.</p><p><strong>Date & Time:</strong> {formatted_date}</p>{meet_link_html}<p>Please check your dashboard to confirm or view more details.</p>"
    )
    
    return new_interview

@router.patch("/{app_id}/interview", response_model=InterviewResponse)
def update_interview(
    app_id: int,
    interview_in: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    verify_org_member(db, current_user.id, app.job.organization_id)
    
    interview = db.query(Interview).filter(Interview.application_id == app_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    update_data = interview_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(interview, key, value)
        
    app.interview_date = interview.date
        
    db.commit()
    db.refresh(interview)
    return interview
