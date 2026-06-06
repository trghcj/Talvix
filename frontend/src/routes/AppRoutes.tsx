import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// We'll create these pages next
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';

import { DashboardLayout } from '../layouts/DashboardLayout';
import { CandidateDashboard } from '../pages/CandidateDashboard';
import { RecruiterDashboard } from '../pages/RecruiterDashboard';
import { CandidateProfileView } from '../pages/CandidateProfileView';

// A simple wrapper to decide which dashboard to show
const DashboardRouter = () => {
  // TODO: Fetch user role from backend
  const role = 'candidate'; // Hardcoded for now
  
  if (role === 'recruiter') return <RecruiterDashboard />;
  return <CandidateDashboard />;
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="loader"></span></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="loader"></span></div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
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

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardRouter />} />
          <Route path="jobs" element={<div>Jobs Page Coming Soon</div>} />
          <Route path="profile" element={<CandidateProfileView />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};
