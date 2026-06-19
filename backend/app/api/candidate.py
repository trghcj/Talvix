import io
import os
import time
import re
from pypdf import PdfReader
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, Candidate
from app.schemas.schemas import CandidateUpdate, CandidateResponse
from app.core.security import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/candidate", tags=["Candidate"])

@router.get("/profile", response_model=CandidateResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        candidate = Candidate(user_id=current_user.id)
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
        
    return candidate

@router.put("/profile", response_model=CandidateResponse)
def update_profile(
    profile_data: CandidateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        candidate = Candidate(user_id=current_user.id)
        db.add(candidate)
        db.commit()
        
    if profile_data.phone is not None:
        candidate.phone = profile_data.phone
    if profile_data.education is not None:
        candidate.education = profile_data.education
    if profile_data.skills is not None:
        candidate.skills = profile_data.skills
    if profile_data.experience is not None:
        candidate.experience = profile_data.experience
        
    db.commit()
    db.refresh(candidate)
    return candidate



@router.post("/resume", response_model=CandidateResponse)
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        candidate = Candidate(user_id=current_user.id)
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
        
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # 1. Read PDF file contents into memory
        file_contents = await file.read()
        
        # 2. Extract Text using pypdf
        pdf_reader = PdfReader(io.BytesIO(file_contents))
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text() + "\n"
            
        # 3. Very Basic Keyword Parsing
        text_lower = extracted_text.lower()
        
        # Extract Skills
        tech_keywords = ['react', 'angular', 'vue', 'python', 'java', 'c++', 'sql', 'node.js', 'aws', 'docker', 'kubernetes', 'typescript', 'javascript', 'fastapi', 'django']
        found_skills = [skill for skill in tech_keywords if skill in text_lower]
        if found_skills:
            candidate.skills = ", ".join(found_skills).title()

        # Extract Experience (basic heuristic)
        if "experience" in text_lower:
            start_idx = text_lower.find("experience")
            end_idx = text_lower.find("education", start_idx)
            if end_idx == -1: end_idx = start_idx + 1000 # Grab up to 1000 chars if education isn't found
            exp_text = extracted_text[start_idx:end_idx].strip()
            # Remove the "Experience" header itself if we can
            exp_text = re.sub(r'(?i)^experience\s*', '', exp_text)
            if exp_text:
                candidate.experience = exp_text[:1000] # Cap length
                
        # Extract College (improved heuristic)
        lines = [line.strip() for line in extracted_text.split('\n') if line.strip()]
        for i, line in enumerate(lines):
            line_lower = line.lower()
            # Check for common education headers (allowing for extra words like "Education & Certifications")
            if "education" in line_lower or "academic" in line_lower:
                # If it's a short line, it's likely a header, grab the next line
                if len(line_lower.split()) <= 4:
                    if i + 1 < len(lines):
                        candidate.education = lines[i+1]
                    break
                # If it contains a colon, the value might be after it
                elif ":" in line:
                    candidate.education = line.split(":", 1)[1].strip()
                    break
                
        # Fallback to keyword search if header not found or next line was blank
        if not candidate.education or len(candidate.education) < 3:
            for line in lines:
                line_lower = line.lower()
                if any(kw in line_lower for kw in ["university", "college", "institute", "school", "academy", "b.tech", "b.sc", "degree"]):
                    candidate.education = line
                    break

        # 4. Upload to Cloudinary
        timestamp = int(time.time())
        safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
        
        import cloudinary.uploader
        upload_result = cloudinary.uploader.upload(
            file_contents,
            resource_type="raw",
            use_filename=True,
            folder="resumes",
            public_id=safe_filename
        )
        
        candidate.resume_url = upload_result.get("secure_url")
        db.commit()
        db.refresh(candidate)
        
        return candidate
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process and upload resume: {str(e)}")

@router.post("/profile-picture", response_model=CandidateResponse)
async def upload_profile_picture(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        candidate = Candidate(user_id=current_user.id)
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
        
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    try:
        file_contents = await file.read()
        
        timestamp = int(time.time())
        safe_filename = f"pp_{timestamp}_{file.filename.replace(' ', '_')}"
        
        import cloudinary.uploader
        upload_result = cloudinary.uploader.upload(
            file_contents,
            folder="profiles",
            public_id=safe_filename
        )
        
        candidate.profile_picture_url = upload_result.get("secure_url")
        db.commit()
        db.refresh(candidate)
        
        return candidate
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload profile picture: {str(e)}")
