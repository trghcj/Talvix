from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.db.models import ApplicationStatus, JobStatus, InterviewStatus

# Users
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    firebase_uid: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Candidates
class CandidateBase(BaseModel):
    phone: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    resume_url: Optional[str] = None
    profile_picture_url: Optional[str] = None

class CandidateUpdate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)

# Organizations
class OrganizationBase(BaseModel):
    name: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: int
    owner_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Organization Members
class OrganizationMemberBase(BaseModel):
    organization_id: int
    user_id: int
    role: str

class OrganizationMemberResponse(OrganizationMemberBase):
    id: int
    created_at: datetime
    organization: Optional[OrganizationResponse] = None
    model_config = ConfigDict(from_attributes=True)

# Career Pages
class CareerPageBase(BaseModel):
    slug: str
    title: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    primary_color: Optional[str] = "#3B82F6"

class CareerPageUpdate(CareerPageBase):
    pass

class CareerPageResponse(CareerPageBase):
    id: int
    organization_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PublicCareerPageResponse(BaseModel):
    career_page: CareerPageResponse
    organization_name: str
    jobs: List['JobResponse']

# Jobs
class JobBase(BaseModel):
    title: str
    description: str
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    work_mode: Optional[str] = None
    experience_required: Optional[str] = None
    job_level: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    openings: int = 1
    skills_required: Optional[str] = None
    application_deadline: Optional[datetime] = None
    status: JobStatus = JobStatus.open

class JobCreate(JobBase):
    organization_id: int

class JobResponse(JobBase):
    id: int
    organization_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    organization: Optional[OrganizationResponse] = None
    model_config = ConfigDict(from_attributes=True)

# Applications
class ApplicationBase(BaseModel):
    job_id: int

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    current_stage: Optional[str] = None
    interview_date: Optional[datetime] = None
    feedback: Optional[str] = None
    notes: Optional[str] = None

class ApplicationResponse(ApplicationBase):
    id: int
    candidate_id: int
    status: ApplicationStatus
    current_stage: Optional[str] = None
    applied_at: datetime
    interview_date: Optional[datetime] = None
    feedback: Optional[str] = None
    notes: Optional[str] = None
    resume_snapshot_url: Optional[str] = None
    candidate_score: Optional[int] = None
    updated_at: Optional[datetime] = None
    interview: Optional['InterviewResponse'] = None
    job: Optional[JobResponse] = None
    model_config = ConfigDict(from_attributes=True)

# Interviews
class InterviewBase(BaseModel):
    application_id: int
    date: Optional[datetime] = None
    mode: Optional[str] = None
    meet_link: Optional[str] = None
    duration: Optional[int] = None
    feedback: Optional[str] = None
    status: InterviewStatus = InterviewStatus.scheduled

class InterviewCreate(InterviewBase):
    pass

class InterviewResponse(InterviewBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
