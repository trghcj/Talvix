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

  const publicUrl = `/careers/${encodeURIComponent(formData.slug)}`;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Career Page Builder</h1>
          <p className="text-[var(--text-secondary)] mt-2 font-medium">Customize your public-facing careers page to attract top talent.</p>
        </div>
        <a 
          href={publicUrl} 
          target="_blank" 
          rel="noreferrer"
          className="px-5 py-2.5 bg-[var(--accent-primary)] text-white font-semibold rounded-lg shadow-sm shadow-[var(--accent-glow)] hover:bg-[var(--accent-hover)] transition-all transform hover:-translate-y-0.5"
        >
          View Live Page
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Settings Form */}
        <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-7">
            
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">
                URL Slug
              </label>
              <div className="flex shadow-sm rounded-lg overflow-hidden border border-[var(--border-color)] focus-within:ring-2 focus-within:ring-[var(--accent-primary)] focus-within:border-transparent transition-all">
                <span className="inline-flex items-center px-4 bg-[var(--bg-secondary)] text-[var(--text-muted)] font-medium sm:text-sm border-r border-[var(--border-color)]">
                  /careers/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-4 py-3 bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none sm:text-sm font-medium"
                  placeholder="acme-corp"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">
                Page Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="block w-full px-4 py-3 glass-input sm:text-sm font-medium"
                placeholder="Join our team at Acme Corp"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">
                Company Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="block w-full px-4 py-3 glass-input sm:text-sm font-medium resize-none"
                placeholder="Tell candidates about your company's mission and culture..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">
                Logo URL <span className="text-[var(--text-muted)] font-normal normal-case">(Optional)</span>
              </label>
              <input
                type="text"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="block w-full px-4 py-3 glass-input sm:text-sm font-medium"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">
                Website URL <span className="text-[var(--text-muted)] font-normal normal-case">(Optional)</span>
              </label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className="block w-full px-4 py-3 glass-input sm:text-sm font-medium"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">
                Brand Color
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="color"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleColorChange}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  />
                  <div 
                    className="h-12 w-12 rounded-lg border-2 border-white/20 shadow-inner flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: formData.primary_color }}
                  ></div>
                </div>
                <span className="text-sm font-mono font-bold text-[var(--text-primary)] uppercase bg-[var(--bg-secondary)] px-3 py-1.5 rounded-md border border-[var(--border-color)]">
                  {formData.primary_color}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-color)]">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm shadow-[var(--accent-glow)] text-sm font-bold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] focus:ring-[var(--accent-primary)] disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
              >
                {saving ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Pane */}
        <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="sticky top-8 border-[12px] border-[#0B0F19] rounded-[2.5rem] overflow-hidden bg-[var(--bg-base)] h-[650px] shadow-2xl flex flex-col relative ring-1 ring-[var(--border-color)]">
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-[#0B0F19] w-40 mx-auto rounded-b-2xl z-50"></div>
            
            {/* Header */}
            <div 
              className="h-40 p-6 flex flex-col justify-end relative shrink-0 transition-colors duration-500"
              style={{ backgroundColor: formData.primary_color }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/80 to-transparent"></div>
              {formData.website_url ? (
                <a href={formData.website_url} target="_blank" rel="noreferrer" className="relative z-10 block hover:opacity-90 transition-opacity">
                  <h2 className="text-2xl font-extrabold text-white drop-shadow-md tracking-tight leading-tight">
                    {formData.title || 'Your Title Here'}
                  </h2>
                </a>
              ) : (
                <h2 className="text-2xl font-extrabold text-white relative z-10 drop-shadow-md tracking-tight leading-tight">
                  {formData.title || 'Your Title Here'}
                </h2>
              )}
            </div>
            
            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-base)]">
              {formData.logo_url && (
                formData.website_url ? (
                  <a href={formData.website_url} target="_blank" rel="noreferrer" className="inline-block relative z-20 mb-5 -mt-12">
                    <img 
                      src={formData.logo_url} 
                      alt="Company Logo" 
                      className="w-16 h-16 rounded-xl object-contain bg-white p-1 border-2 border-[var(--bg-surface)] shadow-lg hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </a>
                ) : (
                  <img 
                    src={formData.logo_url} 
                    alt="Company Logo" 
                    className="w-16 h-16 rounded-xl object-contain bg-white p-1 border-2 border-[var(--bg-surface)] shadow-lg mb-5 -mt-12 relative z-20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )
              )}
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">About Us</h3>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                {formData.description || 'Your company description will appear here...'}
              </p>
              
              <div className="mt-8 pb-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  Open Positions
                  <span className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] px-2 py-0.5 rounded-full font-bold">{jobs.length}</span>
                </h3>
                {jobs.length === 0 ? (
                  <div className="p-5 border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]/50 text-center text-sm font-medium text-[var(--text-muted)]">
                    No open positions currently.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-4 glass-card group cursor-pointer hover:border-[var(--accent-primary)]">
                        <div className="font-bold text-[var(--text-primary)] text-sm group-hover:text-[var(--accent-primary)] transition-colors">{job.title}</div>
                        <div className="text-xs font-semibold text-[var(--text-muted)] mt-1.5 flex flex-wrap gap-1.5">
                          {[job.work_mode, job.employment_type, job.location].filter(Boolean).map((tag, idx) => (
                            <span key={idx} className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded text-[10px]">{tag}</span>
                          ))}
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
