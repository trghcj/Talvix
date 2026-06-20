import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const JobManagement = () => {
  const { activeOrganization } = useAuthStore();
  const [jobs, setJobs] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const fetchJobs = async () => {
      if (!activeOrganization) return;
      try {
        const response = await apiClient.get(`/api/recruiter/jobs?organization_id=${activeOrganization.id}`);
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [activeOrganization]);

  const closeJob = async (jobId: number) => {
    if (!window.confirm("Are you sure you want to close this job? Candidates will no longer be able to apply.")) return;
    try {
      await apiClient.patch(`/api/jobs/${jobId}/status`, { status: 'Closed' });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'Closed' } : j));
      toast.success("Job closed successfully");
    } catch (error) {
      toast.error("Failed to close job");
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (statusFilter !== 'All' && job.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && job.job_category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Job Management</h1>
        <Link to="/dashboard/jobs/create" style={{ padding: '10px 20px', background: '#6366f1', color: 'var(--text-primary)', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
          + Post New Job
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div style={{ padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No jobs posted yet. Create your first job posting!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
            >
              <option value="All">All Categories</option>
              <option value="Tech">Tech</option>
              <option value="Non-Tech">Non-Tech</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', color: 'var(--text-primary)', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0 16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Job Title</th>
                  <th style={{ padding: '0 16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '0 16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Department</th>
                  <th style={{ padding: '0 16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '0 16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '0 16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Posted On</th>
                  <th style={{ padding: '0 16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(job => (
                  <tr key={job.id} style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
                    <td style={{ padding: '16px', fontWeight: 'bold', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)' }}>{job.title}</td>
                    <td style={{ padding: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                      {job.job_category ? (
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          background: job.job_category === 'Tech' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                          color: job.job_category === 'Tech' ? '#60a5fa' : '#c084fc'
                        }}>
                          {job.job_category}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>{job.department || '-'}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>{job.employment_type}</td>
                  <td style={{ padding: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.85rem',
                      background: job.status === 'Open' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                      color: job.status === 'Open' ? '#4ade80' : '#9ca3af'
                    }}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>{new Date(job.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                    <Link to={`/dashboard/jobs/${job.id}/applicants`} style={{ color: 'var(--accent-primary)', textDecoration: 'none', marginRight: '16px', fontWeight: '500' }}>View Applicants</Link>
                    {job.status === 'Open' && (
                      <button onClick={() => closeJob(job.id)} style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
