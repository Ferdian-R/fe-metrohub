import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  LoaderCircle,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { financeService } from '../services/financeService';

const EMPTY_FORM = {
  nama: '',
  jenis: 'pemasukan',
  aktif: true,
};

const getErrorMessage = (error) =>
  error?.message || error?.error || 'Terjadi kesalahan. Silakan coba kembali.';

const getCategoriesFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response?.data?.categories)) return response.data.categories;
  throw new Error('Respons daftar kategori dari server tidak valid.');
};

const getUsageCount = (category) => {
  const usage = [
    category.usage_count,
    category.jumlah_transaksi,
    category.transaction_count,
    category.transactions_count,
    category.jumlah_penggunaan,
    category.usageCount,
  ].find((value) => value !== null && value !== undefined && value !== '');

  if (usage === undefined) return null;
  const count = Number(usage);
  return Number.isFinite(count) && count >= 0 ? count : null;
};

const normalizeCategory = (category) => {
  const rawStatus = category.aktif ?? category.is_active ?? category.active;
  const normalizedStatus =
    typeof rawStatus === 'string' ? rawStatus.toLocaleLowerCase('id-ID') : rawStatus;

  return {
    ...category,
    nama: category.nama ?? category.name ?? '',
    jenis: String(category.jenis ?? category.type ?? '').toLocaleLowerCase('id-ID'),
    aktif:
      normalizedStatus === true ||
      normalizedStatus === 1 ||
      normalizedStatus === '1' ||
      normalizedStatus === 'true' ||
      normalizedStatus === 'aktif' ||
      normalizedStatus === 'active',
    usageCount: getUsageCount(category),
  };
};

const getCategoryId = (category) => category.id ?? category.category_id;

const StatusChoices = ({ value, onChange, disabled = false }) => (
  <div className="grid grid-cols-2 gap-3">
    {[
      { label: 'Aktif', value: true },
      { label: 'Nonaktif', value: false },
    ].map((choice) => (
      <label
        key={choice.label}
        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
          value === choice.value
            ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
            : 'border-slate-200 text-slate-600'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <input
          type="radio"
          name="category-status"
          value={String(choice.value)}
          checked={value === choice.value}
          onChange={() => onChange(choice.value)}
          disabled={disabled}
          className="accent-emerald-800"
        />
        {choice.label}
      </label>
    ))}
  </div>
);

const CategoryModal = ({
  mode,
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
}) => {
  const isEditing = mode === 'edit';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="category-modal-title" className="text-lg font-bold text-slate-900">
              {isEditing ? 'Ubah Kategori' : 'Tambah Kategori'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? 'Perbarui nama atau status kategori.'
                : 'Lengkapi informasi kategori transaksi baru.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Tutup modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="category-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Nama Kategori
            </label>
            <input
              id="category-name"
              type="text"
              autoFocus
              required
              maxLength={100}
              value={form.nama}
              onChange={(event) => setForm((current) => ({ ...current, nama: event.target.value }))}
              placeholder="Contoh: Operasional Kantor"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
            <p className="mt-1 text-xs text-slate-500">Maksimal 100 karakter.</p>
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-slate-700">Jenis Kategori</legend>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Pemasukan', value: 'pemasukan' },
                { label: 'Pengeluaran', value: 'pengeluaran' },
              ].map((choice) => (
                <label
                  key={choice.value}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                    isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  } ${
                    form.jenis === choice.value
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="category-type"
                    value={choice.value}
                    checked={form.jenis === choice.value}
                    onChange={() => setForm((current) => ({ ...current, jenis: choice.value }))}
                    disabled={isEditing}
                    className="accent-emerald-800"
                  />
                  {choice.label}
                </label>
              ))}
            </div>
            {isEditing && (
              <p className="mt-1.5 text-xs text-slate-500">
                Jenis kategori tidak dapat diubah agar relasi transaksi tetap konsisten.
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-slate-700">Status</legend>
            <StatusChoices
              value={form.aktif}
              onChange={(aktif) => setForm((current) => ({ ...current, aktif }))}
              disabled={saving}
            />
          </fieldset>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const CategoryProtectionModal = ({
  category,
  error,
  pending,
  onClose,
  onDeactivate,
  onDelete,
}) => {
  const usageCount = category.usageCount;
  const hasUsage = usageCount > 0;
  const usageUnknown = usageCount === null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-protection-title"
        className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className={`p-5 ${hasUsage || usageUnknown ? 'bg-amber-50' : 'bg-red-50'}`}>
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 rounded-full p-2 ${
                hasUsage || usageUnknown ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 id="category-protection-title" className="font-bold text-slate-900">
                {usageUnknown
                  ? 'Penggunaan kategori belum diketahui'
                  : hasUsage
                    ? 'Kategori sudah digunakan'
                    : 'Hapus kategori?'}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {usageUnknown
                  ? `Jumlah transaksi untuk "${category.nama}" tidak tersedia dari server. Kategori tidak dapat dihapus sebelum jumlah penggunaan diketahui.`
                  : hasUsage
                    ? `Kategori "${category.nama}" digunakan pada ${usageCount} transaksi. Nonaktifkan kategori agar tidak dapat dipilih untuk transaksi baru.`
                    : `Kategori "${category.nama}" belum digunakan dan akan dihapus secara permanen.`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              aria-label="Tutup modal"
              className="rounded-lg p-1 text-slate-400 hover:bg-white/70 hover:text-slate-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            {hasUsage && (
              <button
                type="button"
                onClick={onDeactivate}
                disabled={pending || !category.aktif}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {category.aktif ? 'Nonaktifkan Kategori' : 'Sudah Nonaktif'}
              </button>
            )}
            {usageCount === 0 && (
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {pending ? 'Menghapus...' : 'Hapus Kategori'}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('semua');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [toast, setToast] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await financeService.getCategories();
      setCategories(getCategoriesFromResponse(response).map(normalizeCategory));
      return true;
    } catch (error) {
      setPageError(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!toast) return undefined;
    const timerId = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timerId);
  }, [toast]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('id-ID');
    return categories.filter((category) => {
      const matchesName = category.nama.toLocaleLowerCase('id-ID').includes(normalizedSearch);
      const matchesType = typeFilter === 'semua' || category.jenis === typeFilter;
      const matchesStatus =
        statusFilter === 'semua' ||
        (statusFilter === 'aktif' ? Boolean(category.aktif) : !category.aktif);
      return matchesName && matchesType && matchesStatus;
    });
  }, [categories, search, typeFilter, statusFilter]);

  const showSuccess = (message) => setToast(message);

  const closeModal = () => {
    if (saving) return;
    setModalMode(null);
    setSelectedCategory(null);
    setActionError('');
  };

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setActionError('');
    setModalMode('create');
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setForm({
      nama: category.nama,
      jenis: category.jenis,
      aktif: Boolean(category.aktif),
    });
    setActionError('');
    setModalMode('edit');
  };

  const openProtectionModal = (category) => {
    setSelectedCategory(category);
    setActionError('');
    setModalMode('protect');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const nama = form.nama.trim();
    if (!nama) {
      setActionError('Nama kategori wajib diisi.');
      return;
    }
    if (!['pemasukan', 'pengeluaran'].includes(form.jenis)) {
      setActionError('Pilih jenis kategori yang valid.');
      return;
    }
    const duplicate = categories.some(
      (category) =>
        category.jenis === form.jenis &&
        category.nama.trim().toLocaleLowerCase('id-ID') === nama.toLocaleLowerCase('id-ID') &&
        getCategoryId(category) !== getCategoryId(selectedCategory ?? {})
    );
    if (duplicate) {
      setActionError('Nama kategori dengan jenis tersebut sudah tersedia.');
      return;
    }

    setSaving(true);
    setActionError('');
    try {
      const data = { nama, jenis: form.jenis, aktif: Boolean(form.aktif) };
      if (modalMode === 'edit') {
        await financeService.updateCategory(getCategoryId(selectedCategory), data);
      } else {
        await financeService.createCategory(data);
      }

      setModalMode(null);
      setSelectedCategory(null);
      showSuccess(modalMode === 'edit' ? 'Kategori berhasil diperbarui.' : 'Kategori berhasil ditambahkan.');
      await loadCategories();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleProtectionAction = async (action) => {
    if (!selectedCategory) return;
    setSaving(true);
    setActionError('');
    try {
      if (action === 'deactivate') {
        await financeService.toggleCategoryStatus(getCategoryId(selectedCategory));
        showSuccess('Kategori berhasil dinonaktifkan.');
      } else {
        await financeService.deleteCategory(getCategoryId(selectedCategory));
        showSuccess('Kategori berhasil dihapus.');
      }

      setModalMode(null);
      setSelectedCategory(null);
      await loadCategories();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kategori</h1>
            <p className="mt-1 text-sm text-slate-500">
              Kategori pemasukan dan pengeluaran untuk transaksi baru
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white shadow-sm hover:bg-emerald-900"
          >
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </button>
        </header>

        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            {toast}
          </div>
        )}

        {pageError && (
          <div
            role="alert"
            className="mb-4 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{pageError}</span>
            <button
              type="button"
              onClick={loadCategories}
              disabled={loading}
              className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 disabled:opacity-50"
            >
              Coba lagi
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center">
            <select
              aria-label="Filter jenis"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            >
              <option value="semua">Semua Jenis</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
            <select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <label className="relative md:ml-auto md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama kategori..."
                aria-label="Cari nama kategori"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-5 py-3.5">Nama Kategori</th>
                  <th scope="col" className="px-5 py-3.5">Jenis</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5">Penggunaan</th>
                  <th scope="col" className="px-5 py-3.5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Memuat kategori...
                      </span>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center">
                      <Tag className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                      <p className="text-sm font-medium text-slate-700">Kategori tidak ditemukan</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Coba ubah filter atau tambahkan kategori baru.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={getCategoryId(category)} className="text-sm text-slate-700 hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-medium text-slate-900">{category.nama}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded border px-2 py-0.5 text-xs ${
                            category.jenis === 'pemasukan'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }`}
                        >
                          {category.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            category.aktif
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {category.aktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {category.usageCount === null
                          ? 'Tidak tersedia'
                          : category.usageCount > 0
                            ? `${category.usageCount} transaksi`
                            : 'Belum digunakan'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditModal(category)}
                            className="font-medium text-emerald-800 hover:underline"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => openProtectionModal(category)}
                            className="inline-flex items-center gap-1 font-medium text-red-700 hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus/Nonaktifkan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Menampilkan {loading ? 0 : filteredCategories.length} dari {categories.length} kategori
          </div>
        </section>
      </div>

      {(modalMode === 'create' || modalMode === 'edit') && (
        <CategoryModal
          mode={modalMode}
          form={form}
          setForm={setForm}
          error={actionError}
          saving={saving}
          onClose={closeModal}
          onSubmit={handleSave}
        />
      )}

      {modalMode === 'protect' && selectedCategory && (
        <CategoryProtectionModal
          category={selectedCategory}
          error={actionError}
          pending={saving}
          onClose={closeModal}
          onDeactivate={() => handleProtectionAction('deactivate')}
          onDelete={() => handleProtectionAction('delete')}
        />
      )}
    </main>
  );
};