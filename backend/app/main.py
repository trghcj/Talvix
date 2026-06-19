from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, candidate, recruiter, jobs, applications, organizations, public, interviews, admin, superadmin
import os
import subprocess
import cloudinary
import cloudinary.uploader
from contextlib import asynccontextmanager
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        print("Running database migrations...")
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        print("Database migrations applied successfully!")

        print("Running data migration to fix localhost URLs...")
        from app.db.database import SessionLocal
        from app.db.models import Candidate, Application
        db = SessionLocal()
        try:
            candidates = db.query(Candidate).all()
            for c in candidates:
                if c.resume_url and "localhost:8001" in c.resume_url:
                    c.resume_url = c.resume_url.replace("http://localhost:8001", "https://talvix-api.onrender.com")
                if c.profile_picture_url and "localhost:8001" in c.profile_picture_url:
                    c.profile_picture_url = c.profile_picture_url.replace("http://localhost:8001", "https://talvix-api.onrender.com")
            
            apps = db.query(Application).all()
            for a in apps:
                if a.resume_snapshot_url and "localhost:8001" in a.resume_snapshot_url:
                    a.resume_snapshot_url = a.resume_snapshot_url.replace("http://localhost:8001", "https://talvix-api.onrender.com")
            
            db.commit()
            print("Data migration completed.")
        finally:
            db.close()

    except Exception as e:
        print(f"Error applying migrations: {e}")
    yield

app = FastAPI(title="Talvix API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://talvix-six.vercel.app"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(auth.router, prefix="/api")
app.include_router(candidate.router, prefix="/api")
app.include_router(recruiter.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(organizations.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(superadmin.router, prefix="/api")
app.include_router(public.router, prefix="/api")

# Serve static files from the 'app/public' directory
os.makedirs("app/public/resumes", exist_ok=True)
app.mount("/public", StaticFiles(directory="app/public"), name="public")

@app.get("/")
def root():
    return {"message": "Talvix API Running"}