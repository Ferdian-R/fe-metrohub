import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CalendarDays, LoaderCircle, Plus, X } from 'lucide-react';
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
  const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateValue || '—';
  return `${match[3]}/${match[2]}/${match[1]}`;
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
        setSuccessMessage('Transaksi berhasil diperbarui.');
      } else {
        await financeService.createTransaction(data);
        setSuccessMessage('Transaksi berhasil dicatat.');
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
      setSuccessMessage('Transaksi berhasil dihapus.');
      setModalConfig((current) => ({ ...current, isOpen: false }));
      await loadTransactions();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transaksi</h1>
            <p className="mt-1 text-sm text-slate-500">
              Pemasukan, pengeluaran, dan saldo berjalan
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white shadow-sm hover:bg-emerald-900"
          >
            <Plus className="h-4 w-4" />
            Catat Transaksi
          </button>
        </header>

        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <span className="font-medium">{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              aria-label="Tutup notifikasi"
              className="rounded p-0.5 text-emerald-700 hover:bg-emerald-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {pageError && (
          <div
            role="alert"
            className="mb-4 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="inline-flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {pageError}
            </span>
            <button
              type="button"
              onClick={loadTransactions}
              disabled={loading}
              className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 disabled:opacity-50"
            >
              Coba lagi
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="transaction-period" className="sr-only">
                Filter periode
              </label>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                Periode
              </span>
              <input
                id="transaction-period"
                type="month"
                value={period}
                onChange={(event) => {
                  if (event.target.value) setPeriod(event.target.value);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
              />
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                Periode Aktif
              </span>
            </div>
            <p className="text-sm text-slate-600 lg:text-right">
              Saldo tercatat sebelum periode:{' '}
              <span className="font-bold text-slate-900">
                {priorBalance === null ? 'Belum tersedia' : formatRupiah(priorBalance)}
              </span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-3.5">Tanggal</th>
                  <th scope="col" className="px-4 py-3.5">Keterangan</th>
                  <th scope="col" className="px-4 py-3.5">Kategori</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Debit / Pemasukan</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Kredit / Pengeluaran</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Saldo Berjalan</th>
                  <th scope="col" className="px-4 py-3.5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-14 text-center text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Memuat transaksi...
                      </span>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-14 text-center text-sm text-slate-500">
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
                      <tr key={transaction.id} className="text-sm text-slate-700 hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                          {formatDate(transaction.tanggal)}
                        </td>
                        <td className="max-w-sm px-4 py-4 font-medium text-slate-900">
                          <span className="line-clamp-2">{transaction.keterangan || '—'}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{transaction.namaKategori}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          {isIncome ? (
                            <span className="font-semibold text-green-700">+ {amount}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          {!isIncome ? (
                            <span className="font-semibold text-red-700">- {amount}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-slate-900">
                          {transaction.saldoBerjalan === null ||
                          transaction.saldoBerjalan === undefined ||
                          !Number.isFinite(Number(transaction.saldoBerjalan))
                            ? '—'
                            : formatRupiah(transaction.saldoBerjalan)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(transaction)}
                              className="font-medium text-emerald-800 hover:underline"
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(transaction)}
                              className="font-medium text-red-700 hover:underline"
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
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            {loading ? 'Memuat data...' : `${transactions.length} transaksi pada periode ini`}
          </div>
        </section>
      </div>

      <TransactionModals
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        data={modalConfig.data}
        categories={categories}
        loading={actionLoading}
        error={actionError}
        onClose={closeModal}
        onSubmit={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
      />
    </main>
  );
};
