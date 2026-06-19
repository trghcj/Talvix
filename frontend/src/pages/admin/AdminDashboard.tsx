import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { Shield, Users, Briefcase, FileText, CheckCircle, Clock, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Pipeline Distribution */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={20} className="text-blue-400" />
                <h2 className="text-lg font-bold">Pipeline Overview</h2>
              </div>
              
              {metrics.stage_distribution && Object.keys(metrics.stage_distribution).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(metrics.stage_distribution).map(([stage, count]: any) => {
                    const percentage = Math.round((count / metrics.total_applications) * 100);
                    return (
                      <div key={stage}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{stage}</span>
                          <span className="font-bold">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No active pipeline data
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Clock size={20} className="text-blue-400" />
                <h2 className="text-lg font-bold">Recent Applications</h2>
              </div>
              
              {metrics.recent_applications && metrics.recent_applications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-400 text-sm border-b border-white/10">
                        <th className="pb-3 font-medium">Candidate</th>
                        <th className="pb-3 font-medium">Job Title</th>
                        <th className="pb-3 font-medium">Stage</th>
                        <th className="pb-3 font-medium">Applied</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {metrics.recent_applications.map((app: any) => (
                        <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-medium">{app.candidate_name}</td>
                          <td className="py-4 text-gray-300">{app.job_title}</td>
                          <td className="py-4">
                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs border border-white/5">
                              {app.current_stage}
                            </span>
                          </td>
                          <td className="py-4 text-gray-400">
                            {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No recent applications found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
