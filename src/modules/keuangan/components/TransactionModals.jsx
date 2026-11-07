import { useEffect, useMemo, useState } from 'react';
import { Check, LoaderCircle, Trash2, X, ArrowUpRight, ArrowDownLeft, Info } from 'lucide-react';
import { formatRupiah, getTodayWIB } from '../services/financeService';

const EMPTY_FORM = {
  tanggal: '',
  jenis: 'pemasukan',
  category_id: '',
  nominal: '',
  keterangan: '',
};

const getCategoryStatus = (category) => {
  const status = category.aktif ?? category.is_active ?? category.active;
  return (
    status === true ||
    status === 1 ||
    status === '1' ||
    status === 'true' ||
    status === 'aktif' ||
    status === 'active'
  );
};

const TransactionModals = ({
  isOpen,
  mode,
  data,
  categories = [],
  currentCumulativeBalance = 0,
  loading = false,
  error = '',
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowDiscardConfirm(false);
      return;
    }
    setFormError('');
    setShowDiscardConfirm(false);

    if (mode === 'delete') return;

    if (mode === 'edit' && data) {
      setForm({
        tanggal: String(data?.tanggal ?? data?.date ?? getTodayWIB()).slice(0, 10),
        jenis: String(data?.jenis ?? data?.type ?? 'pengeluaran').toLocaleLowerCase('id-ID'),
        category_id: String(
          data?.category_id ?? data?.kategori_id ?? data?.category?.id ?? data?.kategori?.id ?? ''
        ),
        nominal: data?.nominal ?? data?.amount ?? '',
        keterangan: data?.keterangan ?? data?.description ?? '',
      });
    } else {
      // Transaksi baru: tanggal default hari ini (WIB)
      setForm({
        tanggal: getTodayWIB(),
        jenis: 'pemasukan',
        category_id: '',
        nominal: '',
        keterangan: '',
      });
    }
  }, [isOpen, mode, data]);

  const availableCategories = useMemo(
    () =>
      categories.filter((category) => {
        const categoryType = String(
          category.jenis ?? category.type ?? ''
        ).toLocaleLowerCase('id-ID');
        const categoryId = String(category.id ?? category.category_id ?? '');
        return (
          categoryType === form.jenis &&
          (getCategoryStatus(category) || categoryId === form.category_id)
        );
      }),
    [categories, form.category_id, form.jenis]
  );

  if (!isOpen) return null;

  const isDelete = mode === 'delete';
  const isEdit = mode === 'edit';
  const parsedNominal = Number(form.nominal) || 0;

  // Cek apakah ada perubahan data untuk konfirmasi batal
  const hasChanges = () => {
    if (isEdit && data) {
      return (
        Number(data.nominal) !== parsedNominal ||
        data.keterangan !== form.keterangan ||
        data.jenis !== form.jenis
      );
    }
    return Boolean(form.nominal || form.keterangan || form.category_id);
  };

  const handleRequestClose = () => {
    if (loading) return;
    if (hasChanges() && !isDelete && !showDiscardConfirm) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.tanggal || !form.category_id || !form.keterangan.trim()) {
      setFormError('Tanggal, kategori, dan keterangan wajib diisi.');
      return;
    }
    if (!Number.isInteger(parsedNominal) || parsedNominal <= 0) {
      setFormError('Nominal harus lebih besar dari Rp0.');
      return;
    }
    setFormError('');

    onSubmit({
      tanggal: form.tanggal,
      jenis: form.jenis,
      category_id: form.category_id,
      nominal: parsedNominal,
      keterangan: form.keterangan.trim(),
    });
  };

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleTypeChange = (newType) => {
    if (form.jenis === newType) return;
    setForm((current) => ({
      ...current,
      jenis: newType,
      category_id: '', // reset kategori karena jenis berbeda sesuai instruksi Figma
    }));
  };

  // Kalkulasi estimasi saldo setelah hapus (untuk modal hapus)
  const deleteNominal = Number(data?.nominal || 0);
  const isDeleteIncome = data?.jenis === 'pemasukan';
  const balanceBeforeDelete = Number(currentCumulativeBalance || 0);
  const balanceAfterDelete = isDeleteIncome
    ? balanceBeforeDelete - deleteNominal
    : balanceBeforeDelete + deleteNominal;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px] transition-all"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleRequestClose();
      }}
    >
      {/* Pop-up konfirmasi perubahan belum disimpan */}
      {showDiscardConfirm ? (
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
            <Info className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Buang perubahan?</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Perubahan pada transaksi belum disimpan. Lanjutkan mengedit atau buang perubahan untuk menutup form.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowDiscardConfirm(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Lanjutkan Mengedit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Buang Perubahan
            </button>
          </div>
        </div>
      ) : isDelete ? (
        /* Dialog Hapus Transaksi Sesuai Figma F-13 */
        <section
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-bold text-slate-900">Hapus Transaksi?</h2>
            <p className="mt-1 text-xs text-slate-500">
              Transaksi berikut akan dihapus dari perhitungan buku kas. Pastikan detailnya sudah benar.
            </p>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Ringkasan Item yang akan Dihapus */}
          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Tanggal transaksi</span>
              <span className="font-semibold text-slate-900">{data?.tanggal?.slice(0, 10) || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Jenis transaksi</span>
              <span className="font-semibold text-slate-900 capitalize">{data?.jenis || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Kategori</span>
              <span className="font-semibold text-slate-900">{data?.namaKategori || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Nominal</span>
              <span className="font-semibold text-slate-900">{formatRupiah(data?.nominal || 0)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Keterangan</span>
              <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">
                {data?.keterangan || '—'}
              </span>
            </div>
          </div>

          {/* Indikator Dampak Saldo */}
          <div className="mt-4 rounded-xl border border-emerald-100 bg-[#eef8f3] p-3 text-xs">
            <span className="text-slate-500 block text-[11px]">Saldo setelah penghapusan dihitung:</span>
            <div className="mt-1 flex items-center gap-2 font-bold text-[#14663e]">
              <span>{formatRupiah(balanceBeforeDelete)}</span>
              <span>→</span>
              <span>{formatRupiah(balanceAfterDelete)}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {loading ? 'Menghapus...' : 'Hapus Transaksi'}
            </button>
          </div>
        </section>
      ) : (
        /* Modal Catat / Ubah Transaksi Sesuai Figma F-10, F-11, F-12 */
        <section
          role="dialog"
          aria-modal="true"
          className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in"
        >
          {/* Header Modal */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEdit
                  ? 'Ubah Transaksi'
                  : form.jenis === 'pemasukan'
                  ? 'Catat Pemasukan'
                  : 'Catat Pengeluaran'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {isEdit
                  ? 'Perbarui transaksi yang sudah tercatat.'
                  : 'Lengkapi detail transaksi untuk memperbarui buku kas.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={loading}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {formError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Toggle Jenis Transaksi */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Jenis transaksi
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-1 border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => handleTypeChange('pemasukan')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                    form.jenis === 'pemasukan'
                      ? 'bg-white text-[#0e3a2f] shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {form.jenis === 'pemasukan' && <Check className="h-3.5 w-3.5 text-[#0e3a2f]" />}
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('pengeluaran')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                    form.jenis === 'pengeluaran'
                      ? 'bg-white text-[#0e3a2f] shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {form.jenis === 'pengeluaran' && <Check className="h-3.5 w-3.5 text-[#0e3a2f]" />}
                  Pengeluaran
                </button>
              </div>
            </div>

            {/* Tanggal & Kategori */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tanggal transaksi
                </label>
                <input
                  type="date"
                  required
                  value={form.tanggal}
                  onChange={(e) => updateForm('tanggal', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#0e3a2f] focus:ring-1 focus:ring-[#0e3a2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Kategori
                </label>
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => updateForm('category_id', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#0e3a2f] focus:ring-1 focus:ring-[#0e3a2f]"
                >
                  <option value="">Pilih kategori</option>
                  {availableCategories.map((c) => (
                    <option key={c.id ?? c.category_id} value={c.id ?? c.category_id}>
                      {c.nama ?? c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Peringatan Kategori Kosong jika belum ada */}
            {availableCategories.length === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800">
                Belum ada kategori {form.jenis} aktif. Aktifkan atau tambahkan kategori agar transaksi dapat disimpan.
              </div>
            )}

            {/* Input Nominal */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nominal
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-medium text-slate-400">Rp</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.nominal}
                  onChange={(e) => updateForm('nominal', e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#0e3a2f] focus:ring-1 focus:ring-[#0e3a2f]"
                />
              </div>
              <span className="mt-1 block text-[11px] text-slate-400">
                Masukkan angka positif tanpa tanda minus.
              </span>
            </div>

            {/* Input Keterangan */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Keterangan
              </label>
              <textarea
                required
                rows={2}
                value={form.keterangan}
                onChange={(e) => updateForm('keterangan', e.target.value)}
                placeholder="Tambahkan keterangan transaksi"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#0e3a2f] focus:ring-1 focus:ring-[#0e3a2f]"
              />
            </div>

            {/* Banner Dampak Saldo / Edit Info */}
            {isEdit ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-[#eef8f3] p-3 text-[11px] text-[#14663e]">
                <Info className="h-4 w-4 shrink-0 text-emerald-700" />
                <span>
                  Perubahan memperbarui transaksi ini, bukan menambah transaksi baru.
                </span>
              </div>
            ) : parsedNominal > 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-[#eef8f3] p-3 text-[11px] text-[#14663e]">
                {form.jenis === 'pemasukan' ? (
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-emerald-700" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4 shrink-0 text-rose-600" />
                )}
                <span>
                  {form.jenis === 'pemasukan' ? 'Menambah' : 'Mengurangi'} saldo sebesar{' '}
                  <strong className="font-bold">{formatRupiah(parsedNominal)}</strong>
                </span>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleRequestClose}
                disabled={loading}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || availableCategories.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0e3a2f] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#092820] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {loading && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                {loading
                  ? 'Menyimpan...'
                  : isEdit
                  ? 'Simpan Perubahan'
                  : form.jenis === 'pemasukan'
                  ? 'Simpan Pemasukan'
                  : 'Simpan Pengeluaran'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default TransactionModals;
