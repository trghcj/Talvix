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
    <div className="p-8 max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 shadow-sm border border-blue-500/20">
          <Shield size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Organization Analytics</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Overview of {activeOrganization?.name}'s recruitment performance.</p>
        </div>
      </div>

      {metrics && (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 flex items-center gap-5 hover:border-blue-500/50 group">
              <div className="bg-blue-500/10 p-4 rounded-xl text-blue-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <Briefcase size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Total Jobs</p>
                <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">{metrics.total_jobs}</h3>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-5 hover:border-purple-500/50 group">
              <div className="bg-purple-500/10 p-4 rounded-xl text-purple-500 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <FileText size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Total Applications</p>
                <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">{metrics.total_applications}</h3>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-5 hover:border-emerald-500/50 group">
              <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <CheckCircle size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Hired Candidates</p>
                <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">{metrics.hired_candidates}</h3>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-5 hover:border-orange-500/50 group">
              <div className="bg-orange-500/10 p-4 rounded-xl text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <Users size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Active Recruiters</p>
                <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">{metrics.active_recruiters}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Pipeline Distribution */}
            <div className="glass-card p-6 lg:col-span-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Activity size={20} />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Pipeline Overview</h2>
              </div>
              
              {metrics.stage_distribution && Object.keys(metrics.stage_distribution).length > 0 ? (
                <div className="space-y-6 flex-1">
                  {Object.entries(metrics.stage_distribution).map(([stage, count]: any) => {
                    const percentage = Math.round((count / metrics.total_applications) * 100);
                    return (
                      <div key={stage} className="group">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{stage}</span>
                          <span className="font-bold text-[var(--text-primary)]">{count} <span className="text-[var(--text-muted)] font-normal ml-1">({percentage}%)</span></span>
                        </div>
                        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2.5 overflow-hidden shadow-inner border border-[var(--border-color)]">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out relative"
                            style={{ width: `${percentage}%` }}
                          >
                            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]/30 flex-1 flex flex-col items-center justify-center">
                  <Activity className="w-8 h-8 mb-3 opacity-20" />
                  <p className="font-medium">No active pipeline data</p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-0 lg:col-span-2 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface)]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                    <Clock size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Applications</h2>
                </div>
              </div>
              
              {metrics.recent_applications && metrics.recent_applications.length > 0 ? (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--bg-surface)]">
                      <tr className="text-[var(--text-secondary)] text-xs uppercase tracking-wider border-b border-[var(--border-color)]">
                        <th className="px-6 py-4 font-bold">Candidate</th>
                        <th className="px-6 py-4 font-bold">Job Title</th>
                        <th className="px-6 py-4 font-bold">Stage</th>
                        <th className="px-6 py-4 font-bold text-right">Applied</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-[var(--border-glass)]">
                      {metrics.recent_applications.map((app: any) => (
                        <tr key={app.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-[var(--text-primary)]">{app.candidate_name}</div>
                          </td>
                          <td className="px-6 py-4 text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)] transition-colors">{app.job_title}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mr-1.5 animate-pulse"></span>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-[var(--text-secondary)] font-medium">
                            {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--text-muted)] flex-1 flex flex-col items-center justify-center">
                  <Clock className="w-8 h-8 mb-3 opacity-20" />
                  <p className="font-medium">No recent applications found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
