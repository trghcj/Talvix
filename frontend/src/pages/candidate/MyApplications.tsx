import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { Link } from 'react-router-dom';

const MyApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiClient.get('/api/applications');
        setApplications(response.data);
      } catch (error) {
        console.error("Error fetching applications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'white' }}>My Applications</h1>

      {loading ? (
        <p style={{ color: '#888' }}>Loading applications...</p>
      ) : applications.length === 0 ? (
        <div style={{ padding: '40px', background: '#111315', borderRadius: '12px', textAlign: 'center', color: '#888' }}>
          You haven't applied to any jobs yet.
          <br /><br />
          <Link to="/dashboard/candidate/jobs" style={{ padding: '8px 16px', background: '#6366f1', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {applications.map(app => (
            <div key={app.id} style={{ background: '#111315', padding: '24px', borderRadius: '12px', border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Application #{app.id}</h3>
                <p style={{ color: '#888', marginBottom: '8px' }}>Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '4px' }}>Current Status</p>
                <span style={{ 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  border: '1px solid #333',
                  background: '#1a1d21',
                  color: app.status === 'Rejected' ? '#f87171' : app.status === 'Hired' ? '#4ade80' : '#60a5fa'
                }}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
