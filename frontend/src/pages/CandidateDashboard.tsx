import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiClient } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Profile State
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [applications, setApplications] = useState<Record<string, unknown>[]>([]);

  const fetchApplications = async () => {
    try {
      const res = await apiClient.get('/api/applications');
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/api/candidate/profile');
      const data = res.data;
      setPhone(data.phone || '');
      setEducation(data.education || '');
      setSkills(data.skills || '');
      setExperience(data.experience || '');
      setResumeUrl(data.resume_url || null);
      setProfilePictureUrl(data.profile_picture_url || null);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchApplications();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiClient.put('/api/candidate/profile', {
        phone,
        education,
        skills,
        experience
      });
      setMessage('Profile updated successfully!');
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/api/candidate/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfilePictureUrl(res.data.profile_picture_url);
      setMessage('Profile picture updated successfully!');
    } catch {
      setMessage('Failed to upload profile picture.');
    }
  };

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
      const res = await apiClient.post('/api/candidate/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeUrl(res.data.resume_url);
      setMessage('Resume uploaded successfully!');
    } catch {
      setMessage('Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: '#222', border: '2px solid #444', flexShrink: 0 }}>
          {profilePictureUrl ? (
            <img src={profilePictureUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '24px' }}>
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <label htmlFor="pp-upload" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'var(--text-primary)', fontSize: '10px', textAlign: 'center', cursor: 'pointer', padding: '2px 0' }}>
            Edit
          </label>
          <input type="file" id="pp-upload" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePictureUpload} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Candidate Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.displayName || user?.email}</p>
        </div>
      </div>

      {message && (
        <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--accent-primary)' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        <Card>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 500 }}>Update Profile</h3>
          <form onSubmit={handleSaveProfile}>
            <Input 
              label="Phone Number" 
              placeholder="+1 234 567 8900" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
            <Input 
              label="College / University" 
              placeholder="e.g. Stanford University" 
              value={education} 
              onChange={e => setEducation(e.target.value)} 
            />
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.375rem', display: 'block' }}>Skills</label>
              <textarea 
                className="input-field" 
                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} 
                placeholder="React, Python, SQL..."
                value={skills}
                onChange={e => setSkills(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.375rem', display: 'block' }}>Experience</label>
              <textarea 
                className="input-field" 
                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} 
                placeholder="2 years at TechCorp building scalable web apps..."
                value={experience}
                onChange={e => setExperience(e.target.value)}
              />
            </div>
            <Button type="submit" isLoading={saving} fullWidth>Save Profile</Button>
          </form>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 500 }}>Resume Upload</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Upload your latest resume in PDF format. We will extract your skills automatically.
            </p>
            
            {resumeUrl ? (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ✓ Resume uploaded successfully
                </span>
                <a href={resumeUrl} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.875rem' }}>View Current Resume</a>
              </div>
            ) : null}

            <div style={{ border: '2px dashed var(--border-glass)', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleResumeUpload}
                style={{ display: 'none' }}
                id="resume-upload"
              />
              <label htmlFor="resume-upload">
                <Button type="button" variant="secondary" onClick={() => document.getElementById('resume-upload')?.click()} isLoading={uploading}>
                  Select PDF File
                </Button>
              </label>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>Max file size: 5MB</p>
            </div>
          </Card>

          <Card>
            <h3 style={{ marginBottom: '1rem', fontWeight: 500 }}>Recent Applications</h3>
            
            {applications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>No recent applications found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.slice(0, 5).map(app => (
                  <div key={app.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontWeight: 500, fontSize: '1rem' }}>{app.job?.title || 'Unknown Job'}</h4>
                      <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--accent-primary)', color: 'var(--text-primary)', borderRadius: '12px', textTransform: 'capitalize' }}>
                        {app.current_stage || app.status || 'Applied'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{app.job?.organization?.name || 'Unknown Company'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <Button variant="ghost" style={{ marginTop: '1.5rem' }} fullWidth onClick={() => navigate('/dashboard/candidate/jobs')}>
              Browse Jobs
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
};
