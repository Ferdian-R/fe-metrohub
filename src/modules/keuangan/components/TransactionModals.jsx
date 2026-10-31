import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, LoaderCircle, X } from 'lucide-react';

const EMPTY_FORM = {
  tanggal: '',
  jenis: 'pemasukan',
  category_id: '',
  nominal: '',
  keterangan: '',
};

const getCategoryStatus = (category) => {
  const status = category.aktif ?? category.is_active ?? category.active;
  return status === true || status === 1 || status === '1' || status === 'true' || status === 'aktif' || status === 'active';
};

const TransactionModals = ({
  isOpen,
  mode,
  data,
  categories = [],
  loading = false,
  error = '',
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen || mode === 'delete') return;
    setFormError('');
    setForm({
      tanggal: String(data?.tanggal ?? data?.date ?? '').slice(0, 10),
      jenis: String(data?.jenis ?? data?.type ?? 'pemasukan').toLocaleLowerCase('id-ID'),
      category_id: String(
        data?.category_id ?? data?.kategori_id ?? data?.category?.id ?? data?.kategori?.id ?? ''
      ),
      nominal: data?.nominal ?? data?.amount ?? '',
      keterangan: data?.keterangan ?? data?.description ?? '',
    });
  }, [isOpen, mode, data]);

  const availableCategories = useMemo(
    () =>
      categories.filter((category) => {
        const categoryType = String(category.jenis ?? category.type ?? '').toLocaleLowerCase('id-ID');
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
  const title =
    mode === 'create'
      ? 'Catat Transaksi'
      : mode === 'edit'
        ? 'Ubah Transaksi'
        : 'Hapus Transaksi';

  const handleSubmit = (event) => {
    event.preventDefault();
    const nominal = Number(form.nominal);
    if (!form.tanggal || !form.category_id || !form.keterangan.trim()) {
      setFormError('Tanggal, kategori, dan keterangan wajib diisi.');
      return;
    }
    if (!Number.isInteger(nominal) || nominal <= 0) {
      setFormError('Nominal harus berupa bilangan bulat lebih besar dari 0.');
      return;
    }
    setFormError('');

    onSubmit({
      tanggal: form.tanggal,
      jenis: form.jenis,
      category_id: form.category_id,
      nominal,
      keterangan: form.keterangan.trim(),
    });
  };

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 id="transaction-modal-title" className="text-lg font-bold text-slate-900">
              {title}
            </h2>
            {isDelete && (
              <p className="mt-1 text-sm text-slate-500">
                Transaksi akan dihapus dari buku kas, tetapi tetap tersimpan sebagai data terhapus.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div role="alert" className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {formError && !isDelete && (
          <div role="alert" className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        {isDelete ? (
          <div className="p-5">
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Yakin ingin menghapus transaksi <strong>{data?.keterangan || data?.description || 'ini'}</strong>?
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {loading ? 'Menghapus...' : 'Hapus Transaksi'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Tanggal
                <input
                  type="date"
                  required
                  value={form.tanggal}
                  onChange={(event) => updateForm('tanggal', event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Jenis
                <select
                  value={form.jenis}
                  onChange={(event) => {
                    updateForm('jenis', event.target.value);
                    updateForm('category_id', '');
                  }}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                >
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Kategori
              <select
                required
                value={form.category_id}
                onChange={(event) => updateForm('category_id', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
              >
                <option value="">Pilih kategori</option>
                {availableCategories.map((category) => {
                  const categoryId = category.id ?? category.category_id;
                  return (
                    <option key={categoryId} value={categoryId}>
                      {category.nama ?? category.name}
                    </option>
                  );
                })}
              </select>
              {availableCategories.length === 0 && (
                <span className="mt-1 block text-xs text-amber-700">
                  Tidak ada kategori aktif untuk jenis transaksi ini.
                </span>
              )}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Nominal
              <input
                type="number"
                min="1"
                step="1"
                required
                value={form.nominal}
                onChange={(event) => updateForm('nominal', event.target.value)}
                placeholder="Contoh: 1500000"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Masukkan angka bulat lebih besar dari 0.
              </span>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Keterangan
              <textarea
                required
                maxLength={500}
                rows={3}
                value={form.keterangan}
                onChange={(event) => updateForm('keterangan', event.target.value)}
                placeholder="Tuliskan keterangan transaksi"
                className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
              />
            </label>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || availableCategories.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {loading ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default TransactionModals;