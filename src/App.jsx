import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './modules/core/pages/LoginPage';
import { AdminInternsPage } from './modules/magang/pages/AdminInternsPage';
import { AdminInternDetailPage } from './modules/magang/pages/AdminInternDetailPage';
import { AdminAttendancePage } from './modules/magang/pages/AdminAttendancePage';
import { AdminLogbookPage } from './modules/magang/pages/AdminLogbookPage';
import { AdminTasksPage } from './modules/magang/pages/AdminTasksPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f5]">
        <div className="w-8 h-8 border-4 border-[#17362f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/magang/interns" replace />} />
              <Route path="admin/magang/interns" element={<AdminInternsPage />} />
              <Route path="admin/magang/interns/:id" element={<AdminInternDetailPage />} />
              <Route path="admin/magang/absensi" element={<AdminAttendancePage />} />
              <Route path="admin/magang/logbook" element={<AdminLogbookPage />} />
              <Route path="admin/magang/penugasan" element={<AdminTasksPage />} />
              <Route path="admin/dashboard" element={<Navigate to="/admin/magang/interns" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/admin/magang/interns" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
