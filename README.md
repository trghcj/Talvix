# Talvix

## Recruitment Management & Analytics Platform

Talvix is a full-stack recruitment management platform that helps organizations streamline hiring through job management, applicant tracking, interview scheduling, recruiter workflows, and hiring analytics.

Built with React, TypeScript, FastAPI, Firebase Authentication, and Supabase PostgreSQL, Talvix provides a scalable and modern ATS (Applicant Tracking System) experience.

### Key Highlights

* Multi-role Authentication (Candidate, Recruiter, Admin)
* Applicant Tracking System (Kanban Pipeline)
* Resume Management & Storage
* Interview Scheduling Workflow
* Public Career Page Builder
* Recruitment Analytics Dashboard
* Cloud-Native Architecture
* REST API Backend

---

## System Architecture

```text
Candidate / Recruiter / Admin
            │
            ▼
      Firebase Auth
            │
            ▼
      React Frontend
            │
     REST API Layer
            │
            ▼
      FastAPI Backend
            │
            ▼
      SQLAlchemy ORM
            │
            ▼
 Supabase PostgreSQL Database
```

## Features

### Candidate Portal

* User Registration & Login
* Profile Management
* Resume Upload
* Job Search
* Job Applications
* Application Tracking

### Recruiter Portal

* Create & Manage Jobs
* Applicant Tracking Board
* Interview Scheduling
* Candidate Status Updates
* Public Career Page Builder

### Admin Portal

* User Management
* Recruiter Management
* Platform Monitoring
* Recruitment Analytics

### Analytics

* Hiring Funnel Analysis
* Application Statistics
* Recruiter Performance
* Monthly Hiring Trends
* Job Performance Metrics

---

## Technology Stack

| Layer            | Technology                 |
| ---------------- | -------------------------- |
| Frontend         | React.js, TypeScript, Vite |
| State Management | Zustand                    |
| Data Fetching    | TanStack Query             |
| Styling          | Tailwind CSS               |
| Backend          | FastAPI                    |
| ORM              | SQLAlchemy                 |
| Migrations       | Alembic                    |
| Authentication   | Firebase Auth              |
| Database         | PostgreSQL (Supabase)      |
| File Storage     | Supabase Storage           |
| Deployment       | Vercel, Railway            |

---

## Project Structure

```text
Talvix
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── services
│   └── store
│
├── backend
│   ├── app
│   ├── api
│   ├── models
│   ├── schemas
│   ├── services
│   └── database
│
├── docs
│
└── README.md
```

---

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

## Environment Variables

### Frontend

```env
VITE_API_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
```

### Backend

```env
DATABASE_URL=
FIREBASE_PROJECT_ID=
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=
```

## Roadmap

* [x] Authentication
* [x] Candidate Portal
* [x] Recruiter Portal
* [x] Applicant Tracking System
* [x] Interview Scheduler
* [x] Career Page Builder
* [ ] Analytics Dashboard
* [ ] Email Notifications
* [ ] AI Resume Screening
* [ ] Docker Support
* [ ] Cloud Deployment

---

## Future Enhancements

* AI Resume Parsing
* AI Candidate Matching
* Email Automation
* Recruiter Collaboration
* Interview Feedback System
* Talent Analytics Insights

---

## Author

**Divyansh Singh**

Talvix — Track Talent. Drive Hiring.
