from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base

class JobStatus(str, enum.Enum):
    draft = "Draft"
    open = "Open"
    closed = "Closed"

class ApplicationStatus(str, enum.Enum):
    applied = "Applied"
    screening = "Screening"
    shortlisted = "Shortlisted"
    technical_interview = "Technical Interview"
    hr_interview = "HR Interview"
    offer_extended = "Offer Extended"
    hired = "Hired"
    rejected = "Rejected"
    withdrawn = "Withdrawn"

class InterviewStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidate_profile = relationship("Candidate", back_populates="user", uselist=False)
    owned_organizations = relationship("Organization", back_populates="owner")
    organization_memberships = relationship("OrganizationMember", back_populates="user")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    phone = Column(String)
    education = Column(String)
    skills = Column(Text)
    experience = Column(Text)
    resume_url = Column(String)
    profile_picture_url = Column(String)

    user = relationship("User", back_populates="candidate_profile")
    applications = relationship("Application", back_populates="candidate")

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="owned_organizations")
    members = relationship("OrganizationMember", back_populates="organization")
    jobs = relationship("Job", back_populates="organization")
    career_page = relationship("CareerPage", back_populates="organization", uselist=False)

class CareerPage(Base):
    __tablename__ = "career_pages"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), unique=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String)
    description = Column(Text)
    logo_url = Column(String)
    primary_color = Column(String, default="#3B82F6")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organization = relationship("Organization", back_populates="career_page")

class OrganizationMember(Base):
    __tablename__ = "organization_members"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False) # e.g. "owner", "recruiter"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    organization = relationship("Organization", back_populates="members")
    user = relationship("User", back_populates="organization_memberships")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    department = Column(String)
    location = Column(String)
    employment_type = Column(String) # Full Time, Internship, Part Time, Contract
    work_mode = Column(String) # Remote, Hybrid, On-Site
    experience_required = Column(String)
    job_level = Column(String) # Fresher, Junior, Mid-Level, Senior, Lead
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    openings = Column(Integer, default=1)
    skills_required = Column(Text)
    application_deadline = Column(DateTime(timezone=True))
    status = Column(Enum(JobStatus, native_enum=False), default=JobStatus.open)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organization = relationship("Organization", back_populates="jobs")
    applications = relationship("Application", back_populates="job")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    status = Column(Enum(ApplicationStatus, native_enum=False), default=ApplicationStatus.applied)
    current_stage = Column(String)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    interview_date = Column(DateTime(timezone=True))
    feedback = Column(Text)
    notes = Column(Text)
    resume_snapshot_url = Column(String)
    candidate_score = Column(Integer) # Non-AI score out of 100
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")
    interview = relationship("Interview", back_populates="application", uselist=False)

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), unique=True, nullable=False)
    date = Column(DateTime(timezone=True))
    mode = Column(String) # e.g. "Google Meet", "In-person"
    meet_link = Column(String)
    duration = Column(Integer) # duration in minutes
    feedback = Column(Text)
    status = Column(Enum(InterviewStatus, native_enum=False), default=InterviewStatus.scheduled)

    application = relationship("Application", back_populates="interview")
