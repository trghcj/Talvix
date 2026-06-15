from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, candidate, recruiter, jobs, applications, organizations
import os

app = FastAPI(title="Talvix API")

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

# Serve static files from the 'app/public' directory
os.makedirs("app/public/resumes", exist_ok=True)
app.mount("/public", StaticFiles(directory="app/public"), name="public")

@app.get("/")
def root():
    return {"message": "Talvix API Running"}