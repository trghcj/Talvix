import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { Settings, Save, AlertTriangle, Trash2, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrganizationSettings() {
  const { activeOrganization, fetchOrganizations, isOrgOwner, setActiveOrganization } = useAuthStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Danger Zone
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (activeOrganization) {
      setName(activeOrganization.name || '');
      setWebsiteUrl(activeOrganization.website_url || '');
      setLogoUrl(activeOrganization.logo_url || '');
      setLogoPreview(activeOrganization.logo_url || '');
    }
  }, [activeOrganization]);

  const handleGenerateInvite = async () => {
    try {
      const res = await apiClient.post(`/api/organizations/${activeOrganization.id}/generate-invite`);
      setActiveOrganization(res.data);
      await fetchOrganizations();
    } catch (err) {
      console.error("Failed to generate invite code", err);
      alert("Failed to generate invite code");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiClient.put(`/api/organizations/${activeOrganization.id}`, { 
        name,
        website_url: websiteUrl,
        logo_url: logoUrl
      });
      await fetchOrganizations(); // Refresh the active organization
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to update organization", err);
      alert("Failed to update organization settings");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/api/public/upload', formData);
      setLogoUrl(res.data.url);
      setLogoPreview(res.data.url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== activeOrganization?.name) return;
    
    try {
      setDeleting(true);
      await apiClient.delete(`/api/organizations/${activeOrganization.id}`);
      setActiveOrganization(null);
      await fetchOrganizations();
      navigate('/dashboard');
    } catch (err) {
      console.error("Failed to delete organization", err);
      alert("Failed to delete organization. Please check your permissions.");
    } finally {
      setDeleting(false);
    }
  };

  const hasChanges = name !== activeOrganization?.name || 
                     websiteUrl !== (activeOrganization?.website_url || '') || 
                     logoUrl !== (activeOrganization?.logo_url || '');

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-[var(--accent-primary)]/10 rounded-xl text-[var(--accent-primary)] shadow-sm border border-[var(--accent-primary)]/20">
          <Settings size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Organization Settings</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Manage your organization's general information and access.</p>
        </div>
      </div>

      <div className="glass-card p-8 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-color)] pb-4">General Information</h2>
        
        <div className="mb-8">
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">Invite Code <span className="text-[var(--text-muted)] font-normal normal-case">(Share this with your team to join)</span></label>
          <div className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-between shadow-inner">
            <span className="tracking-widest font-mono font-bold text-lg text-[var(--accent-primary)]">{activeOrganization?.invite_code || "No code generated"}</span>
            <div className="flex gap-4">
              {isOrgOwner && (
                <button 
                  onClick={handleGenerateInvite}
                  className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Generate New Code
                </button>
              )}
              {activeOrganization?.invite_code && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(activeOrganization.invite_code);
                    alert('Copied to clipboard!');
                  }}
                  className="text-sm font-bold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Copy Code
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-8 flex flex-col md:flex-row gap-8 md:items-start">
          <div className="shrink-0">
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">Organization Logo</label>
            <div 
              className="w-32 h-32 rounded-2xl border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-all bg-[var(--bg-secondary)] relative overflow-hidden group shadow-inner"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-[#0B0F19]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <span className="text-sm font-bold text-white">Change Logo</span>
                  </div>
                </>
              ) : (
                <div className="text-center group-hover:text-[var(--accent-primary)] transition-colors">
                  <Upload size={24} className="text-[var(--text-muted)] mb-2 mx-auto group-hover:text-[var(--accent-primary)] transition-colors" />
                  <span className="text-xs font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors">{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">Organization Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input px-4 py-3 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">Website URL</label>
              <input 
                type="url" 
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full glass-input px-4 py-3 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
          {!isOrgOwner ? (
            <p className="text-sm font-medium text-[var(--text-muted)]">Only the organization owner can change these settings.</p>
          ) : <div></div>}
          <button 
            onClick={handleSave}
            disabled={loading || uploading || !name.trim() || !hasChanges || !isOrgOwner}
            className="flex items-center gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold shadow-sm shadow-[var(--accent-glow)] transition-all transform hover:-translate-y-0.5"
          >
            <Save size={18} />
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Danger Zone - Only visible to owners */}
      {isOrgOwner && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-2 text-red-500">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-bold">Danger Zone</h2>
          </div>
          <p className="text-sm font-medium text-red-500/80 mb-8">
            Deleting this organization will permanently remove all associated jobs, applications, recruiters, and career pages. This action cannot be undone.
          </p>

          <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-red-500/10 shadow-inner">
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-3">
              To verify, type <span className="font-bold text-[var(--text-primary)] px-2 py-0.5 bg-[var(--bg-surface)] rounded border border-[var(--border-color)]">{activeOrganization?.name}</span> below:
            </label>
            <input 
              type="text" 
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              className="w-full glass-input px-4 py-3 mb-5 focus:ring-red-500/50 focus:border-red-500/50"
              placeholder="Enter organization name"
            />
            
            <button 
              onClick={handleDelete}
              disabled={deleting || deleteConfirmName !== activeOrganization?.name}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:text-red-400/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all shadow-sm shadow-red-600/20 transform hover:-translate-y-0.5"
            >
              <Trash2 size={18} />
              {deleting ? 'Deleting Organization...' : 'Delete Organization'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
