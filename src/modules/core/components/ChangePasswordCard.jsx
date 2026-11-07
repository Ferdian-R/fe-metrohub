import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { coreService } from '../services/coreService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const inputClass =
  'w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]';

// Ubah password akun sendiri (PATCH /auth/password).
// Server mencabut semua sesi setelah berhasil, jadi pengguna diarahkan login ulang.
export const ChangePasswordCard = () => {
  const { clearSession } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ lama: '', baru: '', ulang: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.baru.length < 8) return setError('Password baru minimal 8 karakter.');
    if (form.baru !== form.ulang) return setError('Konfirmasi password baru tidak sama.');

    try {
      setSaving(true);
      await coreService.changePassword(form.lama, form.baru);
      showToast({
        title: 'Password berhasil diubah',
        message: 'Silakan login kembali dengan password baru.',
      });
      clearSession();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err?.details?.[0]?.message || err?.message || 'Gagal mengubah password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-5">
      <div className="flex items-center gap-2.5">
        <KeyRound className="w-5 h-5 text-[#17362f]" />
        <h2 className="text-lg font-bold text-slate-900 font-lexend">Ubah password</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password lama</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.lama}
            onChange={(e) => setForm({ ...form, lama: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password baru</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.baru}
            onChange={(e) => setForm({ ...form, baru: e.target.value })}
            className={inputClass}
          />
          <p className="text-[11px] text-slate-400 mt-1">Minimal 8 karakter.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ulangi password baru</label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={form.ulang}
            onChange={(e) => setForm({ ...form, ulang: e.target.value })}
            className={inputClass}
          />
        </div>

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

        <p className="text-[11px] text-slate-400">
          Setelah password diubah, semua sesi login akun ini akan diakhiri.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
        >
          {saving ? 'Menyimpan...' : 'Simpan Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordCard;
