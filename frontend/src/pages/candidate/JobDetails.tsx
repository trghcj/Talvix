import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await apiClient.get(`/api/jobs/${jobId}`);
        setJob(response.data);
      } catch (error) {
        toast.error("Failed to load job details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleApply = async () => {
    try {
      setApplying(true);
      await apiClient.post('/api/applications', { job_id: parseInt(jobId!) });
      toast.success("Successfully applied!");
      navigate('/dashboard/candidate/applications');
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail || "You have already applied to this job.");
      } else {
        toast.error("Failed to apply. Please complete your profile first.");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!job) return <div className="p-6 text-gray-500">Job not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/dashboard/candidate/jobs" style={{ color: '#888', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>&larr; Back to Jobs</Link>
      
      <div style={{ background: '#111315', padding: '32px', borderRadius: '12px', border: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'white', marginBottom: '8px' }}>{job.title}</h1>
            <p style={{ color: '#888', fontSize: '1.1rem' }}>{job.department} • {job.location || 'Remote'}</p>
          </div>
          <button 
            onClick={handleApply} 
            disabled={applying}
            style={{ padding: '12px 32px', background: applying ? '#4f46e5' : '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: applying ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
          >
            {applying ? 'Applying...' : 'Apply Now'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ background: '#1a1d21', padding: '12px 16px', borderRadius: '8px' }}>
            <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '4px' }}>Employment Type</p>
            <p style={{ color: 'white', fontWeight: 'bold' }}>{job.employment_type}</p>
          </div>
          <div style={{ background: '#1a1d21', padding: '12px 16px', borderRadius: '8px' }}>
            <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '4px' }}>Work Mode</p>
            <p style={{ color: 'white', fontWeight: 'bold' }}>{job.work_mode}</p>
          </div>
          <div style={{ background: '#1a1d21', padding: '12px 16px', borderRadius: '8px' }}>
            <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '4px' }}>Experience</p>
            <p style={{ color: 'white', fontWeight: 'bold' }}>{job.experience_required || 'Not Specified'}</p>
          </div>
          <div style={{ background: '#1a1d21', padding: '12px 16px', borderRadius: '8px' }}>
            <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '4px' }}>Salary</p>
            <p style={{ color: 'white', fontWeight: 'bold' }}>
              {job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : 'Not Disclosed'}
            </p>
          </div>
        </div>

        <div>
          <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Job Description</h2>
          <div 
            style={{ color: '#ccc', lineHeight: '1.6' }} 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: job.description }} 
          />
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
