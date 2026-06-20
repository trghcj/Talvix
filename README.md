# Talvix ATS 🚀

![Talvix Cover](https://via.placeholder.com/1200x400/111315/ffffff?text=Talvix+-+The+All-In-One+Hiring+Platform)

> Streamline Hiring. Track Talent. Drive Decisions. An end-to-end Applicant Tracking System (ATS) designed to simplify your entire recruitment pipeline and help you hire better.

## 🌟 Features

Talvix is built to handle the entire lifecycle of a candidate, from job posting to offer generation, complete with a robust multi-tenant organization architecture.

- **Multi-Tenant Organizations:** Create isolated workspaces for different companies. 
- **Hierarchical Access Control:** Robust role-based access (`Owner`, `Admin`, `Recruiter`). Owners can manage settings and generate secure Invite Codes, Admins can manage the team and view analytics, and Recruiters can focus on processing candidates.
- **Dynamic Job Postings:** Create customized job postings with multi-currency salary brackets, department tagging, and required skills.
- **Kanban Applicant Tracking:** Seamlessly track candidates through multiple configurable stages (Applied, Screening, Interviewing, Hired, etc.).
- **Interactive Dashboards & Analytics:** Real-time metrics tracking job volume, application statuses, and team activity.
- **Modern UI/UX:** A stunning, premium interface built with Glassmorphism, tailored Light/Dark modes, and smooth micro-animations.

## 🛠 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (with dynamic global theming)
- React Router DOM
- Zustand (Global State Management)
- Lucide React (Icons)

**Backend:**
- FastAPI (Python 3.10+)
- PostgreSQL (Supabase)
- SQLAlchemy (ORM) & Alembic (Migrations)
- Firebase Admin (Authentication)

---

## 🐳 Dockerization

Talvix is fully containerized and production-ready. You can easily run the entire platform locally using Docker.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.
- Ensure your `.env` files are configured:
  - Place your Firebase `serviceAccountKey.json` inside the `backend/` folder.
  - Set up `backend/.env` with your Supabase database URL.
  - Set up `frontend/.env` with your Vite environment variables.

### Running the App with Docker

1. **Open your terminal** in the root of the project (where `docker-compose.yml` is located).
2. **Build and start the containers** in detached mode:
   ```bash
   docker-compose up --build -d
   ```
3. **Access the application**:
   - The Frontend is now running on [http://localhost](http://localhost) (Port 80)
   - The Backend API is running on [http://localhost:8000](http://localhost:8000)

### Stopping the App
To stop the application and spin down the containers, run:
```bash
docker-compose down
```

---

## 💻 Local Development (Without Docker)

If you prefer to run the development servers manually:

### Backend
1. `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `alembic upgrade head`
6. Start the server: `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
