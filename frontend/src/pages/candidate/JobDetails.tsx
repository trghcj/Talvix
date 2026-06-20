import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { apiClient } from '../../services/api';
import toast from 'react-hot-toast';

interface JobData {
  title: string;
  department: string;
  location?: string;
  employment_type: string;
  work_mode: string;
  experience_required?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  description: string;
  application_deadline?: string;
  jd_pdf_url?: string;
  job_category?: string;
  status: string;
}

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobData | null>(null);
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
    } catch (err: unknown) {
      const error = err as Record<string, unknown>;
      if ((error?.response as Record<string, unknown>)?.status === 400) {
        toast.error(((error?.response as Record<string, unknown>)?.data as Record<string, unknown>)?.detail as string || "You have already applied to this job.");
      } else {
        toast.error("Failed to apply. Please complete your profile first.");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!job) return <div className="p-6 text-gray-500">Job not found.</div>;

  const isClosed = job.status === 'Closed' || (job.application_deadline ? new Date(job.application_deadline) < new Date() : false);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/dashboard/candidate/jobs" style={{ color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>&larr; Back to Jobs</Link>
      
      <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
              {job.title}
              {job.job_category && (
                <span style={{ 
                  marginLeft: '12px',
                  background: job.job_category === 'Tech' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                  color: job.job_category === 'Tech' ? '#60a5fa' : '#c084fc',
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', verticalAlign: 'middle'
                }}>
                  {job.job_category}
                </span>
              )}
              {isClosed && <span style={{ marginLeft: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', verticalAlign: 'middle' }}>Closed</span>}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '8px' }}>{job.department} • {job.location || 'Remote'}</p>
            {job.application_deadline && !isClosed && (
              <p style={{ color: '#eab308', fontSize: '0.9rem', background: 'rgba(234, 179, 8, 0.1)', display: 'inline-block', padding: '4px 8px', borderRadius: '4px' }}>
                <strong>Deadline:</strong> {new Date(job.application_deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
            {isClosed && job.application_deadline && (
              <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>
                Deadline passed: {new Date(job.application_deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
          </div>
          <button 
            onClick={handleApply} 
            disabled={applying || isClosed}
            style={{ padding: '12px 32px', background: (applying || isClosed) ? '#4b5563' : '#6366f1', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', cursor: (applying || isClosed) ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
          >
            {isClosed ? 'Applications Closed' : applying ? 'Applying...' : 'Apply Now'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Employment Type</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{job.employment_type}</p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Work Mode</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{job.work_mode}</p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Experience</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{job.experience_required || 'Not Specified'}</p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Salary / Stipend</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
              {job.salary_min && job.salary_max ? `${job.currency === 'INR' ? '₹' : '$'}${job.salary_min.toLocaleString()} - ${job.currency === 'INR' ? '₹' : '$'}${job.salary_max.toLocaleString()}` : 'Not Disclosed'}
            </p>
          </div>
        </div>

        {job.jd_pdf_url && (
          <div style={{ marginBottom: '24px' }}>
            <a 
              href={job.jd_pdf_url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '10px 20px', background: '#374151', color: 'var(--text-primary)', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              📄 View Job Description (PDF)
            </a>
          </div>
        )}

        <div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Job Description</h2>
          <div 
            style={{ color: '#ccc', lineHeight: '1.6' }} 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }} 
          />
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
