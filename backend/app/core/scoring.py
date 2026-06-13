from app.db.models import Candidate, Job

def calculate_candidate_score(candidate: Candidate, job: Job) -> int:
    score = 0
    max_score = 100

    # 1. Profile Completion (20 points max)
    if candidate.phone:
        score += 5
    if candidate.education:
        score += 5
    if candidate.skills:
        score += 5
    if candidate.experience:
        score += 5
        
    # 2. Skills Match (40 points max)
    if job.skills_required and candidate.skills:
        job_skills = [s.strip().lower() for s in job.skills_required.split(",")]
        cand_skills = [s.strip().lower() for s in candidate.skills.split(",")]
        
        matches = len(set(job_skills) & set(cand_skills))
        total_required = len(job_skills)
        if total_required > 0:
            skills_score = int((matches / total_required) * 40)
            score += min(skills_score, 40)

    # 3. Experience Match (20 points max)
    # Simple keyword heuristic since we don't have structured YOE yet
    if job.experience_required and candidate.experience:
        if str(job.experience_required).lower() in candidate.experience.lower():
            score += 20
        else:
            score += 10 # Partial score just for having experience listed

    # 4. Education (20 points max)
    if candidate.education:
        score += 20

    return min(score, max_score)
