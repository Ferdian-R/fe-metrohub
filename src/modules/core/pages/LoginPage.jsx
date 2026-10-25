import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@metro.demo');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.data.user.role === 'Admin') {
          navigate('/admin/magang/interns');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      // Sesuai PRD CR-01: Pesan tanpa menyebut bagian mana yang salah
      setError(err.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#fcfdfd] font-sans overflow-x-hidden">
      {/* Sisi Kiri: Full Height Brand Panel (Deep Forest Green) */}
      <div className="w-full md:w-[45%] lg:w-[42%] min-h-[340px] md:min-h-screen bg-[#17362f] text-white p-8 md:p-14 lg:p-16 flex flex-col justify-between shrink-0">
        <div className="space-y-12">
          {/* Logo Metro Software */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Metro Software" className="w-8 h-8 rounded-lg object-contain shadow-xs border border-[#3b5f56]" />
            <span className="font-semibold text-sm tracking-tight text-slate-100">
              Metro Software
            </span>
          </div>

          {/* Headline Utama */}
          <div className="pt-2 md:pt-8">
            <p className="text-[10px] tracking-[0.2em] font-bold text-[#89b4a6] uppercase mb-4">
              Sistem Operasional Internal
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.15]">
              Kerja harian <br />
              yang tercatat <br />
              dengan jelas.
            </h1>
            <p className="text-xs md:text-sm text-[#9bb8ad] mt-5 leading-relaxed max-w-sm">
              Kelola magang, kehadiran, penugasan, dan keuangan perusahaan dalam satu ruang kerja yang tertata.
            </p>
          </div>
        </div>

        {/* Footer Sisi Kiri */}
        <div className="pt-10 flex items-center gap-3 text-xs text-[#71988b]">
          <span className="px-2.5 py-0.5 rounded border border-[#2b5349] bg-[#1a3e36] text-[10px] font-semibold text-[#8eb8aa]">
            Demo
          </span>
          <span>Data hanya contoh</span>
        </div>
      </div>

      {/* Sisi Kanan: Full Height Form Container */}
      <div className="w-full md:w-[55%] lg:w-[58%] min-h-screen bg-[#fcfdfd] p-8 md:p-14 lg:p-20 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto space-y-7">
          {/* Header Form */}
          <div>
            <p className="text-[11px] tracking-wider font-bold text-[#17362f] uppercase mb-1.5">
              Akses Akun
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Masuk ke akun Anda
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Masuk dengan akun yang diberikan Admin.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@metro.demo"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-[#f9fafb] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#17362f]/20 focus:border-[#17362f] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-24 rounded-lg border border-slate-300 bg-[#f9fafb] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#17362f]/20 focus:border-[#17362f] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800 transition select-none"
                >
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 mt-2 bg-[#17362f] hover:bg-[#112a24] active:scale-[0.99] disabled:bg-slate-400 text-white font-medium text-sm rounded-lg shadow-sm transition"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Akun Demo Buttons */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-800">Akun demo</p>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
              Pilih akun demo. Password: <span className="font-mono text-slate-700">demo1234</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('admin@metro.demo')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-500 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('magang@metro.demo')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-500 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs"
              >
                Anak Magang
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('nonaktif@metro.demo')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-500 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs"
              >
                Akun nonaktif
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
