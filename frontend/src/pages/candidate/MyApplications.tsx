/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { Link } from 'react-router-dom';

type ApplicationType = Record<string, any>;

const MyApplications = () => {
  const [applications, setApplications] = useState<ApplicationType[]>([]);
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
            <div key={app.id} style={{ background: '#111315', padding: '24px', borderRadius: '12px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              
              {app.interview && (
                <div style={{ background: '#1a1d21', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
                  <h4 style={{ color: 'white', fontWeight: 'bold', marginBottom: '12px' }}>📅 Interview Scheduled</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <p style={{ color: '#888', fontSize: '0.85rem' }}>Date & Time</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '500' }}>{new Date(app.interview.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ color: '#888', fontSize: '0.85rem' }}>Meeting Link</p>
                      {app.interview.meet_link ? (
                        <a href={app.interview.meet_link} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
                          Join Google Meet
                        </a>
                      ) : (
                        <p style={{ color: '#e2e8f0' }}>TBD</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
