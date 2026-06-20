import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Repeat, Globe, Settings, Users, Shield, Server } from 'lucide-react';
import './Sidebar.css';

export const Sidebar = () => {
  const { logout, activeRole, isOrgAdmin, isSuperAdmin, activeOrganization, organizations, setActiveOrganization } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        {!isCollapsed && <img src="/Talvix_Logo.png" alt="Talvix" style={{ height: '40px', objectFit: 'contain' }} />}
        <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <polyline points="13 16 16 12 13 8"></polyline>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <polyline points="15 16 12 12 15 8"></polyline>
            </svg>
          )}
        </button>
      </div>

      {!isCollapsed && organizations?.length > 1 && activeRole === 'recruiter' && (
        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
          <select 
            value={activeOrganization?.id || ''}
            onChange={(e) => {
              const org = organizations.find((o: any) => o.organization.id === parseInt(e.target.value))?.organization;
              if (org) setActiveOrganization(org);
            }}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              borderRadius: '12px', 
              background: 'var(--bg-secondary)', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontSize: '14px',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            {organizations.map((org: any) => (
              <option key={org.organization.id} value={org.organization.id}>
                {org.organization.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <nav className="sidebar-nav">
        {!isCollapsed && <span className="nav-label">MENU</span>}
        
        <div className="nav-group">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end title="Overview">
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </span>
            {!isCollapsed && <span className="nav-text">Overview</span>}
          </NavLink>

          {/* Recruiter Links */}
          {activeRole === 'recruiter' && activeOrganization && (
            <>
              <NavLink to="/dashboard/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end title="Manage Jobs">
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </span>
                {!isCollapsed && <span className="nav-text">Manage Jobs</span>}
              </NavLink>
              <NavLink to="/dashboard/jobs/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Post Job">
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                {!isCollapsed && <span className="nav-text">Post Job</span>}
              </NavLink>
              <NavLink to="/dashboard/applicants" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Applicants">
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                {!isCollapsed && <span className="nav-text">Applicants</span>}
              </NavLink>
              <NavLink to="/dashboard/career-page" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Career Page">
                <span className="nav-icon">
                  <Globe size={20} />
                </span>
                {!isCollapsed && <span className="nav-text">Career Page</span>}
              </NavLink>
            </>
          )}

          {/* Candidate Links */}
          {activeRole === 'candidate' && (
            <>
              <NavLink to="/dashboard/candidate/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end title="Find Jobs">
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                {!isCollapsed && <span className="nav-text">Find Jobs</span>}
              </NavLink>
              <NavLink to="/dashboard/candidate/applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="My Applications">
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
                {!isCollapsed && <span className="nav-text">My Applications</span>}
              </NavLink>
            </>
          )}

          <NavLink to="/dashboard/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Profile">
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            {!isCollapsed && <span className="nav-text">Profile</span>}
          </NavLink>

          {/* Admin Links */}
          {activeRole === 'recruiter' && activeOrganization && isOrgAdmin && (
            <>
              <div className="nav-divider" style={{ margin: '12px 0', borderTop: '1px solid var(--border)', opacity: 0.5 }}></div>
              {!isCollapsed && <span className="nav-label" style={{ paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Hub</span>}
              <NavLink to="/dashboard/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end title="Org Analytics">
                <span className="nav-icon"><Shield size={20} /></span>
                {!isCollapsed && <span className="nav-text">Org Analytics</span>}
              </NavLink>
              <NavLink to="/dashboard/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="User Management">
                <span className="nav-icon"><Users size={20} /></span>
                {!isCollapsed && <span className="nav-text">Manage Team</span>}
              </NavLink>
              <NavLink to="/dashboard/admin/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Organization Settings">
                <span className="nav-icon"><Settings size={20} /></span>
                {!isCollapsed && <span className="nav-text">Settings</span>}
              </NavLink>
            </>
          )}

          {/* Super Admin Links */}
          {isSuperAdmin && (
            <>
              <div className="nav-divider" style={{ margin: '12px 0', borderTop: '1px solid var(--border)', opacity: 0.5 }}></div>
              {!isCollapsed && <span className="nav-label" style={{ paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Super Admin</span>}
              <NavLink to="/dashboard/superadmin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end title="Platform Analytics">
                <span className="nav-icon"><Server size={20} /></span>
                {!isCollapsed && <span className="nav-text">Platform Analytics</span>}
              </NavLink>
              <NavLink to="/dashboard/superadmin/organizations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="All Organizations">
                <span className="nav-icon"><Globe size={20} /></span>
                {!isCollapsed && <span className="nav-text">All Organizations</span>}
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button 
          className="nav-link switch-role-btn" 
          onClick={() => useAuthStore.getState().setActiveRole(activeRole === 'candidate' ? 'recruiter' : 'candidate')} 
          title="Switch Role"
          style={{ marginBottom: '8px' }}
        >
          <span className="nav-icon"><Repeat size={18} /></span>
          {!isCollapsed && <span className="nav-text">Switch to {activeRole === 'candidate' ? 'Employer' : 'Candidate'}</span>}
        </button>

        <button className="nav-link logout-btn" onClick={() => logout()} title="Log out">
          <span className="nav-icon"><LogOut size={18} /></span>
          {!isCollapsed && <span className="nav-text">Log out</span>}
        </button>
      </div>
    </aside>
  );
};
