import re

extracted_text = """Divyansh Singh
+91-9540986926 singhdivyansh.016cseai@gmail.com LinkedIn: Divyansh Singh GitHub: trghcj Portfolio
Education
Maharaja Agrasen Institute of Technology (MAIT) Delhi, India
B.Tech – Computer Science & Engineering (AI) CGPA: 8.78/10.0 08/2023 – 07/2027
Kendriya Vidyalaya India
Class XII (CBSE) – 85.5% 2022
Professional Experience
Innoviti Solutions – Software Engineering Intern 05/2026 – Present
• Architected an app-wide error boundary and OfflineGuard in Flutter, integrating Firebase Crashlytics via runZonedGuarded to
catch unhandled async exceptions and prevent production crashes.
"""

candidate_college = ""
candidate_experience = ""

text_lower = extracted_text.lower()

# Extract Experience
if "experience" in text_lower:
    start_idx = text_lower.find("experience")
    end_idx = text_lower.find("projects", start_idx)
    if end_idx == -1: end_idx = text_lower.find("education", start_idx)
    if end_idx == -1: end_idx = start_idx + 1000
    exp_text = extracted_text[start_idx:end_idx].strip()
    exp_text = re.sub(r'(?i)^experience\s*', '', exp_text)
    if exp_text:
        candidate_experience = exp_text[:1000]

# Extract College
lines = [line.strip() for line in extracted_text.split('\n') if line.strip()]
for i, line in enumerate(lines):
    line_lower = line.lower()
    if "education" in line_lower or "academic" in line_lower:
        if len(line_lower.split()) <= 4:
            if i + 1 < len(lines):
                candidate_college = lines[i+1]
            break
        elif ":" in line:
            candidate_college = line.split(":", 1)[1].strip()
            break

if not candidate_college or len(candidate_college) < 3:
    for line in lines:
        line_lower = line.lower()
        if any(kw in line_lower for kw in ["university", "college", "institute", "school", "academy", "b.tech", "b.sc", "degree"]):
            candidate_college = line
            break

print("COLLEGE:", candidate_college)
print("EXPERIENCE:", candidate_experience[:100] + "...")
