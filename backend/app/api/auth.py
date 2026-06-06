from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.schemas import UserCreate, UserResponse
from app.core.security import verify_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/sync", response_model=UserResponse)
def sync_user(user_data: UserCreate, db: Session = Depends(get_db), decoded_token: dict = Depends(verify_token)):
    """
    Called by the frontend after Firebase login/signup.
    Ensures the user exists in our local PostgreSQL database.
    """
    firebase_uid = decoded_token.get("uid")
    
    # Ensure the user is not trying to sync for a different firebase uid
    if firebase_uid != user_data.firebase_uid:
        raise HTTPException(status_code=403, detail="Token UID does not match requested UID")

    # Check if user already exists
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    if user:
        return user
    
    # Create new user
    new_user = User(
        firebase_uid=user_data.firebase_uid,
        name=user_data.name,
        email=user_data.email,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user
