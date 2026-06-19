from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import time
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.db.database import get_db
from app.db.models import User, Application, Job, Candidate, OrganizationMember, ApplicationStatus, InterviewScorecard
from app.schemas.schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdate, ScorecardCreate, ScorecardResponse
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

@router.post("/{app_id}/scorecards", response_model=ScorecardResponse)
def add_scorecard(
    app_id: int,
    scorecard_in: ScorecardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    verify_org_member(db, current_user.id, app.job.organization_id)
    
    new_scorecard = InterviewScorecard(
        application_id=app_id,
        interviewer_name=scorecard_in.interviewer_name,
        communication_score=scorecard_in.communication_score,
        technical_score=scorecard_in.technical_score,
        culture_score=scorecard_in.culture_score,
        comments=scorecard_in.comments
    )
    db.add(new_scorecard)
    db.commit()
    db.refresh(new_scorecard)
    return new_scorecard

@router.get("/{app_id}/scorecards", response_model=List[ScorecardResponse])
def get_scorecards(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if app.candidate.user_id != current_user.id:
        verify_org_member(db, current_user.id, app.job.organization_id)
    
    scorecards = db.query(InterviewScorecard).filter(InterviewScorecard.application_id == app_id).all()
    return scorecards

@router.post("/{app_id}/generate-offer", response_model=ApplicationResponse)
def generate_offer_letter(
    app_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    verify_org_member(db, current_user.id, app.job.organization_id)
    
    if app.status != ApplicationStatus.offer_extended:
        raise HTTPException(status_code=400, detail="Candidate must be in 'Offer Extended' stage")
        
    timestamp = int(time.time())
    safe_filename = f"offer_{app.id}_{timestamp}.pdf"

    import io
    pdf_buffer = io.BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=letter)
    width, height = letter
    
    # Simple Professional Template
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 80, f"Offer of Employment: {app.job.organization.name}")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 120, f"Date: {time.strftime('%B %d, %Y')}")
    c.drawString(50, height - 140, f"Dear {app.candidate.user.name},")
    
    text = c.beginText(50, height - 180)
    text.setFont("Helvetica", 12)
    text.setLeading(14)
    text.textLines(f"""
We are thrilled to offer you the position of {app.job.title} at {app.job.organization.name}.

We were incredibly impressed by your interviews and believe your skills and experience 
will be a fantastic addition to our team.

Role details:
- Title: {app.job.title}
- Department: {app.job.department or 'Engineering'}
- Location: {app.job.location or 'Remote'}
- Salary Range: ${app.job.salary_min or 'Competitive'} - ${app.job.salary_max or 'Competitive'}

Please accept this offer through your Talvix candidate portal. We look forward to 
welcoming you to the team!

Sincerely,
The {app.job.organization.name} Hiring Team
    """)
    c.drawText(text)
    c.save()
    
    pdf_buffer.seek(0)
    
    import cloudinary.uploader
    upload_result = cloudinary.uploader.upload(
        pdf_buffer.read(),
        resource_type="raw",
        use_filename=True,
        folder="offers",
        public_id=safe_filename
    )
    
    app.offer_letter_url = upload_result.get("secure_url")
    db.commit()
    db.refresh(app)
    
    background_tasks.add_task(
        send_email_background,
        to_email=app.candidate.user.email,
        subject=f"Offer Extended: {app.job.title}",
        html_body=f"<h1>Congratulations {app.candidate.user.name}!</h1><p>We are extending an offer for the <strong>{app.job.title}</strong> position at {app.job.organization.name}.</p><p>Please log in to your dashboard to review and accept the official offer letter.</p>"
    )
    
    return app

@router.post("/{app_id}/accept-offer", response_model=ApplicationResponse)
def accept_offer(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if app.candidate.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    app.status = ApplicationStatus.hired
    app.current_stage = "Hired"
    db.commit()
    db.refresh(app)
    
    return app
