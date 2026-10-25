import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  Users,
  Clock,
  BookOpen,
  CheckSquare,
  FileText,
  Tag,
  BarChart2,
  Shield,
  MapPin,
  ChevronDown,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navGroups = [
    {
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutGrid },
      ],
    },
    {
      header: 'MANAJEMEN MAGANG',
      items: [
        { name: 'Data Anak Magang', path: '/admin/magang/interns', icon: Users },
        { name: 'Absensi', path: '/admin/magang/absensi', icon: Clock },
        { name: 'Logbook', path: '/admin/magang/logbook', icon: BookOpen },
        { name: 'Penugasan', path: '/admin/magang/penugasan', icon: CheckSquare },
      ],
    },
    {
      header: 'MANAJEMEN KEUANGAN',
      items: [
        { name: 'Transaksi', path: '/admin/keuangan/transaksi', icon: FileText },
        { name: 'Kategori', path: '/admin/keuangan/kategori', icon: Tag },
        { name: 'Ringkasan Keuangan', path: '/admin/keuangan/ringkasan', icon: BarChart2 },
      ],
    },
    {
      header: 'PENGATURAN',
      items: [
        { name: 'Pengguna dan Role', path: '/admin/pengaturan/pengguna', icon: ShieldCheck },
        { name: 'Lokasi Kantor', path: '/admin/pengaturan/lokasi', icon: MapPin },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f5] flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#17362f] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Metro Software" className="w-7 h-7 rounded-lg object-contain shadow-xs border border-[#3b5f56]" />
          <span className="font-semibold text-sm">Metro Software</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded-lg text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar: Fixed & Height Pas Layar (h-screen, sticky top-0 di desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-[#17362f] text-[#a4c2b8] flex flex-col justify-between transition-transform duration-200 shrink-0 md:sticky md:top-0 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Brand Header */}
          <div className="p-5 flex items-center gap-3 shrink-0">
            <img src="/logo.png" alt="Metro Software" className="w-8 h-8 rounded-lg object-contain shadow-xs border border-[#375e53]" />
            <span className="font-semibold text-sm text-white tracking-tight">
              Metro Software
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-4 flex-1">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                {group.header && (
                  <p className="px-3 py-1 text-[10px] font-semibold tracking-wider text-[#6b9386] uppercase">
                    {group.header}
                  </p>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-[#f4f6f5] text-[#17362f] font-semibold shadow-xs'
                          : 'text-[#9abcb1] hover:text-white hover:bg-[#1f453d]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 mx-3 mb-4 rounded-xl border border-[#2b5349] bg-[#15322b] shrink-0">
          <p className="text-xs font-semibold text-white">Ruang kerja Admin</p>
          <p className="text-[11px] text-[#71988b]">Demo · data contoh</p>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Main Content Area: Hanya bagian ini yang scroll */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Sticky */}
        <header className="h-14 bg-white/95 backdrop-blur-xs border-b border-[#e2e7e4] px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Operasional internal <span className="font-semibold text-slate-700">20 Oktober 2026</span>
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 hover:bg-slate-50 p-1.5 rounded-xl transition select-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#d6e7df] text-[#17362f] font-bold text-xs flex items-center justify-center">
                NP
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">Nadia Pratama</p>
                <p className="text-[10px] text-slate-400 leading-tight">Admin</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800">Nadia Pratama</p>
                  <p className="text-[11px] text-slate-400">admin@metro.demo</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page View Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
