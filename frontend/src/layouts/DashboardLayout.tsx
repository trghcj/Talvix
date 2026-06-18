import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
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
            <div className="theme-switcher" ref={themeRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsThemeOpen(!isThemeOpen)} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--border-color, #333)', color: 'var(--text-primary, white)', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer' }}
              >
                {theme === 'light' ? <Sun size={16} /> : theme === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
                <span style={{ fontSize: '14px', textTransform: 'capitalize' }}>{theme}</span>
                <ChevronDown size={14} />
              </button>
              {isThemeOpen && (
                <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', background: 'var(--bg-card, #1a1d21)', border: '1px solid var(--border-color, #333)', borderRadius: '8px', overflow: 'hidden', zIndex: 50, minWidth: '120px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                  <button onClick={() => { setTheme('light'); setIsThemeOpen(false); }} className="theme-option-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-primary, white)', cursor: 'pointer', textAlign: 'left' }}>
                    <Sun size={14} /> Light
                  </button>
                  <button onClick={() => { setTheme('dark'); setIsThemeOpen(false); }} className="theme-option-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-primary, white)', cursor: 'pointer', textAlign: 'left' }}>
                    <Moon size={14} /> Dark
                  </button>
                  <button onClick={() => { setTheme('system'); setIsThemeOpen(false); }} className="theme-option-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-primary, white)', cursor: 'pointer', textAlign: 'left' }}>
                    <Monitor size={14} /> System
                  </button>
                </div>
              )}
            </div>

            <span className="user-email">{user.email}</span>
            <div className="user-avatar">
              {user.email?.charAt(0).toUpperCase()}
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
