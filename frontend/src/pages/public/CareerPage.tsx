import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, MapPin, Building, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://talvix-api.onrender.com';

export interface PublicJob {
  id: string | number;
  title: string;
  department?: string;
  location?: string;
  work_mode?: string;
  employment_type?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
}

interface PublicCareerPageData {
  career_page: {
    title: string;
    description: string;
    logo_url: string;
    website_url: string;
    primary_color: string;
  };
  organization_name: string;
  jobs: PublicJob[];
}

export default function CareerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicCareerPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/public/careers/${slug}`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to load career page", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-main)">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-main)">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-4">Page Not Found</h1>
        <p className="text-(--text-secondary)">The career page you are looking for does not exist.</p>
        <Link to="/" className="mt-6 text-blue-500 hover:underline">Return Home</Link>
      </div>
    );
  }

  const { career_page, organization_name, jobs } = data;

  return (
    <div className="min-h-screen bg-(--bg-main) flex flex-col font-sans">
      {/* Header Area */}
      <div 
        className="relative h-64 flex items-center justify-center text-center px-4"
        style={{ backgroundColor: career_page.primary_color || '#3B82F6' }}
      >
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black opacity-30"></div>
        
        <div className="relative z-10 max-w-3xl">
          {career_page.website_url ? (
            <a href={career_page.website_url} target="_blank" rel="noreferrer" className="block hover:opacity-90 transition-opacity">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg tracking-tight">
                {career_page.title || `Careers at ${organization_name}`}
              </h1>
            </a>
          ) : (
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg tracking-tight">
              {career_page.title || `Careers at ${organization_name}`}
            </h1>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grow w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-12 -mt-16 relative z-20">
        
        {/* Company Info Card */}
        <div className="glass-card p-8 md:p-10 mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {career_page.logo_url && (
              career_page.website_url ? (
                <a href={career_page.website_url} target="_blank" rel="noreferrer" className="shrink-0 hover:scale-105 transition-transform block">
                  <img 
                    src={career_page.logo_url} 
                    alt={`${organization_name} Logo`} 
                    className="w-32 h-32 md:w-40 md:h-40 object-contain bg-(--bg-surface) rounded-2xl shadow-md border border-(--border-color) p-2"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </a>
              ) : (
                <img 
                  src={career_page.logo_url} 
                  alt={`${organization_name} Logo`} 
                  className="w-32 h-32 md:w-40 md:h-40 object-contain bg-(--bg-surface) rounded-2xl shadow-md border border-(--border-color) p-2 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )
            )}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-(--text-primary) mb-4">About Us</h2>
              <p className="text-(--text-secondary) whitespace-pre-wrap leading-relaxed font-medium">
                {career_page.description || 'Welcome to our career page! Check out our open positions below.'}
              </p>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-3xl font-extrabold text-(--text-primary) mb-8 flex items-center gap-4">
            <div className="p-3 bg-(--bg-secondary) rounded-xl border border-(--border-color) shadow-sm">
              <Briefcase className="w-8 h-8" style={{ color: career_page.primary_color }} />
            </div>
            Open Positions
          </h2>

          {jobs.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <p className="text-(--text-secondary) text-xl font-medium">We don't have any open positions at the moment.</p>
              <p className="text-(--text-muted) mt-2">Please check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="group glass-card p-6 md:p-8 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div 
                    className="absolute top-0 left-0 w-1.5 h-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: career_page.primary_color }}
                  ></div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-(--text-primary) mb-4 transition-colors" style={{ color: career_page.primary_color }}>
                      {job.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-(--text-secondary) font-medium">
                      {job.department && (
                        <span className="flex items-center gap-1.5 bg-(--bg-secondary) px-3 py-1.5 rounded-lg border border-(--border-color)">
                          <Building className="w-4 h-4" />
                          {job.department}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1.5 bg-(--bg-secondary) px-3 py-1.5 rounded-lg border border-(--border-color)">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                      )}
                      {job.work_mode && (
                        <span className="flex items-center px-3 py-1.5 bg-(--accent-primary)/10 text-(--accent-primary) rounded-lg font-bold border border-(--accent-primary)/20">
                          {job.work_mode}
                        </span>
                      )}
                      {job.employment_type && (
                        <span className="flex items-center px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg font-bold border border-green-500/20">
                          {job.employment_type}
                        </span>
                      )}
                      {job.salary_min && job.salary_max && (
                        <span className="flex items-center px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg font-bold border border-purple-500/20">
                          {job.currency === 'INR' ? '₹' : '$'}{job.salary_min.toLocaleString()} - {job.currency === 'INR' ? '₹' : '$'}{job.salary_max.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link 
                    to={`/candidate/jobs/${job.id}`}
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all transform hover:-translate-y-1 rounded-xl shadow-md w-full md:w-auto shrink-0"
                    style={{ backgroundColor: career_page.primary_color, boxShadow: `0 4px 14px 0 ${career_page.primary_color}66` }}
                  >
                    View & Apply
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-10 text-center text-(--text-secondary) border-t border-(--border-color) bg-(--bg-card)">
        <p className="text-sm font-medium">Powered by <span className="font-bold text-(--text-primary)">Talvix</span></p>
      </footer>
    </div>
  );
}
