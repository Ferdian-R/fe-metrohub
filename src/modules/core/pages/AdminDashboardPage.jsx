import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, TrendingDown, Wallet, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { coreService } from '../services/coreService';
import { useAuth } from '../../../context/AuthContext';

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(n) || 0
  );

const formatBulan = (ym) => {
  if (!ym) return 'bulan ini';
  const [y, m] = ym.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
};

const Stat = ({ icon: Icon, label, value, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-[#edf6f1] text-[#17362f]',
    green: 'bg-[#e7f5ec] text-[#176a43]',
    red: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg md:text-xl font-bold text-slate-900 font-lexend break-words">{value}</p>
      </div>
    </div>
  );
};

const ModuleCard = ({ title, subtitle, link, linkLabel, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col gap-5">
    <div>
      <h2 className="text-base font-bold text-slate-900 font-lexend">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex-1 space-y-4">{children}</div>
    {link && (
      <Link
        to={link}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#17362f] hover:underline self-start"
      >
        {linkLabel} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    )}
  </div>
);

// Setiap modul punya kartu sendiri; modul baru tanpa renderer khusus tetap tampil generik.
const renderKartu = (kartu, hasPermission) => {
  const { modul, nama, data = {} } = kartu;

  if (modul === 'magang') {
    return (
      <ModuleCard
        key={modul}
        title={nama}
        subtitle="Anak magang dalam periode magang hari ini"
        link={hasPermission('magang:kelola') ? '/admin/magang/interns' : null}
        linkLabel="Lihat data anak magang"
      >
        <Stat icon={Users} label="Anak magang aktif" value={data.anak_magang_aktif ?? 0} />
      </ModuleCard>
    );
  }

  if (modul === 'keuangan') {
    const saldo = Number(data.saldo) || 0;
    return (
      <ModuleCard
        key={modul}
        title={nama}
        subtitle={`Ringkasan ${formatBulan(data.bulan)}`}
        link={hasPermission('keuangan:lihat') ? '/admin/keuangan/ringkasan' : null}
        linkLabel="Lihat ringkasan keuangan"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Stat icon={TrendingUp} tone="green" label="Total pemasukan" value={formatRupiah(data.total_pemasukan)} />
          <Stat icon={TrendingDown} tone="red" label="Total pengeluaran" value={formatRupiah(data.total_pengeluaran)} />
        </div>
        <div className="pt-4 border-t border-slate-100">
          <Stat icon={Wallet} tone={saldo < 0 ? 'red' : 'slate'} label="Saldo bulan ini" value={formatRupiah(saldo)} />
        </div>
      </ModuleCard>
    );
  }

  return (
    <ModuleCard key={modul} title={nama}>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex justify-between text-xs">
          <span className="text-slate-500">{k.replace(/_/g, ' ')}</span>
          <span className="font-semibold text-slate-800">{String(v)}</span>
        </div>
      ))}
    </ModuleCard>
  );
};

export const AdminDashboardPage = () => {
  const { user, hasPermission } = useAuth();
  const [kartu, setKartu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await coreService.getDashboard();
      setKartu(res?.data?.kartu || []);
    } catch (err) {
      setError(err?.message || 'Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 w-full pb-16 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">Dashboard</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Selamat datang{user?.nama ? `, ${user.nama}` : ''}. Ringkasan kondisi perusahaan saat ini.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs md:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={load}
            className="px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold cursor-pointer"
          >
            Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#17362f] mb-3" />
          <p className="text-sm">Memuat ringkasan...</p>
        </div>
      ) : (
        !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {kartu.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada modul yang menyediakan ringkasan.</p>
            ) : (
              kartu.map((k) => renderKartu(k, hasPermission))
            )}
          </div>
        )
      )}
    </div>
  );
};

export default AdminDashboardPage;
