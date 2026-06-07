import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sidebar } from '../components/ui/Sidebar';
import './DashboardLayout.css';

export const DashboardLayout = () => {
  const { user, loading } = useAuthStore();

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
