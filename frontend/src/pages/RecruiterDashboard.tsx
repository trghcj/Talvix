import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const RecruiterDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { activeOrganization, fetchOrganizations } = useAuthStore();
  const [newOrgName, setNewOrgName] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!activeOrganization) {
        setLoading(false);
        return;
      }
      try {
        const response = await apiClient.get(`/api/recruiter/dashboard?organization_id=${activeOrganization.id}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [activeOrganization]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/organizations', { name: newOrgName });
      await fetchOrganizations();
    } catch (err) {
      console.error("Failed to create org", err);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  if (!activeOrganization) {
    return (
      <div className="p-6" style={{ color: 'white' }}>
        <h1 className="text-2xl font-bold mb-6">Create your Organization</h1>
        <p className="mb-4 text-gray-400" style={{ marginBottom: '24px' }}>You need an organization to post jobs and manage applicants.</p>
        <form onSubmit={handleCreateOrg} style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <input 
            type="text" 
            placeholder="Organization Name" 
            value={newOrgName} 
            onChange={(e) => setNewOrgName(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '4px', background: '#222', color: 'white', border: '1px solid #444' }}
            required
          />
          <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', background: '#6366f1', color: 'white', fontWeight: 'bold' }}>
            Create
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'white' }}>Recruitment Analytics Dashboard</h1>
      
      {/* Quick Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Active Jobs', value: data?.metrics?.active_jobs },
          { label: 'Total Applicants', value: data?.metrics?.total_applicants },
          { label: 'Interviews Scheduled', value: data?.metrics?.interviews_scheduled },
          { label: 'Offers Extended', value: data?.metrics?.offers_extended },
          { label: 'Hiring Rate', value: data?.metrics?.hiring_rate },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#111315', padding: '24px', borderRadius: '12px', border: '1px solid #222' }}>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>{stat.label}</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stat.value || 0}</h2>
          </div>
        ))}
      </div>

      {/* ATS Funnel */}
      <h2 className="text-xl font-bold mb-4" style={{ color: 'white' }}>ATS Funnel</h2>
      <div style={{ background: '#111315', padding: '24px', borderRadius: '12px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data?.funnel && Object.entries(data.funnel).map(([stage, count]: any, idx, arr) => {
          const maxCount = Math.max(...Object.values(data.funnel as Record<string, number>));
          const percentage = maxCount === 0 ? 0 : (count / maxCount) * 100;
          return (
            <div key={stage} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '150px', color: '#888', fontSize: '0.9rem' }}>{stage}</div>
              <div style={{ flex: 1, background: '#1a1d21', height: '24px', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${percentage}%`, background: '#6366f1', height: '100%', transition: 'width 0.5s ease-in-out' }}></div>
              </div>
              <div style={{ width: '40px', textAlign: 'right', color: 'white', fontWeight: 'bold' }}>{count}</div>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '32px' }}>
        <Link to="/dashboard/jobs" style={{ padding: '10px 24px', background: '#222', color: 'white', border: '1px solid #333', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Manage Jobs &rarr;
        </Link>
      </div>
    </div>
  );
};
