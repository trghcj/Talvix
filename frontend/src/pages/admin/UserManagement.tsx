import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { Users, UserMinus } from 'lucide-react';

export default function UserManagement() {
  const { activeOrganization, user, isOrgOwner } = useAuthStore();
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

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      await apiClient.put(`/api/admin/members/${memberId}/role?organization_id=${activeOrganization.id}`, { role: newRole });
      fetchMembers();
    } catch (err) {
      console.error("Failed to update member role", err);
      alert("Failed to update member role");
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
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-[var(--accent-primary)]/10 rounded-xl text-[var(--accent-primary)] shadow-sm border border-[var(--accent-primary)]/20">
              <Users size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Team Management</h1>
          </div>
          <p className="text-[var(--text-secondary)] font-medium">Manage recruiters for {activeOrganization?.name}</p>
        </div>
        <button 
          className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-5 py-2.5 rounded-lg font-bold shadow-sm shadow-[var(--accent-glow)] transition-all transform hover:-translate-y-0.5"
          onClick={() => setIsInviteModalOpen(true)}
        >
          Invite Recruiter
        </button>
      </div>

      <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] text-sm tracking-wide uppercase">
              <th className="p-5 font-semibold">Name</th>
              <th className="p-5 font-semibold">Email</th>
              <th className="p-5 font-semibold">Role</th>
              <th className="p-5 font-semibold">Joined</th>
              <th className="p-5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/30 transition-colors">
                <td className="p-5 font-bold text-[var(--text-primary)]">{member.name}</td>
                <td className="p-5 text-[var(--text-secondary)] font-medium">{member.email}</td>
                <td className="p-5">
                  {isOrgOwner && member.user_id !== user?.id && member.role !== 'owner' ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer border border-transparent hover:border-[var(--border-color)] outline-none appearance-none shadow-sm ${
                        member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : 
                        'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                      }`}
                    >
                      <option value="admin" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">ADMIN</option>
                      <option value="recruiter" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">RECRUITER</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-md text-xs font-bold shadow-sm ${
                      member.role === 'owner' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : 
                      member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : 
                      'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                    }`}>
                      {member.role.toUpperCase()}
                    </span>
                  )}
                </td>
                <td className="p-5 text-[var(--text-secondary)] text-sm font-medium">
                  {new Date(member.joined_at).toLocaleDateString()}
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => removeMember(member.id)}
                    disabled={member.user_id === activeOrganization?.owner_id}
                    className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Remove Access"
                  >
                    <UserMinus size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-[var(--text-secondary)] font-medium">
                  No members found in this organization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-8">
              <h2 className="text-2xl font-extrabold mb-3 text-[var(--text-primary)]">Invite Recruiter</h2>
              <p className="text-[var(--text-secondary)] font-medium text-sm mb-8 leading-relaxed">Enter the email address of the recruiter you want to invite to {activeOrganization?.name}. They must already have a Talvix account.</p>
              
              <form onSubmit={handleInvite}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Email Address</label>
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full glass-input p-3"
                    placeholder="recruiter@example.com"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Role</label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full glass-input p-3"
                  >
                    <option value="recruiter">Recruiter (No Admin Access)</option>
                    <option value="admin">Admin (Manage Team & Settings)</option>
                  </select>
                </div>
                
                {inviteError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm font-medium mb-6">
                    {inviteError}
                  </div>
                )}
                
                <div className="flex gap-4 justify-end mt-8">
                  <button 
                    type="button"
                    onClick={() => { setIsInviteModalOpen(false); setInviteError(null); setInviteEmail(''); }}
                    className="px-5 py-2.5 font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={inviteLoading || !inviteEmail.trim()}
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm shadow-[var(--accent-glow)] transition-all transform hover:-translate-y-0.5"
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
