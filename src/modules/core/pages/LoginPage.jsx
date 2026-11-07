import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import officePhoto from '../../../assets/login-office.jpg';

// Warna brand panel (hijau tua MetroHub) + gradasi foto kantor
const PANEL_GREEN = '#17362f';
const green = (alpha) => `rgba(23, 54, 47, ${alpha})`;
// Foto mengisi seluruh panel. Kiri → kanan: hijau pekat di area teks, memudar ke papan nama di kanan
const GRADIENT_KIRI = `linear-gradient(to right, ${PANEL_GREEN} 0%, ${green(0.95)} 22%, ${green(0.7)} 45%, ${green(0.15)} 72%, ${green(0.05)} 100%)`;
// Atas & bawah sedikit digelapkan agar logo dan footer tetap terbaca
const GRADIENT_ATAS = `linear-gradient(to bottom, ${green(0.6)} 0%, ${green(0)} 28%, ${green(0)} 70%, ${green(0.7)} 100%)`;

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Arah halaman ditentukan RoleBasedRedirect berdasarkan permission
        navigate('/', { replace: true });
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
      {/* Sisi Kiri: Brand Panel hijau tua + foto kantor Metro dengan gradasi */}
      <div
        className="relative overflow-hidden w-full md:w-[45%] lg:w-[42%] min-h-85 md:min-h-screen text-white flex flex-col shrink-0"
        style={{ backgroundColor: PANEL_GREEN }}
      >
        {/* Foto kantor sebagai latar penuh panel. Di layar lebar foto digeser (object 20%)
            agar papan nama Metro berada di sisi kanan, tidak tertutup judul di kiri.
            Ganti dengan foto portrait beresolusi lebih besar bila tersedia agar lebih tajam. */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <img
            src={officePhoto}
            alt=""
            className="w-full h-full object-cover object-[70%_center] md:object-[20%_center]"
          />
          <div className="absolute inset-0" style={{ backgroundImage: GRADIENT_KIRI }} />
          <div className="absolute inset-0 hidden md:block" style={{ backgroundImage: GRADIENT_ATAS }} />
          {/* HP: teks berada di atas foto, jadi foto digelapkan agar tetap terbaca */}
          <div className="absolute inset-0 md:hidden" style={{ backgroundColor: green(0.72) }} />
        </div>

        <div className="relative z-10 flex-1 p-8 md:p-14 lg:p-16 flex flex-col justify-between">
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
          <div className="pt-10 text-xs text-[#71988b]">
            <span>&copy; {new Date().getFullYear()} Metro Software</span>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Full Height Form Container */}
      <div className="w-full flex-1 md:flex-none md:w-[55%] lg:w-[58%] md:min-h-screen bg-[#fcfdfd] p-8 md:p-14 lg:p-20 flex flex-col justify-center">
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
                placeholder="nama@perusahaan.com"
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
        </div>
      </div>
    </div>
  );
};
