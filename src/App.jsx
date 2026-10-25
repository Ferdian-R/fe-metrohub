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
import { InternDashboardPage } from './modules/magang/pages/InternDashboardPage';
import { InternAttendancePage } from './modules/magang/pages/InternAttendancePage';
import { InternLogbookPage } from './modules/magang/pages/InternLogbookPage';
import { InternTasksPage } from './modules/magang/pages/InternTasksPage';
import { InternProfilePage } from './modules/magang/pages/InternProfilePage';
import { AdminUsersPage } from './modules/pengaturan/pages/AdminUsersPage';

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

// Pengarah cerdas berdasarkan role user
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'Anak Magang') {
    return <Navigate to="/magang/dashboard" replace />;
  }
  return <Navigate to="/admin/magang/interns" replace />;
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
              <Route index element={<RoleBasedRedirect />} />

              {/* Portal Admin Routes */}
              <Route path="admin/dashboard" element={<Navigate to="/admin/magang/interns" replace />} />
              <Route path="admin/magang/interns" element={<AdminInternsPage />} />
              <Route path="admin/magang/interns/:id" element={<AdminInternDetailPage />} />
              <Route path="admin/magang/absensi" element={<AdminAttendancePage />} />
              <Route path="admin/magang/logbook" element={<AdminLogbookPage />} />
              <Route path="admin/magang/penugasan" element={<AdminTasksPage />} />
              <Route path="admin/pengaturan/pengguna" element={<AdminUsersPage />} />

              {/* Portal Anak Magang Routes (M-01) */}
              <Route path="magang/dashboard" element={<InternDashboardPage />} />
              <Route path="magang/absensi" element={<InternAttendancePage />} />
              <Route path="magang/logbook" element={<InternLogbookPage />} />
              <Route path="magang/tugas" element={<InternTasksPage />} />
              <Route path="magang/profil" element={<InternProfilePage />} />

              {/* Universal dashboard fallback */}
              <Route path="dashboard" element={<RoleBasedRedirect />} />
            </Route>

            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
