from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, Organization, Job, Application
from app.core.security import get_current_user

router = APIRouter(prefix="/superadmin", tags=["Super Admin"])

def verify_super_admin(current_user: User):
    if not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Must be a super admin")

@router.get("/analytics")
def get_platform_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_super_admin(current_user)
    
    total_users = db.query(User).count()
    total_organizations = db.query(Organization).count()
    total_jobs = db.query(Job).count()
    total_applications = db.query(Application).count()
    
    return {
        "total_users": total_users,
        "total_organizations": total_organizations,
        "total_jobs": total_jobs,
        "total_applications": total_applications
    }

@router.get("/organizations")
def get_all_organizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_super_admin(current_user)
    
    organizations = db.query(Organization).all()
    result = []
    for org in organizations:
        result.append({
            "id": org.id,
            "name": org.name,
            "owner_id": org.owner_id,
            "created_at": org.created_at,
            "job_count": len(org.jobs)
        })
    return result

@router.get("/users")
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_super_admin(current_user)
    
    users = db.query(User).all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_super_admin": user.is_super_admin,
            "created_at": user.created_at
        })
    return result
