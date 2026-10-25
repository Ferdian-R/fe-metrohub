import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, LogOut } from 'lucide-react';

export const InternProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const profileData = {
    nama: user?.role === 'Anak Magang' ? user.nama : 'Raka Aditya',
    email: user?.role === 'Anak Magang' ? user.email : 'raka@metro.demo',
    inisial: 'RA',
    statusAkun: 'Akun aktif',
    asalKampus: 'Universitas Negeri Yogyakarta',
    periode: '1 Agustus — 31 Desember 2026',
    statusKerja: 'On-site',
    statusPeriode: 'Aktif · 72 hari tersisa',
  };

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header Halaman Sesuai Figma M-05 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
          Profil
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-source-sans">
          Informasi akun dan masa magang Anda.
        </p>
      </div>

      {/* Grid 2 Kolom: Kartu Identitas & Kartu Informasi Magang */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri: Kartu Identitas Akun */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-2xs flex flex-col items-center justify-center">
          {/* Avatar Lingkaran Besar */}
          <div className="w-24 h-24 rounded-full bg-[#dbe8e2] text-[#17362f] font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            {profileData.inisial}
          </div>

          {/* Nama & Email */}
          <h2 className="text-lg font-bold text-slate-900 font-lexend">
            {profileData.nama}
          </h2>
          <p className="text-xs text-slate-500 font-source-sans mt-0.5">
            {profileData.email}
          </p>

          {/* Badge Akun Aktif */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4] mt-4 font-source-sans">
            {profileData.statusAkun}
          </span>
        </div>

        {/* Kolom Kanan: Kartu Informasi Magang */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-8 shadow-2xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 font-lexend">
            Informasi magang
          </h2>

          {/* Tabel / Baris Informasi */}
          <div className="divide-y divide-slate-100 text-xs font-source-sans">
            <div className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center">
              <span className="text-slate-500 w-36 shrink-0 mb-1 sm:mb-0">
                Asal kampus
              </span>
              <span className="font-bold text-slate-800">
                {profileData.asalKampus}
              </span>
            </div>

            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center">
              <span className="text-slate-500 w-36 shrink-0 mb-1 sm:mb-0">
                Periode
              </span>
              <span className="font-bold text-slate-800">
                {profileData.periode}
              </span>
            </div>

            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center">
              <span className="text-slate-500 w-36 shrink-0 mb-1 sm:mb-0">
                Status kerja
              </span>
              <span className="font-bold text-slate-800">
                {profileData.statusKerja}
              </span>
            </div>

            <div className="py-3.5 flex flex-col sm:flex-row sm:items-center">
              <span className="text-slate-500 w-36 shrink-0 mb-1 sm:mb-0">
                Status periode
              </span>
              <span className="font-bold text-slate-800">
                {profileData.statusPeriode}
              </span>
            </div>
          </div>

          {/* Kotak Pengumuman / Catatan Kebijakan */}
          <div className="bg-[#edf6f1] border border-[#cde6d7] rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#176a43] font-source-sans">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#176a43]" />
            <span>
              Status kerja dan periode dikelola Admin. Profil ini hanya dapat dilihat.
            </span>
          </div>

          {/* Tombol Keluar dari Akun (Merah) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2.5 bg-[#b91c1c] hover:bg-[#991b1b] active:scale-[0.99] text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition shadow-xs cursor-pointer font-source-sans"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
