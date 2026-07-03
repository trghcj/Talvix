import { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../services/api';
import { Sidebar } from '../components/ui/Sidebar';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import './DashboardLayout.css';

type Theme = 'light' | 'dark' | 'system';

export const DashboardLayout = () => {
  const { user, loading } = useAuthStore();
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  const [profileData, setProfileData] = useState<any>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      apiClient.get('/api/candidate/profile')
        .then(res => setProfileData(res.data))
        .catch(err => console.error("Could not fetch profile for avatar", err));
    }
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return <div className="layout-loader"><span className="loader"></span></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <header className="dashboard-header glass-panel">
          <div className="header-search">
            {/* Search bar placeholder */}
          </div>
          <div className="header-actions">
            
            {/* Theme Toggle */}
            <div className="theme-switcher relative" ref={themeRef}>
              <button 
                onClick={() => setIsThemeOpen(!isThemeOpen)} 
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-surface) text-(--text-primary) hover:bg-(--bg-secondary) transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-(--accent-primary) focus:border-transparent"
              >
                {theme === 'light' ? <Sun size={18} className="text-amber-500" /> : theme === 'dark' ? <Moon size={18} className="text-indigo-400" /> : <Monitor size={18} className="text-(--text-muted)" />}
                <span className="text-sm capitalize font-bold">{theme}</span>
                <ChevronDown size={16} className={`text-(--text-muted) transition-transform duration-200 ${isThemeOpen ? 'rotate-180' : ''}`} />
              </button>
              {isThemeOpen && (
                <div className="absolute top-full right-0 mt-3 min-w-48 glass-panel z-50 p-2 animate-slide-up origin-top-right shadow-2xl border border-(--border-glass) rounded-xl">
                  <button 
                    onClick={() => { setTheme('light'); setIsThemeOpen(false); }} 
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${theme === 'light' ? 'bg-(--accent-primary)/10 text-(--accent-primary)' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'}`}
                  >
                    <Sun size={18} className={theme === 'light' ? 'text-amber-500' : 'text-(--text-muted)'} /> Light
                  </button>
                  <button 
                    onClick={() => { setTheme('dark'); setIsThemeOpen(false); }} 
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${theme === 'dark' ? 'bg-(--accent-primary)/10 text-(--accent-primary)' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'}`}
                  >
                    <Moon size={18} className={theme === 'dark' ? 'text-indigo-400' : 'text-(--text-muted)'} /> Dark
                  </button>
                  <button 
                    onClick={() => { setTheme('system'); setIsThemeOpen(false); }} 
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${theme === 'system' ? 'bg-(--accent-primary)/10 text-(--accent-primary)' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'}`}
                  >
                    <Monitor size={18} className={theme === 'system' ? 'text-(--accent-primary)' : 'text-(--text-muted)'} /> System
                  </button>
                </div>
              )}
            </div>

            <span className="user-email">{user.email}</span>
            <div className="user-profile-menu" ref={profileRef} style={{ position: 'relative' }}>
              <div 
                className="user-avatar cursor-pointer transition-all"
                style={{ 
                  boxShadow: isProfileDropdownOpen ? '0 0 0 2px #3b82f6' : 'none',
                  backgroundImage: profileData?.profile_picture_url ? `url(${profileData.profile_picture_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: profileData?.profile_picture_url ? 'transparent' : 'white'
                }}
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                {!profileData?.profile_picture_url && ((user as any).name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase())}
              </div>

              {isProfileDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '12px', background: 'var(--bg-card, #1a1d21)', border: '1px solid var(--border-color, #333)', borderRadius: '12px', overflow: 'hidden', zIndex: 50, minWidth: '240px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color, #333)', paddingBottom: '16px', marginBottom: '16px' }}>
                     <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', backgroundImage: profileData?.profile_picture_url ? `url(${profileData.profile_picture_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                       {!profileData?.profile_picture_url && ((user as any).name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase())}
                     </div>
                     <h3 style={{ margin: 0, color: 'var(--text-primary, white)', fontSize: '16px', fontWeight: '600', textAlign: 'center' }}>{(user as any).name || 'User'}</h3>
                     <p style={{ margin: 0, color: 'var(--text-secondary, #9ca3af)', fontSize: '12px', textAlign: 'center' }}>{user.email}</p>
                  </div>
                  
                  {profileData?.education && (
                     <div style={{ marginBottom: '12px' }}>
                       <p style={{ margin: '0 0 4px 0', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary, #9ca3af)', fontWeight: 'bold' }}>Education</p>
                       <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary, white)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{profileData.education}</p>
                     </div>
                  )}
                  {profileData?.experience && (
                     <div style={{ marginBottom: '16px' }}>
                       <p style={{ margin: '0 0 4px 0', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary, #9ca3af)', fontWeight: 'bold' }}>Experience</p>
                       <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary, white)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{profileData.experience}</p>
                     </div>
                  )}

                  <button 
                    onClick={() => { useAuthStore.getState().logout(); }} 
                    style={{ width: '100%', padding: '10px 12px', background: '#ef4444', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
