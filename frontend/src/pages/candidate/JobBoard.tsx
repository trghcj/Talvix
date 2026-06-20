/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../services/api';
import { Link } from 'react-router-dom';

type JobType = Record<string, any>;

const JobBoard = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    title: '',
    location: '',
    work_mode: '',
    employment_type: '',
    job_level: '',
    min_salary: '',
    status: '',
    job_category: ''
  });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(filters).filter(([_, v]) => v !== '')
      ).toString();
      
      const response = await apiClient.get(`/api/jobs?${queryParams}`);
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 300); // 300ms debounce
    return () => clearTimeout(timeoutId);
  }, [fetchJobs]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Browse Jobs</h1>

      {/* Filters */}
      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input name="title" placeholder="Search by title..." onChange={handleFilterChange} style={{ flex: 1, minWidth: '150px', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
        <input name="location" placeholder="Location..." onChange={handleFilterChange} style={{ width: '150px', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
        
        <select name="work_mode" onChange={handleFilterChange} style={{ width: '150px', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}>
          <option value="">All Modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-Site">On-Site</option>
        </select>

        <select name="employment_type" onChange={handleFilterChange} style={{ width: '150px', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}>
          <option value="">All Types</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>

        <input type="number" name="min_salary" placeholder="Min Salary / Stipend" onChange={handleFilterChange} style={{ width: '180px', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
        
        <select name="status" onChange={handleFilterChange} style={{ width: '150px', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}>
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
        
        <select name="job_category" onChange={handleFilterChange} style={{ width: '150px', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}>
          <option value="">All Categories</option>
          <option value="Tech">Tech</option>
          <option value="Non-Tech">Non-Tech</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div style={{ padding: '40px', background: 'var(--bg-card)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No jobs found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {jobs.map(job => {
            const isClosed = job.status === 'Closed' || (job.application_deadline && new Date(job.application_deadline) < new Date());
            return (
              <div key={job.id} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isClosed ? 0.6 : 1 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>{job.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{job.department} • {job.location || 'Remote'}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#ccc' }}>{job.employment_type}</span>
                    <span style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#ccc' }}>{job.work_mode}</span>
                    <span style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#ccc' }}>{job.job_level}</span>
                    {job.job_category && (
                      <span style={{ 
                        background: job.job_category === 'Tech' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                        color: job.job_category === 'Tech' ? '#60a5fa' : '#c084fc',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' 
                      }}>
                        {job.job_category}
                      </span>
                    )}
                    {job.salary_min && job.salary_max && (
                      <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {job.currency === 'INR' ? '₹' : '$'}{job.salary_min.toLocaleString()} - {job.currency === 'INR' ? '₹' : '$'}{job.salary_max.toLocaleString()}
                      </span>
                    )}
                    {isClosed && <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Closed</span>}
                    {job.application_deadline && !isClosed && (
                      <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        Closes: {new Date(job.application_deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
                <Link to={`/dashboard/candidate/jobs/${job.id}`} style={{ padding: '10px 24px', background: isClosed ? '#374151' : '#6366f1', color: 'var(--text-primary)', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                  {isClosed ? 'View' : 'View & Apply'}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobBoard;
