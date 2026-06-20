import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { Users, UserMinus } from 'lucide-react';

export default function UserManagement() {
  const { activeOrganization, user } = useAuthStore();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    try {
      setInviteLoading(true);
      setInviteError(null);
      await apiClient.post(`/api/admin/members?organization_id=${activeOrganization.id}`, { email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail('');
      setInviteRole('recruiter');
      setIsInviteModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      console.error("Failed to invite member", err);
      setInviteError(err.response?.data?.detail || "Failed to invite recruiter");
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading && members.length === 0) {
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={() => setIsInviteModalOpen(true)}
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
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    member.role === 'owner' ? 'bg-purple-500/20 text-purple-400' : 
                    member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-blue-500/20 text-blue-400'
                  }`}>
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

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d21] border border-white/10 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Invite Recruiter</h2>
              <p className="text-gray-400 text-sm mb-6">Enter the email address of the recruiter you want to invite to {activeOrganization?.name}. They must already have a Talvix account.</p>
              
              <form onSubmit={handleInvite}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="recruiter@example.com"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="recruiter">Recruiter (No Admin Access)</option>
                    <option value="admin">Admin (Manage Team & Settings)</option>
                  </select>
                </div>
                
                {inviteError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-4">
                    {inviteError}
                  </div>
                )}
                
                <div className="flex gap-3 justify-end mt-6">
                  <button 
                    type="button"
                    onClick={() => { setIsInviteModalOpen(false); setInviteError(null); setInviteEmail(''); }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={inviteLoading || !inviteEmail.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {inviteLoading ? 'Inviting...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
