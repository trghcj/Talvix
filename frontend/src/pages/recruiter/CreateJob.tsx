import React, { useState } from 'react';
import Editor from 'react-simple-wysiwyg';
import { apiClient } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const CreateJob = () => {
  const { activeOrganization } = useAuthStore();
  const [description, setDescription] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    employment_type: 'Full Time',
    work_mode: 'Remote',
    experience_required: '',
    job_level: 'Mid-Level',
    salary_min: '',
    salary_max: '',
    currency: 'USD',
    openings: 1,
    skills_required: '',
    application_deadline: '',
    job_category: 'Tech',
  });
  
  const [jdPdfUrl, setJdPdfUrl] = useState<string | null>(null);
  const [isUploadingJd, setIsUploadingJd] = useState(false);
  
  const navigate = useNavigate();

  const handleEditorChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    setIsUploadingJd(true);
    try {
      const res = await apiClient.post('/api/jobs/upload-jd', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setJdPdfUrl(res.data.url);
      toast.success("JD PDF uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload JD PDF");
      console.error(err);
    } finally {
      setIsUploadingJd(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiClient.post('/api/jobs', {
        ...formData,
        organization_id: activeOrganization?.id,
        description: description,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        openings: parseInt(formData.openings.toString()),
        jd_pdf_url: jdPdfUrl,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null
      });
      toast.success("Job posted successfully!");
      navigate('/dashboard/jobs'); // Navigate to job management
    } catch (err) {
      toast.error("Failed to post job");
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Create New Job Posting</h1>
      
      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Job Title</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Work Mode</label>
            <select name="work_mode" value={formData.work_mode} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-Site</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Employment Type</label>
            <select name="employment_type" value={formData.employment_type} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}>
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Job Level</label>
            <select name="job_level" value={formData.job_level} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}>
              <option>Fresher</option>
              <option>Junior</option>
              <option>Mid-Level</option>
              <option>Senior</option>
              <option>Lead</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Experience Required (e.g. 3-5 Years)</label>
            <input type="text" name="experience_required" value={formData.experience_required} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Skills Required (Comma separated)</label>
            <input type="text" name="skills_required" value={formData.skills_required} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Currency</label>
            <select name="currency" value={formData.currency} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Minimum Salary / Stipend</label>
            <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange} placeholder="e.g. 50000" style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Maximum Salary / Stipend</label>
            <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange} placeholder="e.g. 80000" style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Application Deadline</label>
            <input type="datetime-local" name="application_deadline" value={formData.application_deadline} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', colorScheme: 'dark' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Job Category</label>
            <select name="job_category" value={formData.job_category} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}>
              <option>Tech</option>
              <option>Non-Tech</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Job Description PDF (Optional)</label>
            <input type="file" accept="application/pdf" onChange={handleFileUpload} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
            {isUploadingJd && <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>Uploading...</div>}
            {jdPdfUrl && <div style={{ color: '#4ade80', fontSize: '0.8rem', marginTop: '4px' }}>✓ PDF Uploaded</div>}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Job Description</label>
          <div style={{ background: 'white', color: 'black', borderRadius: '8px', overflow: 'hidden' }}>
            <Editor 
              value={description} 
              onChange={handleEditorChange} 
              containerProps={{ style: { height: '200px', marginBottom: '40px' } }}
            />
          </div>
        </div>

        <button type="submit" style={{ padding: '10px 24px', background: '#6366f1', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Post Job
        </button>
      </form>
    </div>
  );
};

export default CreateJob;
