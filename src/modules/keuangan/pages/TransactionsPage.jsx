import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ChevronDown, LoaderCircle, Plus, X } from 'lucide-react';
import { financeService, formatRupiah } from '../services/financeService';
import TransactionModals from '../components/TransactionModals';

const INITIAL_PERIOD = '2026-10';

const getErrorMessage = (error) =>
  error?.message || error?.error || 'Terjadi kesalahan. Silakan coba kembali.';

const extractList = (response, keys) => {
  let payload = response;
  for (let depth = 0; depth < 4; depth += 1) {
    if (Array.isArray(payload)) return payload;
    for (const key of keys) {
      if (Array.isArray(payload?.[key])) return payload[key];
    }
    if (!payload || typeof payload !== 'object' || !('data' in payload)) break;
    payload = payload.data;
  }
  throw new Error('Respons data transaksi dari server tidak valid.');
};

const extractSummary = (response) => {
  let summary = response;
  for (let depth = 0; depth < 4; depth += 1) {
    if (!summary || typeof summary !== 'object' || Array.isArray(summary)) break;
    const hasBalance = [
      'priorBalance',
      'prior_balance',
      'saldoAwal',
      'saldo_awal',
      'saldo_awal_periode',
      'saldo_sebelum_periode',
      'saldo_sebelumnya',
      'initial_balance',
    ].some((key) => summary[key] !== undefined);
    if (hasBalance) break;
    const nestedSummary = summary.data ?? summary.summary ?? summary.ringkasan;
    if (!nestedSummary || nestedSummary === summary) break;
    summary = nestedSummary;
  }
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new Error('Respons ringkasan saldo dari server tidak valid.');
  }

  const priorBalance = [
    summary.priorBalance,
    summary.prior_balance,
    summary.saldoAwal,
    summary.saldo_awal,
    summary.saldo_awal_periode,
    summary.saldo_sebelum_periode,
    summary.saldo_sebelumnya,
    summary.initial_balance,
  ].find((value) => value !== null && value !== undefined && value !== '');

  return {
    priorBalance: priorBalance === undefined ? null : Number(priorBalance),
  };
};

const extractCategoryName = (transaction, categoriesById) => {
  const nestedCategory =
    transaction.category ?? transaction.kategori ?? transaction.category_data;
  const directName =
    transaction.nama_kategori ??
    transaction.category_name ??
    transaction.kategori_nama ??
    nestedCategory?.nama ??
    nestedCategory?.name;
  if (directName) return directName;

  const categoryId =
    transaction.category_id ??
    transaction.kategori_id ??
    nestedCategory?.id;
  return categoriesById.get(String(categoryId)) || 'Kategori tidak tersedia';
};

const normalizeTransaction = (transaction, categoriesById) => ({
  ...transaction,
  id: transaction.id ?? transaction.transaction_id,
  tanggal: transaction.tanggal ?? transaction.date ?? '',
  keterangan: transaction.keterangan ?? transaction.description ?? '',
  jenis: String(transaction.jenis ?? transaction.type ?? '').toLocaleLowerCase('id-ID'),
  nominal: Number(transaction.nominal ?? transaction.amount),
  saldoBerjalan:
    transaction.saldo_berjalan ??
    transaction.saldoBerjalan ??
    transaction.running_balance ??
    transaction.runningBalance ??
    transaction.saldo_kumulatif ??
    null,
  namaKategori: extractCategoryName(transaction, categoriesById),
});

const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateValue;
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const day = match[3];
  const monthIdx = parseInt(match[2], 10) - 1;
  const year = match[1];
  return `${day} ${months[monthIdx] || match[2]} ${year}`;
};

const getTransactionDate = (transaction) => transaction.tanggal?.slice(0, 10) || '';

export const TransactionsPage = () => {
  const [period, setPeriod] = useState(INITIAL_PERIOD);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorBalance, setPriorBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: 'create',
    data: null,
  });
  const requestId = useRef(0);

  const loadTransactions = useCallback(async () => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setLoading(true);
    setPageError('');

    try {
      const [transactionResponse, summaryResponse, categoryResponse] = await Promise.all([
        financeService.getTransactions({ periode: period }),
        financeService.getMonthlySummary({ periode: period }),
        financeService.getCategories(),
      ]);

      const categoryList = extractList(categoryResponse, ['categories', 'items', 'rows']);
      const categoriesById = new Map(
        categoryList.map((category) => [
          String(category.id ?? category.category_id),
          category.nama ?? category.name ?? '',
        ])
      );
      const transactionList = extractList(transactionResponse, [
        'transactions',
        'transaksi',
        'items',
        'rows',
      ]);
      const normalizedTransactions = transactionList
        .filter((transaction) => transaction.deleted_at == null && transaction.deletedAt == null)
        .map((transaction) => normalizeTransaction(transaction, categoriesById))
        .filter((transaction) => getTransactionDate(transaction).startsWith(period))
        .sort((left, right) => {
          const dateOrder = getTransactionDate(left).localeCompare(getTransactionDate(right));
          if (dateOrder !== 0) return dateOrder;
          return String(left.id ?? '').localeCompare(String(right.id ?? ''), undefined, {
            numeric: true,
          });
        });
      const summary = extractSummary(summaryResponse);

      if (requestId.current === currentRequestId) {
        setTransactions(normalizedTransactions);
        setCategories(categoryList);
        setPriorBalance(Number.isFinite(summary.priorBalance) ? summary.priorBalance : null);
      }
    } catch (error) {
      if (requestId.current === currentRequestId) {
        setPageError(getErrorMessage(error));
      }
    } finally {
      if (requestId.current === currentRequestId) setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadTransactions();
    return () => {
      requestId.current += 1;
    };
  }, [loadTransactions]);

  const openCreateModal = () => {
    setActionError('');
    setModalConfig({ isOpen: true, mode: 'create', data: null });
  };

  const openEditModal = (transaction) => {
    setActionError('');
    setModalConfig({ isOpen: true, mode: 'edit', data: transaction });
  };

  const openDeleteModal = (transaction) => {
    setActionError('');
    setModalConfig({ isOpen: true, mode: 'delete', data: transaction });
  };

  const closeModal = () => {
    if (actionLoading) return;
    setActionError('');
    setModalConfig((current) => ({ ...current, isOpen: false }));
  };

  const handleSaveTransaction = async (data) => {
    setActionLoading(true);
    setActionError('');
    setSuccessMessage('');
    try {
      if (modalConfig.mode === 'edit') {
        await financeService.updateTransaction(modalConfig.data.id, data);
        setSuccessMessage(`Transaksi berhasil diperbarui: Nominal pengeluaran kini ${formatRupiah(data.nominal)}.`);
      } else {
        await financeService.createTransaction(data);
        const prefix = data.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
        setSuccessMessage(`${prefix} ${formatRupiah(data.nominal)} berhasil dicatat.`);
      }

      setModalConfig((current) => ({ ...current, isOpen: false }));
      await loadTransactions();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!modalConfig.data) return;
    setActionLoading(true);
    setActionError('');
    setSuccessMessage('');
    try {
      await financeService.softDeleteTransaction(modalConfig.data.id);
      const nominal = modalConfig.data.nominal ? formatRupiah(modalConfig.data.nominal) : '';
      setSuccessMessage(`Pengeluaran ${nominal} berhasil dihapus dari buku kas.`);
      setModalConfig((current) => ({ ...current, isOpen: false }));
      await loadTransactions();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Kalkulasi Footer Ringkasan
  const totalPemasukan = useMemo(() => {
    return transactions
      .filter((t) => t.jenis === 'pemasukan')
      .reduce((acc, curr) => acc + (curr.nominal || 0), 0);
  }, [transactions]);

  const totalPengeluaran = useMemo(() => {
    return transactions
      .filter((t) => t.jenis === 'pengeluaran')
      .reduce((acc, curr) => acc + (curr.nominal || 0), 0);
  }, [transactions]);

  const selisihPeriode = totalPemasukan - totalPengeluaran;

  const saldoKumulatif = useMemo(() => {
    if (transactions.length > 0) {
      const last = transactions[transactions.length - 1];
      if (Number.isFinite(Number(last.saldoBerjalan))) {
        return Number(last.saldoBerjalan);
      }
    }
    const prior = priorBalance !== null ? priorBalance : 0;
    return prior + selisihPeriode;
  }, [transactions, priorBalance, selisihPeriode]);

  return (
    <div className="space-y-6">
      {/* Header Halaman Sesuai Figma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-lexend">
            Transaksi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pemasukan, pengeluaran, dan saldo berjalan.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#17362f] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#112a24] transition-colors"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Catat Transaksi
        </button>
      </div>

      {/* Success Banner Sesuai Figma */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-[#d1fae5] bg-[#edf8f2] px-4 py-3 text-xs text-[#1e6b48]"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#1e6b48] text-[#1e6b48] text-[10px] font-bold">
              ✓
            </span>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="rounded p-0.5 text-[#1e6b48] hover:bg-[#d1fae5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {pageError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {pageError}
          </span>
          <button
            type="button"
            onClick={loadTransactions}
            disabled={loading}
            className="rounded-lg border border-red-300 bg-white px-3 py-1 font-medium hover:bg-red-50 disabled:opacity-50"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Container Tabel Utama (Card Putih Berborder) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Filter Bar Atas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-800 shadow-2xs outline-none hover:border-slate-400 focus:border-[#17362f]"
              >
                <option value="2026-10">Oktober 2026</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-11">November 2026</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            <span className="rounded-md bg-[#eaf5ef] px-2.5 py-1 text-xs font-semibold text-[#1e6b48]">
              Periode Aktif
            </span>
          </div>

          <div className="text-xs text-slate-500">
            Saldo tercatat sebelum periode:{' '}
            <span className="font-semibold text-slate-800">
              {priorBalance === null ? 'Belum tersedia' : formatRupiah(priorBalance)}
            </span>
          </div>
        </div>

        {/* Tabel Transaksi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-white text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th scope="col" className="px-5 py-4">TANGGAL</th>
                <th scope="col" className="px-5 py-4">KETERANGAN</th>
                <th scope="col" className="px-5 py-4">KATEGORI</th>
                <th scope="col" className="px-5 py-4 text-center">DEBIT / PEMASUKAN</th>
                <th scope="col" className="px-5 py-4 text-center">KREDIT / PENGELUARAN</th>
                <th scope="col" className="px-5 py-4 text-right">SALDO BERJALAN</th>
                <th scope="col" className="px-5 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-14 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin text-[#17362f]" />
                      Memuat transaksi...
                    </span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-14 text-center text-slate-400">
                    Belum ada transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const isIncome = transaction.jenis === 'pemasukan';
                  const amount = Number.isFinite(transaction.nominal)
                    ? formatRupiah(transaction.nominal)
                    : '—';
                  return (
                    <tr
                      key={transaction.id}
                      className="text-slate-700 hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700 font-medium">
                        {formatDate(transaction.tanggal)}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 max-w-xs">
                        {transaction.keterangan || '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {transaction.namaKategori}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        {isIncome ? (
                          <span className="font-semibold text-[#1e6b48]">
                            + {amount}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        {!isIncome ? (
                          <span className="font-semibold text-rose-600">
                            - {amount}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                        {transaction.saldoBerjalan === null ||
                        transaction.saldoBerjalan === undefined ||
                        !Number.isFinite(Number(transaction.saldoBerjalan))
                          ? '—'
                          : formatRupiah(transaction.saldoBerjalan)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(transaction)}
                            className="font-medium text-slate-800 hover:text-black"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(transaction)}
                            className="font-medium text-rose-600 hover:text-rose-800"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Kotak Ringkasan Terpisah Sesuai Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pemasukan */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Total pemasukan</span>
          <span className="text-lg font-bold text-slate-900 mt-3 text-right">
            {formatRupiah(totalPemasukan)}
          </span>
        </div>

        {/* Total Pengeluaran */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Total pengeluaran</span>
          <span className="text-lg font-bold text-slate-900 mt-3 text-right">
            {formatRupiah(totalPengeluaran)}
          </span>
        </div>

        {/* Selisih Periode */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Selisih periode</span>
          <span className="text-lg font-bold text-slate-900 mt-3 text-right">
            {formatRupiah(selisihPeriode)}
          </span>
        </div>

        {/* Saldo Kumulatif (Highlight Hijau Lembut) */}
        <div className="rounded-2xl border border-[#d6e7df] bg-[#edf6f2] p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-600 font-medium">Saldo kumulatif</span>
          <span className="text-lg font-bold text-[#17362f] mt-3 text-right">
            {formatRupiah(saldoKumulatif)}
          </span>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <p className="text-[11px] text-slate-400 mt-2">
        Bukan saldo bank. Saldo tidak menghitung transaksi yang dihapus.
      </p>

      {/* Modals Form & Dialogs */}
      <TransactionModals
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        data={modalConfig.data}
        categories={categories}
        priorBalance={priorBalance}
        currentCumulativeBalance={saldoKumulatif}
        loading={actionLoading}
        error={actionError}
        onClose={closeModal}
        onSubmit={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
};
export default TransactionsPage;
