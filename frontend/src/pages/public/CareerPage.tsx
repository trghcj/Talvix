import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, MapPin, Building, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://talvix-api.onrender.com';

interface PublicCareerPageData {
  career_page: {
    title: string;
    description: string;
    logo_url: string;
    website_url: string;
    primary_color: string;
  };
  organization_name: string;
  jobs: any[];
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)]">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Page Not Found</h1>
        <p className="text-[var(--text-secondary)]">The career page you are looking for does not exist.</p>
        <Link to="/" className="mt-6 text-blue-500 hover:underline">Return Home</Link>
      </div>
    );
  }

  const { career_page, organization_name, jobs } = data;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col font-sans">
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
      <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-12 -mt-16 relative z-20">
        
        {/* Company Info Card */}
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--border-color)] p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {career_page.logo_url && (
              career_page.website_url ? (
                <a href={career_page.website_url} target="_blank" rel="noreferrer" className="shrink-0 hover:scale-105 transition-transform block">
                  <img 
                    src={career_page.logo_url} 
                    alt={`${organization_name} Logo`} 
                    className="w-32 h-32 object-contain bg-white rounded-xl shadow-md border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </a>
              ) : (
                <img 
                  src={career_page.logo_url} 
                  alt={`${organization_name} Logo`} 
                  className="w-32 h-32 object-contain bg-white rounded-xl shadow-md border shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )
            )}
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">About Us</h2>
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                {career_page.description || 'Welcome to our career page! Check out our open positions below.'}
              </p>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3">
            <Briefcase className="w-8 h-8" style={{ color: career_page.primary_color }} />
            Open Positions
          </h2>

          {jobs.length === 0 ? (
            <div className="text-center py-16 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              <p className="text-[var(--text-secondary)] text-lg">We don't have any open positions at the moment.</p>
              <p className="text-[var(--text-secondary)] mt-2">Please check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-transparent relative overflow-hidden"
                >
                  <div 
                    className="absolute top-0 left-0 w-1 h-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: career_page.primary_color }}
                  ></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-blue-500 transition-colors">
                        {job.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                        {job.department && (
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {job.department}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        )}
                        {job.work_mode && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md text-xs font-medium">
                            {job.work_mode}
                          </span>
                        )}
                        {job.employment_type && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md text-xs font-medium">
                            {job.employment_type}
                          </span>
                        )}
                        {job.salary_min && job.salary_max && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md text-xs font-medium">
                            {job.currency === 'INR' ? '₹' : '$'}{job.salary_min.toLocaleString()} - {job.currency === 'INR' ? '₹' : '$'}{job.salary_max.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link 
                      to={`/candidate/jobs/${job.id}`}
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-colors rounded-lg shadow-sm w-full md:w-auto"
                      style={{ backgroundColor: career_page.primary_color }}
                    >
                      View & Apply
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-[var(--text-secondary)] border-t border-[var(--border-color)] bg-[var(--bg-card)]">
        <p className="text-sm">Powered by <span className="font-bold">Talvix</span></p>
      </footer>
    </div>
  );
}
