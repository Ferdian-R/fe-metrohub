import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  LoaderCircle,
  Wallet,
} from 'lucide-react';
import { financeService, formatRupiah } from '../services/financeService';

const MONTHS = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const YEARS = ['2025', '2026', '2027'];

const getErrorMessage = (error) =>
  error?.message || error?.error || 'Terjadi kesalahan. Silakan coba kembali.';

const unwrapSummary = (response) => {
  let summary = response;
  for (let depth = 0; depth < 5; depth += 1) {
    if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
      throw new Error('Respons ringkasan keuangan dari server tidak valid.');
    }

    const hasSummaryFields = [
      'totalPemasukan',
      'total_pemasukan',
      'categoryBreakdown',
      'category_breakdown',
      'breakdownPemasukan',
      'breakdown_pemasukan',
    ].some((key) => key in summary);
    if (hasSummaryFields) return summary;

    const nested = summary.data ?? summary.summary ?? summary.ringkasan;
    if (!nested || nested === summary) break;
    summary = nested;
  }

  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new Error('Respons ringkasan keuangan dari server tidak valid.');
  }
  return summary;
};

const readNumber = (object, keys) => {
  const value = keys
    .map((key) => object?.[key])
    .find((candidate) => candidate !== undefined && candidate !== null && candidate !== '');
  if (value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const readBreakdown = (summary, type) => {
  const keyAliases =
    type === 'pemasukan'
      ? ['pemasukan', 'income', 'incomes']
      : ['pengeluaran', 'expense', 'expenses'];
  const breakdown =
    summary.categoryBreakdown ??
    summary.category_breakdown ??
    summary.rincianKategori ??
    summary.rincian_kategori ??
    summary.breakdown ??
    {};

  if (Array.isArray(breakdown)) {
    return breakdown.filter((item) => {
      const itemType = String(item.jenis ?? item.type ?? '').toLocaleLowerCase('id-ID');
      return itemType === type;
    });
  }

  for (const key of keyAliases) {
    if (Array.isArray(breakdown?.[key])) return breakdown[key];
  }

  const directKeys =
    type === 'pemasukan'
      ? ['breakdownPemasukan', 'breakdown_pemasukan', 'incomeBreakdown', 'income_breakdown']
      : [
          'breakdownPengeluaran',
          'breakdown_pengeluaran',
          'expenseBreakdown',
          'expense_breakdown',
        ];
  for (const key of directKeys) {
    if (Array.isArray(summary[key])) return summary[key];
  }
  return [];
};

const normalizeBreakdownItem = (item, index, total) => {
  const amount = readNumber(item, ['nominal', 'amount', 'total', 'nilai']) ?? 0;
  const rawPercentage = readNumber(item, ['percentage', 'persentase', 'percent']);

  return {
    id: item.categoryId ?? item.category_id ?? item.id ?? `${item.nama ?? item.name}-${index}`,
    name: item.nama ?? item.name ?? item.category_name ?? item.nama_kategori ?? 'Kategori',
    amount,
    percentage:
      rawPercentage ?? (total > 0 ? Math.round((amount / total) * 10000) / 100 : 0),
    count: readNumber(item, ['count', 'jumlah_transaksi', 'transaction_count']) ?? 0,
  };
};

const SummaryMetric = ({ title, value, description, icon: Icon, valueClassName, emphasis = false }) => (
  <article
    className={`rounded-xl border p-5 shadow-sm ${
      emphasis
        ? 'border-emerald-800 bg-emerald-800 text-white'
        : 'border-slate-200 bg-white text-slate-900'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className={`text-sm font-medium ${emphasis ? 'text-emerald-100' : 'text-slate-500'}`}>
          {title}
        </p>
        <p className={`mt-3 text-2xl font-bold tracking-tight ${valueClassName || ''}`}>
          {value}
        </p>
      </div>
      <span className={`rounded-lg p-2.5 ${emphasis ? 'bg-white/10' : 'bg-slate-50'}`}>
        <Icon className={`h-5 w-5 ${emphasis ? 'text-white' : 'text-slate-500'}`} />
      </span>
    </div>
    {description && (
      <p className={`mt-3 text-xs ${emphasis ? 'text-emerald-100' : 'text-slate-500'}`}>
        {description}
      </p>
    )}
  </article>
);

const BreakdownCard = ({ title, items, color, emptyMessage }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden="true" />
    </div>

    {items.length === 0 ? (
      <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 px-4 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    ) : (
      <ul className="space-y-5">
        {items.map((item) => (
          <li key={item.id}>
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.count > 0
                    ? `${item.count} transaksi`
                    : `${item.percentage.toLocaleString('id-ID')}%`}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-slate-900">{formatRupiah(item.amount)}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.percentage.toLocaleString('id-ID')}%
                </p>
              </div>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={`Persentase ${item.name}`}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.max(0, Math.min(100, item.percentage))}
            >
              <div
                className={`h-full rounded-full transition-all ${color}`}
                style={{ width: `${Math.max(0, Math.min(100, item.percentage))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export const FinanceSummaryPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('10');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [appliedPeriod, setAppliedPeriod] = useState('2026-10');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestNumber, setRequestNumber] = useState(0);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    setSummary(null);
    try {
      const response = await financeService.getMonthlySummary({ periode: appliedPeriod });
      setSummary(unwrapSummary(response));
    } catch (requestError) {
      setSummary(null);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [appliedPeriod, requestNumber]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const metrics = useMemo(() => {
    if (!summary) return null;

    const totalIncome = readNumber(summary, [
      'totalPemasukan',
      'total_pemasukan',
      'total_income',
      'income_total',
    ]);
    const totalExpense = readNumber(summary, [
      'totalPengeluaran',
      'total_pengeluaran',
      'total_expenses',
      'expense_total',
    ]);
    const periodDifference =
      readNumber(summary, ['selisihPeriode', 'selisih_periode', 'netCashflow', 'net_cashflow']) ??
      (totalIncome !== null && totalExpense !== null ? totalIncome - totalExpense : null);
    const openingBalance = readNumber(summary, [
      'saldoAwal',
      'saldo_awal',
      'saldoSebelumPeriode',
      'saldo_sebelum_periode',
      'priorBalance',
      'prior_balance',
    ]);
    const cumulativeBalance = readNumber(summary, [
      'saldoKumulatif',
      'saldo_kumulatif',
      'cumulativeBalance',
      'cumulative_balance',
      'saldoAkhir',
      'saldo_akhir',
    ]);

    return {
      totalIncome,
      totalExpense,
      periodDifference,
      openingBalance,
      cumulativeBalance,
      incomeBreakdown: readBreakdown(summary, 'pemasukan')
        .map((item, index) => normalizeBreakdownItem(item, index, totalIncome ?? 0))
        .filter((item) => item.amount > 0),
      expenseBreakdown: readBreakdown(summary, 'pengeluaran')
        .map((item, index) => normalizeBreakdownItem(item, index, totalExpense ?? 0))
        .filter((item) => item.amount > 0),
    };
  }, [summary]);

  const handleApplyPeriod = (event) => {
    event.preventDefault();
    const period = `${selectedYear}-${selectedMonth}`;
    if (period === appliedPeriod) {
      setRequestNumber((current) => current + 1);
    } else {
      setAppliedPeriod(period);
    }
  };

  const appliedMonthLabel = useMemo(() => {
    const [year, month] = appliedPeriod.split('-');
    return `${MONTHS.find((item) => item.value === month)?.label ?? month} ${year}`;
  }, [appliedPeriod]);

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Ringkasan Keuangan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Laporan pemasukan, pengeluaran, dan saldo kumulatif per periode
          </p>
        </header>

        <form
          onSubmit={handleApplyPeriod}
          className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
        >
          <div className="flex-1 sm:max-w-xs">
            <label htmlFor="summary-month" className="mb-1.5 block text-xs font-semibold text-slate-600">
              Bulan
            </label>
            <select
              id="summary-month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            >
              {MONTHS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 sm:max-w-xs">
            <label htmlFor="summary-year" className="mb-1.5 block text-xs font-semibold text-slate-600">
              Tahun
            </label>
            <select
              id="summary-year"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarDays className="h-4 w-4" />
            )}
            Tampilkan
          </button>
        </form>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="inline-flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </span>
            <button
              type="button"
              onClick={() => setRequestNumber((current) => current + 1)}
              disabled={loading}
              className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 disabled:opacity-50"
            >
              Coba lagi
            </button>
          </div>
        )}

        {loading && !summary ? (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="h-5 w-5 animate-spin text-emerald-800" />
              Memuat ringkasan {appliedMonthLabel}...
            </span>
          </div>
        ) : !summary ? (
          !error && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              Ringkasan belum tersedia untuk periode ini.
            </div>
          )
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-700">
                Metrik {appliedMonthLabel}
              </h2>
              {loading && (
                <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  Memperbarui...
                </span>
              )}
            </div>

            <section aria-label="Metrik keuangan" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric
                title="Total Pemasukan"
                value={metrics.totalIncome === null ? '—' : formatRupiah(metrics.totalIncome)}
                description="Total pemasukan pada periode terpilih"
                icon={ArrowDownCircle}
                valueClassName="text-green-700"
              />
              <SummaryMetric
                title="Total Pengeluaran"
                value={metrics.totalExpense === null ? '—' : formatRupiah(metrics.totalExpense)}
                description="Total pengeluaran pada periode terpilih"
                icon={ArrowUpCircle}
                valueClassName="text-red-700"
              />
              <SummaryMetric
                title="Selisih Periode"
                value={
                  metrics.periodDifference === null
                    ? '—'
                    : formatRupiah(metrics.periodDifference)
                }
                description={
                  metrics.periodDifference === null
                    ? 'Net cashflow bulan berjalan'
                    : metrics.periodDifference >= 0
                      ? 'Surplus net cashflow bulan berjalan'
                      : 'Defisit net cashflow bulan berjalan'
                }
                icon={Wallet}
                valueClassName={
                  metrics.periodDifference === null
                    ? 'text-slate-900'
                    : metrics.periodDifference >= 0
                      ? 'text-green-700'
                      : 'text-red-700'
                }
              />
              <SummaryMetric
                title="Saldo Kumulatif Tercatat"
                value={
                  metrics.cumulativeBalance === null
                    ? '—'
                    : formatRupiah(metrics.cumulativeBalance)
                }
                description={
                  metrics.openingBalance === null
                    ? `Saldo bersih hingga akhir ${appliedMonthLabel}`
                    : `Saldo sebelum periode: ${formatRupiah(metrics.openingBalance)}`
                }
                icon={Wallet}
                emphasis
              />
            </section>

            <section aria-label="Rincian kategori" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BreakdownCard
                title="Rincian Pemasukan per Kategori"
                items={metrics.incomeBreakdown}
                color="bg-green-600"
                emptyMessage="Belum ada transaksi pada periode ini"
              />
              <BreakdownCard
                title="Rincian Pengeluaran per Kategori"
                items={metrics.expenseBreakdown}
                color="bg-red-600"
                emptyMessage="Belum ada transaksi pada periode ini"
              />
            </section>
          </>
        )}

        <aside className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>
            <span className="font-semibold">Catatan:</span> Data contoh, bukan saldo bank. Saldo
            kumulatif mencakup transaksi sebelum periode.
          </p>
        </aside>
      </div>
    </main>
  );
};