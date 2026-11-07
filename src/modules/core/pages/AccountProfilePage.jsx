import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ChangePasswordCard } from '../components/ChangePasswordCard';

// Profil untuk pengguna non-anak magang (misalnya Admin)
export const AccountProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nama = user?.nama || '-';
  const initials =
    nama
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || 'AD';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">Profil</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Informasi akun dan keamanan login Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-2xs flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#dbe8e2] text-[#17362f] font-bold text-2xl flex items-center justify-center mb-4 shadow-inner">
            {initials}
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-lexend">{nama}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5 break-all">{user?.email}</p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-4 bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4]">
            {user?.role}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>

        <div className="md:col-span-2">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
};

export default AccountProfilePage;
