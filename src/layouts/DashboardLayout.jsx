import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck2,
  BookOpenCheck,
  CheckSquare,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Building2,
  ShieldAlert,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout, hasPermission } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = hasPermission('magang:kelola') || user?.role === 'Admin';
  const isIntern = hasPermission('magang:absen');

  const navItems = [
    // Magang items (Intern Role)
    ...(isIntern
      ? [
          { name: 'Dashboard Saya', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Absensi & Logbook', path: '/absensi', icon: CalendarCheck2 },
          { name: 'Tugas Saya', path: '/tugas', icon: CheckSquare },
        ]
      : []),
    // Admin items
    ...(isAdmin
      ? [
          { name: 'Dashboard Admin', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Data Anak Magang', path: '/admin/magang/interns', icon: Users },
          { name: 'Rekap Absensi & Logbook', path: '/admin/magang/absensi', icon: ClipboardList },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow">
            M
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight leading-none">MetroHub</h1>
            <p className="text-[10px] text-slate-400">Modul Magang</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-800 hidden md:flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md text-base">
            M
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight leading-none">MetroHub</h1>
            <p className="text-xs text-indigo-400 font-medium mt-0.5">Sistem Manajemen Magang</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-center border border-indigo-500/30">
            {user?.nama?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.nama || 'Pengguna'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.role || 'User'}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
