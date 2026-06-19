import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const JobManagement = () => {
  const { activeOrganization } = useAuthStore();
  const [jobs, setJobs] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

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

  const deleteJob = async (jobId: number) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
    try {
      await apiClient.delete(`/api/jobs/${jobId}`);
      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  return (
    <div className="p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Job Management</h1>
        <Link to="/dashboard/jobs/create" style={{ padding: '10px 20px', background: '#6366f1', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
          + Post New Job
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div style={{ padding: '40px', background: '#111315', borderRadius: '12px', textAlign: 'center', color: '#888' }}>
          No jobs posted yet. Create your first job posting!
        </div>
      ) : (
        <div style={{ background: '#111315', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', textAlign: 'left' }}>
            <thead style={{ background: '#1a1d21', borderBottom: '1px solid #333' }}>
              <tr>
                <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Job Title</th>
                <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Department</th>
                <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Type</th>
                <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Status</th>
                <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Posted On</th>
                <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{job.title}</td>
                  <td style={{ padding: '16px', color: '#ccc' }}>{job.department || '-'}</td>
                  <td style={{ padding: '16px', color: '#ccc' }}>{job.employment_type}</td>
                  <td style={{ padding: '16px' }}>
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
                  <td style={{ padding: '16px', color: '#888' }}>{new Date(job.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px' }}>
                    <Link to={`/dashboard/jobs/${job.id}/applicants`} style={{ color: '#6366f1', textDecoration: 'none', marginRight: '16px' }}>View Applicants</Link>
                    <button onClick={() => deleteJob(job.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
