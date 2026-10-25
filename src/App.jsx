import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './modules/core/pages/LoginPage';
import { InternDashboard } from './modules/magang/pages/InternDashboard';
import { AttendancePage } from './modules/magang/pages/AttendancePage';
import { TasksPage } from './modules/magang/pages/TasksPage';
import { AdminInternsPage } from './modules/magang/pages/AdminInternsPage';
import { AdminAttendancePage } from './modules/magang/pages/AdminAttendancePage';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission) && user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes inside DashboardLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Intern Routes */}
            <Route path="dashboard" element={<InternDashboard />} />
            <Route path="absensi" element={<AttendancePage />} />
            <Route path="tugas" element={<TasksPage />} />

            {/* Admin Routes */}
            <Route
              path="admin/dashboard"
              element={<Navigate to="/admin/magang/interns" replace />}
            />
            <Route
              path="admin/magang/interns"
              element={
                <ProtectedRoute requiredPermission="magang:kelola">
                  <AdminInternsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/magang/absensi"
              element={
                <ProtectedRoute requiredPermission="magang:kelola">
                  <AdminAttendancePage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
