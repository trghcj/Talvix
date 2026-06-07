import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Sidebar.css';

export const Sidebar = () => {
  const { logout } = useAuthStore();
  
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Talvix</h2>
      </div>
      
      <nav className="sidebar-nav">
        <span className="nav-label">MENU</span>
        
        {/* Wrapping the links in a card-like group container */}
        <div className="nav-group-card">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <span className="nav-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="16" rx="4" fill="#E2E8F0"/>
                <rect x="5" y="10" width="4" height="8" rx="1" fill="#4ADE80"/>
                <rect x="10" y="14" width="4" height="4" rx="1" fill="#F43F5E"/>
                <rect x="15" y="6" width="4" height="12" rx="1" fill="#3B82F6"/>
              </svg>
            </span>
            Overview
          </NavLink>
          <NavLink to="/dashboard/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="8" width="18" height="12" rx="2" fill="#8B5A5A"/>
                <path d="M7 8V6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V8" stroke="#8B5A5A" strokeWidth="2" strokeLinecap="round"/>
                <rect x="10" y="12" width="4" height="3" rx="1" fill="#D97757"/>
                <line x1="3" y1="12" x2="21" y2="12" stroke="#683B3B" strokeWidth="2"/>
              </svg>
            </span>
            Jobs
          </NavLink>
          <NavLink to="/dashboard/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" fill="#7C3AED"/>
                <path d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21" fill="#7C3AED"/>
              </svg>
            </span>
            Profile
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-link logout-btn" onClick={() => logout()}>
          <span className="nav-icon">🚪</span>
          Log out
        </button>
      </div>
    </aside>
  );
};
