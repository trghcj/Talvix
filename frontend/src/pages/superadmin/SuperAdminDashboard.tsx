import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { Server, Users, Globe, Briefcase, FileText } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/superadmin/analytics');
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to fetch superadmin analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="loader"></span></div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Server size={28} className="text-indigo-500" />
        <h1 className="text-2xl font-bold">Platform Overview</h1>
      </div>
      <p className="text-gray-400 mb-8">High-level metrics for the entire Talvix platform.</p>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <h3 className="text-2xl font-bold">{metrics.total_users}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400">
                <Globe size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Organizations</p>
                <h3 className="text-2xl font-bold">{metrics.total_organizations}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-lg text-green-400">
                <Briefcase size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Jobs Posted</p>
                <h3 className="text-2xl font-bold">{metrics.total_jobs}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/20 p-3 rounded-lg text-orange-400">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Applications</p>
                <h3 className="text-2xl font-bold">{metrics.total_applications}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
