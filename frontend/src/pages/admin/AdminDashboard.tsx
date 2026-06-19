import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { Shield, Users, Briefcase, FileText, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { activeOrganization } = useAuthStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeOrganization) {
      fetchAnalytics();
    }
  }, [activeOrganization]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/admin/analytics?organization_id=${activeOrganization.id}`);
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to fetch admin analytics", err);
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
        <Shield size={28} className="text-blue-500" />
        <h1 className="text-2xl font-bold">Organization Analytics</h1>
      </div>
      <p className="text-gray-400 mb-8">Overview of {activeOrganization?.name}'s recruitment performance.</p>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400">
                <Briefcase size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Jobs</p>
                <h3 className="text-2xl font-bold">{metrics.total_jobs}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Applications</p>
                <h3 className="text-2xl font-bold">{metrics.total_applications}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-lg text-green-400">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Hired Candidates</p>
                <h3 className="text-2xl font-bold">{metrics.hired_candidates}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/20 p-3 rounded-lg text-orange-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Recruiters</p>
                <h3 className="text-2xl font-bold">{metrics.active_recruiters}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
