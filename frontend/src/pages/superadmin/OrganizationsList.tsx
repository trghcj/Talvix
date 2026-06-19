import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { Globe, Building } from 'lucide-react';

export default function OrganizationsList() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/superadmin/organizations');
      setOrganizations(res.data);
    } catch (err) {
      console.error("Failed to fetch organizations", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="loader"></span></div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <Globe size={28} className="text-indigo-500" />
        <h1 className="text-2xl font-bold">All Organizations</h1>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-sm">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Organization Name</th>
              <th className="p-4 font-medium">Owner ID</th>
              <th className="p-4 font-medium text-right">Active Jobs</th>
              <th className="p-4 font-medium text-right">Created At</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map(org => (
              <tr key={org.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-400">#{org.id}</td>
                <td className="p-4 font-medium flex items-center gap-2">
                  <Building size={16} className="text-gray-400" />
                  {org.name}
                </td>
                <td className="p-4 text-gray-400">{org.owner_id}</td>
                <td className="p-4 text-right">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                    {org.job_count} Jobs
                  </span>
                </td>
                <td className="p-4 text-right text-gray-400 text-sm">
                  {new Date(org.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {organizations.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No organizations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
