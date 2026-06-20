import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { Settings, Save, AlertTriangle, Trash2, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrganizationSettings() {
  const { activeOrganization, fetchOrganizations, isOrgAdmin, setActiveOrganization } = useAuthStore();
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
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings size={28} className="text-blue-500" />
        <h1 className="text-2xl font-bold">Organization Settings</h1>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6">General Information</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Invite Code (Share this with your team to join)</label>
          <div className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-lg flex items-center justify-between">
            <span className="tracking-widest font-bold text-blue-400">{activeOrganization?.invite_code || "No code generated"}</span>
            <div className="flex gap-4">
              <button 
                onClick={handleGenerateInvite}
                className="text-gray-400 hover:text-white text-sm font-sans"
              >
                Generate New Code
              </button>
              {activeOrganization?.invite_code && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(activeOrganization.invite_code);
                    alert('Copied to clipboard!');
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm font-sans font-bold"
                >
                  Copy Code
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6 flex gap-6 items-start">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Organization Logo</label>
            <div 
              className="w-24 h-24 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-black/40 relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium">Change</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Upload size={20} className="text-gray-400 mb-1 mx-auto" />
                  <span className="text-xs text-gray-400">{uploading ? 'Uploading...' : 'Upload'}</span>
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
          
          <div className="flex-1">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Organization Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Website URL</label>
              <input 
                type="url" 
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading || uploading || !name.trim() || !hasChanges}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Danger Zone - Only visible to owners */}
      {isOrgAdmin && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2 text-red-500">
            <AlertTriangle size={24} />
            <h2 className="text-lg font-semibold">Danger Zone</h2>
          </div>
          <p className="text-sm text-red-400/80 mb-6">
            Deleting this organization will permanently remove all associated jobs, applications, recruiters, and career pages. This action cannot be undone.
          </p>

          <div className="bg-black/20 p-4 rounded-lg border border-red-500/10">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              To verify, type <span className="font-bold text-white">{activeOrganization?.name}</span> below:
            </label>
            <input 
              type="text" 
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              className="w-full bg-black/40 border border-red-500/20 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none transition-colors mb-4"
              placeholder="Enter organization name"
            />
            
            <button 
              onClick={handleDelete}
              disabled={deleting || deleteConfirmName !== activeOrganization?.name}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:text-red-400/50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Trash2 size={18} />
              {deleting ? 'Deleting...' : 'Delete Organization'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
