import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { Users, UserMinus } from 'lucide-react';

export default function UserManagement() {
  const { activeOrganization, user } = useAuthStore();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeOrganization) {
      fetchMembers();
    }
  }, [activeOrganization]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/admin/members?organization_id=${activeOrganization.id}`);
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to fetch organization members", err);
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: number) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await apiClient.delete(`/api/admin/members/${memberId}?organization_id=${activeOrganization.id}`);
      fetchMembers();
    } catch (err) {
      console.error("Failed to remove member", err);
      alert("Failed to remove member");
    }
  };

  if (loading) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="loader"></span></div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users size={28} className="text-blue-500" />
            <h1 className="text-2xl font-bold">Team Management</h1>
          </div>
          <p className="text-gray-400">Manage recruiters for {activeOrganization?.name}</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          onClick={() => alert("Invite feature coming soon! Currently recruits are auto-added or you can add via DB.")}
        >
          Invite Recruiter
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-sm">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium">{member.name}</td>
                <td className="p-4 text-gray-400">{member.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${member.role === 'owner' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {member.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-sm">
                  {new Date(member.joined_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => removeMember(member.id)}
                    disabled={member.user_id === activeOrganization?.owner_id}
                    className="text-red-400 hover:bg-red-500/10 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Remove Access"
                  >
                    <UserMinus size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No members found in this organization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
