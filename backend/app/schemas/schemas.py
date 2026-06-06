from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.db.models import UserRole, ApplicationStatus, JobStatus, InterviewStatus

# Users
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    firebase_uid: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Candidates
class CandidateBase(BaseModel):
    phone: Optional[str] = None
    college: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    resume_url: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)

# Recruiters
class RecruiterBase(BaseModel):
    company_name: Optional[str] = None
    designation: Optional[str] = None

class RecruiterCreate(RecruiterBase):
    pass

class RecruiterResponse(RecruiterBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)

# Jobs
class JobBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    salary: Optional[str] = None
    status: JobStatus = JobStatus.open

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    recruiter_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Applications
class ApplicationBase(BaseModel):
    job_id: int

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int
    candidate_id: int
    status: ApplicationStatus
    applied_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Interviews
class InterviewBase(BaseModel):
    application_id: int
    date: Optional[datetime] = None
    mode: Optional[str] = None
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
