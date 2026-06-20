import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const RecruiterDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { activeOrganization, fetchOrganizations } = useAuthStore();
  const [newOrgName, setNewOrgName] = useState('');
  const [joinOrgId, setJoinOrgId] = useState('');

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

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/organizations/join', { organization_id: parseInt(joinOrgId) });
      await fetchOrganizations();
    } catch (err) {
      console.error("Failed to join org", err);
      alert("Failed to join organization. Please check the ID.");
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  if (!activeOrganization) {
    return (
      <div className="p-6 max-w-4xl mx-auto" style={{ color: 'var(--text-primary)' }}>
        <h1 className="text-3xl font-bold mb-2">Welcome to Talvix</h1>
        <p className="mb-12 text-gray-400">You need an organization to post jobs and manage applicants.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Create Organization */}
          <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h2 className="text-xl font-bold mb-2">Create a Company</h2>
            <p className="text-sm text-gray-400 mb-6">Start fresh by creating a new workspace for your team.</p>
            <form onSubmit={handleCreateOrg} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Organization Name" 
                value={newOrgName} 
                onChange={(e) => setNewOrgName(e.target.value)}
                style={{ padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                required
              />
              <button type="submit" style={{ padding: '12px 16px', borderRadius: '8px', background: '#6366f1', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                Create Company
              </button>
            </form>
          </div>

          {/* Join Organization */}
          <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h2 className="text-xl font-bold mb-2">Join a Company</h2>
            <p className="text-sm text-gray-400 mb-6">Enter a Company ID to join an existing workspace.</p>
            <form onSubmit={handleJoinOrg} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="number" 
                placeholder="Company ID (e.g. 1)" 
                value={joinOrgId} 
                onChange={(e) => setJoinOrgId(e.target.value)}
                style={{ padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                required
              />
              <button type="submit" style={{ padding: '12px 16px', borderRadius: '8px', background: '#10b981', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                Join Company
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Format data for Recharts
  const funnelData = data?.funnel ? Object.entries(data.funnel).map(([name, count]) => ({
    name,
    count
  })).filter(item => item.count !== 0) : [];

  const COLORS = ['#a855f7', '#fde047', '#ff7f50', '#2dd4bf', '#60a5fa', '#f43f5e', '#a3e635', '#f9a8d4', '#818cf8'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary, white)' }}>Recruitment Analytics</h1>
      
      {/* Quick Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Active Jobs', value: data?.metrics?.active_jobs },
          { label: 'Total Applicants', value: data?.metrics?.total_applicants },
          { label: 'Interviews Scheduled', value: data?.metrics?.interviews_scheduled },
          { label: 'Offers Extended', value: data?.metrics?.offers_extended },
          { label: 'Hiring Rate', value: data?.metrics?.hiring_rate },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--bg-card, #111315)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color, #222)' }}>
            <p style={{ color: 'var(--text-secondary, #888)', fontSize: '0.85rem', marginBottom: '8px' }}>{stat.label}</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary, white)' }}>{stat.value || 0}</h2>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Bar Chart for Funnel */}
        <div style={{ background: 'var(--bg-card, #111315)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color, #222)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary, white)' }}>ATS Funnel Breakdown</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #333)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="var(--text-secondary, #888)" />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary, #888)" width={100} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card, #222)', border: '1px solid var(--border-color, #444)', borderRadius: '8px', color: 'var(--text-primary, white)' }}
                  itemStyle={{ color: 'var(--text-primary, white)' }}
                />
                <Bar dataKey="count" barSize={32} radius={20}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart for Statuses */}
        <div style={{ background: 'var(--bg-card, #111315)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color, #222)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary, white)' }}>Candidate Distribution</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funnelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card, #222)', border: '1px solid var(--border-color, #444)', borderRadius: '8px', color: 'var(--text-primary, white)' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary, #888)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '32px' }}>
        <Link to="/dashboard/jobs" style={{ padding: '10px 24px', background: 'var(--bg-secondary, #222)', color: 'var(--text-primary, white)', border: '1px solid var(--border-color, #333)', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Manage Jobs &rarr;
        </Link>
      </div>
    </div>
  );
};
