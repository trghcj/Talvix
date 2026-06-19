<div align="center">
  <img src="frontend/public/Talvix_Logo.png" alt="Talvix Logo" width="200"/>
  <h1>Talvix</h1>
  <p><strong>Track Talent. Drive Hiring.</strong></p>
  <p>A full-stack, cloud-native recruitment management and analytics platform.</p>
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
</div>

<br />

Talvix is a comprehensive recruitment management platform designed to help organizations streamline their hiring process. From job postings and applicant tracking to interview scheduling and hiring analytics, Talvix provides a scalable and modern ATS (Applicant Tracking System) experience for modern teams.

## ✨ Key Highlights

* **Multi-role Authentication:** Secure workspaces for Candidates, Recruiters, and Admins.
* **Applicant Tracking System:** Interactive Kanban pipeline for dragging and dropping candidates through hiring stages.
* **Resume Management:** Secure storage and easy retrieval of candidate resumes.
* **Interview Scheduling:** Built-in workflows to coordinate interviews effortlessly.
* **Public Career Pages:** Auto-generated, branded job boards for candidates to browse and apply.
* **Rich Analytics Dashboard:** Actionable insights on hiring funnels, performance, and trends.
* **Cloud-Native Architecture:** Fast, reliable, and scalable infrastructure.

---

## 🏗️ System Architecture

```text
Candidate / Recruiter / Admin
            │
            ▼
      Firebase Auth (Identity & Security)
            │
            ▼
      React Frontend (Vite + TypeScript)
            │
     REST API Layer (Axios / TanStack Query)
            │
            ▼
      FastAPI Backend (High-Performance Python)
            │
            ▼
      SQLAlchemy ORM (Database Management)
            │
            ▼
 Supabase PostgreSQL (Managed Relational DB)
```

---

## 🚀 Features

### 👤 Candidate Portal
* **User Registration & Login:** Seamless onboarding.
* **Profile & Resume Management:** Keep details and documents up to date.
* **Job Search & Filtering:** Find open Tech & Non-Tech roles instantly.
* **Application Tracking:** Real-time visibility into application statuses.

### 👔 Recruiter Portal
* **Job Management:** Create, edit, and safely close job postings.
* **Kanban ATS Board:** Visual tracking of the entire talent pipeline.
* **Interview Scheduling:** Coordinate with candidates and track outcomes.
* **Dynamic Career Pages:** Publish open roles directly to candidates.

### 👑 Admin Portal
* **User & Recruiter Management:** Control access and organization membership.
* **Platform Monitoring:** Oversee system health and activity.

### 📊 Analytics
* **Hiring Funnel Analysis:** Identify bottlenecks in the recruitment pipeline.
* **Performance Metrics:** Track recruiter activity and time-to-hire.
* **Job Statistics:** Analyze which postings attract the best talent.

---

## 🛠️ Technology Stack

| Layer            | Technology                 |
| ---------------- | -------------------------- |
| **Frontend**     | React.js, TypeScript, Vite |
| **State Mgmt**   | Zustand, TanStack Query    |
| **Styling**      | Tailwind CSS, Lucide Icons |
| **Backend**      | FastAPI, Python 3          |
| **ORM**          | SQLAlchemy, Alembic        |
| **Auth**         | Firebase Authentication    |
| **Database**     | PostgreSQL (Supabase)      |
| **Storage**      | Supabase Storage           |
| **Deployment**   | Vercel (UI), Render (API)  |

---

## 📁 Project Structure

```text
Talvix/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route views (Recruiter, Candidate, Admin)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API client configurations
│   │   └── store/        # Zustand state management
│   └── public/           # Static assets (Logos, Icons)
│
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/          # REST endpoints
│   │   ├── models/       # SQLAlchemy DB models
│   │   ├── schemas/      # Pydantic validation models
│   │   ├── services/     # Business logic layer
│   │   └── database/     # DB connection & setup
│   └── alembic/          # Database migration scripts
│
├── docs/                 # Documentation & assets
└── README.md
```

---

## 💻 Local Development

### Prerequisites
* Node.js (v18+)
* Python (3.9+)
* PostgreSQL instance (or Supabase local setup)
* Firebase Project credentials

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

### Environment Variables

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
```

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/talvix
FIREBASE_PROJECT_ID=your_project_id
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

---

## 🗺️ Roadmap

- [x] Authentication & Authorization
- [x] Candidate Portal
- [x] Recruiter Portal
- [x] Applicant Tracking System (Kanban)
- [x] Interview Scheduler
- [x] Career Page Builder
- [x] Job Categorization & Filtering
- [x] Comprehensive Analytics Dashboard (Org & Platform)
- [x] Multi-tenant Enterprise Support
- [ ] Automated Email Notifications
- [ ] AI Resume Screening
- [ ] Docker Containerization

---

## 🔮 Future Enhancements

* **AI Resume Parsing:** Automatically extract skills and experience from PDFs.
* **AI Candidate Matching:** Smart scoring to rank candidates against job descriptions.
* **Email Automation:** Trigger customizable emails when moving candidates between stages.
* **Interview Feedback:** Collaborative scoring and feedback notes for interviewers.

---

## 👨‍💻 Author

**Divyansh Singh**

*Building the future of recruitment software.*
