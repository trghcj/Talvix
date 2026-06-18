import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function CareerPageBuilder() {
  const { activeOrganization } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    logo_url: '',
    website_url: '',
    primary_color: '#3B82F6',
  });

  useEffect(() => {
    const fetchCareerPageAndJobs = async () => {
      if (!activeOrganization) return;
      try {
        setLoading(true);
        const [pageRes, jobsRes] = await Promise.all([
          apiClient.get(`/api/organizations/${activeOrganization.id}/career-page`),
          apiClient.get(`/api/recruiter/jobs?organization_id=${activeOrganization.id}`)
        ]);
        
        setFormData({
          slug: pageRes.data.slug || '',
          title: pageRes.data.title || '',
          description: pageRes.data.description || '',
          logo_url: pageRes.data.logo_url || '',
          website_url: pageRes.data.website_url || '',
          primary_color: pageRes.data.primary_color || '#3B82F6',
        });
        
        // Only show 'Open' jobs in preview
        setJobs(jobsRes.data.filter((j: any) => j.status === 'Open'));
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Failed to load career page settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchCareerPageAndJobs();
  }, [activeOrganization]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, primary_color: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization) return;
    try {
      setSaving(true);
      await apiClient.put(`/api/organizations/${activeOrganization.id}/career-page`, formData);
      toast.success('Career page settings saved successfully!');
    } catch (error: any) {
      console.error("Error saving career page settings", error);
      toast.error(error.response?.data?.detail || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!activeOrganization) {
    return <div className="p-8 text-[var(--text-secondary)]">Please select an organization.</div>;
  }

  if (loading) {
    return <div className="p-8 text-[var(--text-secondary)]">Loading settings...</div>;
  }

  const publicUrl = `${window.location.origin}/careers/${formData.slug}`;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Career Page Builder</h1>
          <p className="text-[var(--text-secondary)] mt-2">Customize your public-facing careers page.</p>
        </div>
        <a 
          href={publicUrl} 
          target="_blank" 
          rel="noreferrer"
          className="px-4 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
        >
          View Live Page
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                URL Slug
              </label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] sm:text-sm">
                  /careers/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="acme-corp"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Page Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="block w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Join our team at Acme Corp"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Company Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="block w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tell candidates about your company..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Logo URL (Optional)
              </label>
              <input
                type="text"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="block w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Website URL (Optional)
              </label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className="block w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleColorChange}
                  className="h-10 w-20 p-1 rounded border border-[var(--border-color)] bg-[var(--bg-main)] cursor-pointer"
                />
                <span className="text-sm text-[var(--text-secondary)]">{formData.primary_color}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)]">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Pane */}
        <div className="hidden lg:block">
          <div className="sticky top-8 border-[8px] border-gray-800 rounded-[2rem] overflow-hidden bg-[var(--bg-main)] h-[600px] shadow-2xl relative flex flex-col">
            {/* Header */}
            <div 
              className="h-32 p-6 flex flex-col justify-end relative shrink-0"
              style={{ backgroundColor: formData.primary_color }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              {formData.website_url ? (
                <a href={formData.website_url} target="_blank" rel="noreferrer" className="relative z-10 block hover:opacity-90 transition-opacity">
                  <h2 className="text-2xl font-bold text-white drop-shadow-md">
                    {formData.title || 'Your Title Here'}
                  </h2>
                </a>
              ) : (
                <h2 className="text-2xl font-bold text-white relative z-10 drop-shadow-md">
                  {formData.title || 'Your Title Here'}
                </h2>
              )}
            </div>
            
            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              {formData.logo_url && (
                formData.website_url ? (
                  <a href={formData.website_url} target="_blank" rel="noreferrer" className="inline-block relative z-20 mb-4 -mt-10">
                    <img 
                      src={formData.logo_url} 
                      alt="Company Logo" 
                      className="w-16 h-16 rounded-lg object-contain bg-white border shadow-sm hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </a>
                ) : (
                  <img 
                    src={formData.logo_url} 
                    alt="Company Logo" 
                    className="w-16 h-16 rounded-lg object-contain bg-white border shadow-sm mb-4 -mt-10 relative z-20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )
              )}
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">About Us</h3>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                {formData.description || 'Your company description will appear here...'}
              </p>
              
              <div className="mt-8 pb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Open Positions</h3>
                {jobs.length === 0 ? (
                  <div className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-card)] text-center text-sm text-[var(--text-secondary)]">
                    No open positions currently.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-3 border border-[var(--border-color)] rounded-lg bg-[var(--bg-card)] opacity-90 hover:border-[var(--border-color-hover)] transition-colors cursor-default">
                        <div className="font-medium text-[var(--text-primary)] text-sm">{job.title}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">
                          {[job.work_mode, job.employment_type, job.location].filter(Boolean).join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
