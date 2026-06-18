# Talvix

## Recruitment Management & Analytics Platform

Talvix is a modern recruitment management platform designed to streamline the hiring process through job lifecycle management, applicant tracking, interview scheduling, and recruitment analytics.

---

## Features

### Candidate
- User Registration & Login (Firebase Auth)
- Profile Management
- Resume Upload (Supabase Storage)
- Job Search & Applications
- Application Tracking

### Recruiter
- Create & Manage Jobs
- View Applicants (Kanban Pipeline)
- Schedule Interviews
- Update Candidate Status
- **Public Career Page Builder** (Customizable branded career pages)

### Admin
- User Management
- Recruiter Management
- Platform Monitoring
- Recruitment Analytics

### Analytics
- Hiring Funnel Analysis
- Application Statistics
- Recruiter Performance
- Monthly Hiring Trends
- Job Performance Metrics

---

## Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- React Router
- Zustand
- TanStack Query
- **Tailwind CSS**

### Backend
- FastAPI
- SQLAlchemy
- Alembic
- **Firebase Admin SDK** (Authentication)

### Database & Storage
- **Supabase** (PostgreSQL)
- **Supabase Storage** (Resumes & Media)

### Deployment
- Vercel (Frontend)
- Railway / Render (Backend)

---

## Project Structure

```text
Talvix
│
├── frontend
│
├── backend
│
├── docs
│
└── README.md
```

---

## Architecture

```text
      Firebase (Auth)
            │
            ▼
      React Frontend
            │
            ▼
      FastAPI Backend
            │
            ▼
   Supabase (PostgreSQL)
```

---

## Roadmap

- [x] Repository Setup
- [x] Authentication Module (Firebase)
- [x] Candidate Module
- [x] Recruiter Module
- [x] Job Management
- [x] Applicant Tracking System (Kanban Board)
- [x] Interview Scheduler
- [x] Public Career Page Builder
- [ ] Analytics Dashboard
- [ ] Dockerization
- [ ] Cloud Deployment

---

## Author

Divyansh Singh

Talvix – Track Talent. Drive Hiring.
