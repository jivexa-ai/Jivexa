import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--background)',
        gap: 'var(--space-md)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          animation: 'pulse 1.2s infinite ease-in-out'
        }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Verifying JIVEXA credentials...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const dashboardRoutes: Record<UserRole, string> = {
      PATIENT: '/patient/dashboard',
      DOCTOR: '/doctor/dashboard',
      PHARMACY: '/pharmacy/dashboard',
      ADMIN: '/admin/dashboard',
      AMBULANCE_PARTNER: '/ambulance/dashboard'
    };
    
    return <Navigate to={dashboardRoutes[role]} replace />;
  }

  return <>{children}</>;
};
