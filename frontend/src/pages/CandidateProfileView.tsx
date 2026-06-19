import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { apiClient } from '../services/api';
import { useAuthStore } from '../store/authStore';
import './CandidateProfileView.css';

export const CandidateProfileView = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/api/candidate/profile');
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // The backend will now parse the resume and update the profile!
      const res = await apiClient.post('/api/candidate/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // The response is the newly updated profile with parsed data
      setProfile(res.data);
      alert('Resume parsed successfully! Your profile has been updated.');
    } catch {
      alert('Failed to upload and parse resume.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="layout-loader"><span className="loader"></span></div>;

  const skillsList = profile?.skills ? profile.skills.split(',').map((s: string) => s.trim()) : [];

  return (
    <div className="profile-view-container animate-fade-in">
      <div className="breadcrumb">
        <span>Candidates</span> <span className="separator">&gt;</span> <span className="current">My Profile</span>
      </div>

      <div className="profile-grid">
        {/* LEFT COLUMN: Profile Summary */}
        <div className="profile-sidebar">
          <Card padding="none" className="profile-card">
            <div className="cover-photo">
              <span className="verified-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Verified
              </span>
            </div>
            
            <div className="profile-info-section">
              <div className="avatar-wrapper" style={{ overflow: 'hidden', borderRadius: '50%' }}>
                {profile?.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="avatar-image">{user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}</div>
                )}
              </div>
              
              <div className="profile-header-text">
                <h2>{user?.displayName || user?.email?.split('@')[0]}</h2>
                <span className="role-badge">Candidate</span>
              </div>

              {skillsList.length > 0 && (
                <div className="info-group">
                  <h3>Skills</h3>
                  <div className="tag-list">
                    {skillsList.map((skill: string, idx: number) => (
                      <span key={idx} className="tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="location-grid">
                {profile?.phone && (
                  <div className="info-box">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{profile.phone}</span>
                  </div>
                )}
                <div className="info-box">
                  <span className="info-label">Email</span>
                  <span className="info-value" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</span>
                </div>
              </div>

              {profile?.resume_url && (
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  <Button fullWidth onClick={() => window.open(profile.resume_url, '_blank')}>
                    View Current Resume
                  </Button>
                </div>
              )}
              
              <div style={{ marginTop: profile?.resume_url ? '0.5rem' : '1.5rem' }}>
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleResumeUpload}
                  style={{ display: 'none' }}
                  id="profile-resume-upload"
                />
                <label htmlFor="profile-resume-upload" style={{ width: '100%', display: 'block' }}>
                  <Button type="button" variant={profile?.resume_url ? "outline" : "primary"} fullWidth onClick={() => document.getElementById('profile-resume-upload')?.click()} isLoading={uploading}>
                    {profile?.resume_url ? "Update Resume" : "Upload Resume (PDF)"}
                  </Button>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Detailed Info */}
        <div className="profile-main">
          
          <Card className="about-card">
            <h3 className="section-title">Professional Experience</h3>
            {(() => {
              if (!profile?.experience) {
                return (
                  <p className="bio-text" style={{ whiteSpace: 'pre-line' }}>
                    No experience details added yet. Edit your profile in the Dashboard to add your experience.
                  </p>
                );
              }

              const lines = profile.experience.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
              const jobs: { title: string, content: string[] }[] = [];
              let currentJob: { title: string, content: string[] } | null = null;

              lines.forEach((line: string) => {
                if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                  if (!currentJob) {
                    currentJob = { title: "Experience", content: [] };
                    jobs.push(currentJob);
                  }
                  currentJob.content.push(line);
                } else if (currentJob && !/^[A-Z]/.test(line[0])) {
                  if (currentJob.content.length > 0) {
                    currentJob.content[currentJob.content.length - 1] += ' ' + line;
                  } else {
                    currentJob.content.push(line);
                  }
                } else {
                  currentJob = { title: line, content: [] };
                  jobs.push(currentJob);
                }
              });

              if (jobs.length === 0) {
                return <p className="bio-text">{profile.experience}</p>;
              }

              return (
                <div className="experience-list">
                  {jobs.map((job, idx) => (
                    <div key={idx} className="experience-item">
                      <div className="exp-timeline">
                        <div className="exp-dot"></div>
                        {idx < jobs.length - 1 && <div className="exp-line"></div>}
                      </div>
                      <div className="exp-content">
                        <h4>{job.title.split('–')[0]?.trim() || job.title}</h4>
                        {job.title.includes('–') && (
                          <span className="exp-company">{job.title.substring(job.title.indexOf('–') + 1).trim()}</span>
                        )}
                        <ul style={{ listStyleType: 'none', padding: 0, marginTop: '0.5rem' }}>
                          {job.content.map((point, i) => (
                            <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                              <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>•</span>
                              <span>{point.replace(/^[•\-*]\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>

          <Card className="education-card mt-4">
            <h3 className="section-title">Education</h3>
            <div className="education-item">
              <div className="edu-icon">🎓</div>
              <div className="edu-content">
                <h4>{profile?.education || "Not specified"}</h4>
                <span className="edu-school">College / University</span>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
