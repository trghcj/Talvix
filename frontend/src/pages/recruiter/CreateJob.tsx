import React, { useState } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { apiClient } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const CreateJob = () => {
  const { activeOrganization } = useAuthStore();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
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
    openings: 1,
    skills_required: '',
  });
  
  const navigate = useNavigate();

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawContentState = convertToRaw(editorState.getCurrentContent());
    const markup = draftToHtml(rawContentState);

    try {
      await apiClient.post('/api/jobs', {
        ...formData,
        organization_id: activeOrganization?.id,
        description: markup,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        openings: parseInt(formData.openings.toString())
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
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'white' }}>Create New Job Posting</h1>
      
      <form onSubmit={handleSubmit} style={{ background: '#111315', padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Job Title</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Work Mode</label>
            <select name="work_mode" value={formData.work_mode} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-Site</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Employment Type</label>
            <select name="employment_type" value={formData.employment_type} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Job Level</label>
            <select name="job_level" value={formData.job_level} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
              <option>Fresher</option>
              <option>Junior</option>
              <option>Mid-Level</option>
              <option>Senior</option>
              <option>Lead</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Experience Required (e.g. 3-5 Years)</label>
            <input type="text" name="experience_required" value={formData.experience_required} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Skills Required (Comma separated)</label>
            <input type="text" name="skills_required" value={formData.skills_required} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Job Description</label>
          <div style={{ background: 'white', color: 'black', minHeight: '200px', padding: '10px', borderRadius: '8px' }}>
            <Editor
              editorState={editorState}
              onEditorStateChange={handleEditorChange}
            />
          </div>
        </div>

        <button type="submit" style={{ padding: '10px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Post Job
        </button>
      </form>
    </div>
  );
};

export default CreateJob;
