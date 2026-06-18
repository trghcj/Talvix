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

  // Format data for Recharts
  const funnelData = data?.funnel ? Object.entries(data.funnel).map(([name, count]) => ({
    name,
    count
  })).filter(item => item.count !== 0) : [];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'white' }}>Recruitment Analytics</h1>
      
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Bar Chart for Funnel */}
        <div style={{ background: '#111315', padding: '24px', borderRadius: '12px', border: '1px solid #222' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'white' }}>ATS Funnel Breakdown</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="name" type="category" stroke="#888" width={100} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart for Statuses */}
        <div style={{ background: '#111315', padding: '24px', borderRadius: '12px', border: '1px solid #222' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'white' }}>Candidate Distribution</h2>
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
                  contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#888' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '32px' }}>
        <Link to="/dashboard/jobs" style={{ padding: '10px 24px', background: '#222', color: 'white', border: '1px solid #333', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Manage Jobs &rarr;
        </Link>
      </div>
    </div>
  );
};
