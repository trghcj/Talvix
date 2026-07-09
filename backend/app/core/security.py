import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User

import json

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    try:
        firebase_cred_env = os.environ.get("FIREBASE_CREDENTIALS")
        if firebase_cred_env:
            # Load from environment variable (Render)
            cred_dict = json.loads(firebase_cred_env)
            cred = credentials.Certificate(cred_dict)
        else:
            # Load from file (Local)
            cred_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "serviceAccountKey.json")
            cred = credentials.Certificate(cred_path)
            
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Error initializing Firebase Admin: {e}")

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token, clock_skew_seconds=60)
        return decoded_token
    except Exception as e:
        print(f"Firebase token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(decoded_token: dict = Depends(verify_token), db: Session = Depends(get_db)):
    firebase_uid = decoded_token.get("uid")
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found in database. Please sync user profile.")
    return user
