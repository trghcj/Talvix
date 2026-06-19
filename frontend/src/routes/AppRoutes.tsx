import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// We'll create these pages next
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';

import { DashboardLayout } from '../layouts/DashboardLayout';
import { CandidateDashboard } from '../pages/CandidateDashboard';
import { RecruiterDashboard } from '../pages/RecruiterDashboard';
import { CandidateProfileView } from '../pages/CandidateProfileView';

// ATS Pages
import JobManagement from '../pages/recruiter/JobManagement';
import CreateJob from '../pages/recruiter/CreateJob';
import ApplicantManagement from '../pages/recruiter/ApplicantManagement';

import JobBoard from '../pages/candidate/JobBoard';
import JobDetails from '../pages/candidate/JobDetails';
import MyApplications from '../pages/candidate/MyApplications';

import CareerPageBuilder from '../pages/recruiter/CareerPageBuilder';
import PublicCareerPage from '../pages/public/CareerPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import OrganizationSettings from '../pages/admin/OrganizationSettings';

// Super Admin Pages
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import OrganizationsList from '../pages/superadmin/OrganizationsList';

// A simple wrapper to decide which dashboard to show
const DashboardRouter = () => {
  const { activeRole } = useAuthStore();
  
  if (activeRole === 'recruiter') return <RecruiterDashboard />;
  return <CandidateDashboard />;
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="loader"></span></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="loader"></span></div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route Wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isOrgAdmin, loading } = useAuthStore();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="loader"></span></div>;
  if (!isOrgAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Super Admin Route Wrapper
const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSuperAdmin, loading } = useAuthStore();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="loader"></span></div>;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Public Career Page */}
        <Route path="/careers/:slug" element={<PublicCareerPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardRouter />} />
          <Route path="profile" element={<CandidateProfileView />} />
          
          {/* Recruiter Routes */}
          <Route path="jobs" element={<JobManagement />} />
          <Route path="jobs/create" element={<CreateJob />} />
          <Route path="jobs/:jobId/applicants" element={<ApplicantManagement />} />
          <Route path="applicants" element={<ApplicantManagement />} />
          <Route path="career-page" element={<CareerPageBuilder />} />

          {/* Candidate Routes */}
          <Route path="candidate/jobs" element={<JobBoard />} />
          <Route path="candidate/jobs/:jobId" element={<JobDetails />} />
          <Route path="candidate/applications" element={<MyApplications />} />

          {/* Admin Routes */}
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="admin/settings" element={<AdminRoute><OrganizationSettings /></AdminRoute>} />

          {/* Super Admin Routes */}
          <Route path="superadmin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
          <Route path="superadmin/organizations" element={<SuperAdminRoute><OrganizationsList /></SuperAdminRoute>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};
