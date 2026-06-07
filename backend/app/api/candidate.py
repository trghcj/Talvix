import cloudinary
import cloudinary.uploader
import io
import re
from pypdf import PdfReader
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, Candidate
from app.schemas.schemas import CandidateUpdate, CandidateResponse
from app.core.security import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/candidate", tags=["Candidate"])

# Initialize Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

@router.get("/profile", response_model=CandidateResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "candidate":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a candidate")
    
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
    if current_user.role.value != "candidate":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a candidate")
        
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        candidate = Candidate(user_id=current_user.id)
        db.add(candidate)
        db.commit()
        
    if profile_data.phone is not None:
        candidate.phone = profile_data.phone
    if profile_data.college is not None:
        candidate.college = profile_data.college
    if profile_data.skills is not None:
        candidate.skills = profile_data.skills
    if profile_data.experience is not None:
        candidate.experience = profile_data.experience
        
    db.commit()
    db.refresh(candidate)
    return candidate



@router.post("/resume", response_model=CandidateResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "candidate":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a candidate")
        
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
            if line_lower in ["education", "academics"]:
                if i + 1 < len(lines):
                    candidate.college = lines[i+1]
                break
                
        # Fallback to keyword search if header not found
        if not candidate.college:
            for line in lines:
                if "university" in line.lower() or "college" in line.lower() or "institute" in line.lower():
                    candidate.college = line
                    break

        # 4. Upload to Cloudinary
        # We need to seek back to start since we already read it!
        # Instead, we just pass the BytesIO object
        result = cloudinary.uploader.upload(
            io.BytesIO(file_contents), 
            resource_type="raw", 
            folder="resumes",
            public_id=file.filename
        )
        
        # Save URL to database
        candidate.resume_url = result.get('secure_url')
        db.commit()
        db.refresh(candidate)
        
        return candidate
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process and upload resume: {str(e)}")
