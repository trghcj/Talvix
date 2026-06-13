import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { Link } from 'react-router-dom';

const JobBoard = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    title: '',
    location: '',
    work_mode: '',
    employment_type: '',
    job_level: ''
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      ).toString();
      
      const response = await apiClient.get(`/api/jobs?${queryParams}`);
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'white' }}>Browse Jobs</h1>

      {/* Filters */}
      <div style={{ background: '#111315', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input name="title" placeholder="Search by title..." onChange={handleFilterChange} style={{ flex: 1, minWidth: '150px', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
        <input name="location" placeholder="Location..." onChange={handleFilterChange} style={{ width: '150px', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
        
        <select name="work_mode" onChange={handleFilterChange} style={{ width: '150px', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
          <option value="">All Modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-Site">On-Site</option>
        </select>

        <select name="employment_type" onChange={handleFilterChange} style={{ width: '150px', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
          <option value="">All Types</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div style={{ padding: '40px', background: '#111315', borderRadius: '12px', textAlign: 'center', color: '#888' }}>
          No jobs found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {jobs.map(job => (
            <div key={job.id} style={{ background: '#111315', padding: '24px', borderRadius: '12px', border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{job.title}</h3>
                <p style={{ color: '#888', marginBottom: '8px' }}>{job.department} • {job.location || 'Remote'}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ background: '#1a1d21', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#ccc' }}>{job.employment_type}</span>
                  <span style={{ background: '#1a1d21', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#ccc' }}>{job.work_mode}</span>
                  <span style={{ background: '#1a1d21', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#ccc' }}>{job.job_level}</span>
                </div>
              </div>
              <Link to={`/dashboard/candidate/jobs/${job.id}`} style={{ padding: '10px 24px', background: '#6366f1', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                View & Apply
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobBoard;
