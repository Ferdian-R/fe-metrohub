import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../../../context/ToastContext';
import {
  Plus,
  ChevronDown,
  X,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { magangService } from '../services/magangService';

export const AdminTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPesertaId, setSelectedPesertaId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetailTask, setSelectedDetailTask] = useState(null);

  // Form State Beri Tugas
  const [formData, setFormData] = useState({
    intern_id: '',
    judul: '',
    deskripsi: '',
    tenggat: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksRes, internsRes] = await Promise.all([
        magangService.getAllTasks(),
        magangService.getAllInterns(),
      ]);
      setTasks(tasksRes?.data || []);
      setInterns(internsRes?.data || []);
    } catch (err) {
      console.error('Failed to load tasks / interns:', err);
      setError(err?.message || 'Gagal memuat daftar tugas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDateToID = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Open Add Task Modal
  const handleOpenAddModal = () => {
    const defaultInternId = interns.length > 0 ? String(interns[0].id) : '';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    const defaultTenggat = tomorrow.toISOString().split('T')[0];

    setFormData({
      intern_id: defaultInternId,
      judul: '',
      deskripsi: '',
      tenggat: defaultTenggat,
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Handle Submit Beri Tugas
  const handleSubmitTask = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.intern_id) {
      errors.intern_id = 'Pilih anak magang penerima tugas.';
    }
    if (!formData.judul.trim()) {
      errors.judul = 'Judul tugas wajib diisi.';
    } else if (formData.judul.trim().length < 3) {
      errors.judul = 'Judul tugas minimal 3 karakter.';
    }

    if (!formData.deskripsi.trim()) {
      errors.deskripsi = 'Deskripsi tugas wajib diisi.';
    }

    if (!formData.tenggat) {
      errors.tenggat = 'Tenggat waktu wajib ditentukan.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        intern_id: Number(formData.intern_id),
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim(),
        tenggat: formData.tenggat,
      };

      await magangService.createTask(payload);
      setShowAddModal(false);

      const targetIntern = interns.find((i) => i.id === Number(formData.intern_id));
      showToast({
        title: 'Tugas berhasil diberikan',
        message: `${payload.judul} ditambahkan untuk ${targetIntern?.nama || 'peserta'}.`,
      });

      await fetchData();
    } catch (err) {
      console.error('Failed to create task:', err);
      showToast({
        title: 'Gagal memberikan tugas',
        message: err?.message || 'Terjadi kesalahan sistem',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (taskId, judul) => {
    if (!window.confirm(`Hapus tugas "${judul}"?`)) return;

    try {
      await magangService.deleteTask(taskId);
      showToast({
        title: 'Tugas dihapus',
        message: `Tugas "${judul}" berhasil dihapus.`,
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to delete task:', err);
      showToast({
        title: 'Gagal menghapus tugas',
        message: err?.message || 'Terjadi kesalahan',
      });
    }
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        searchTerm.trim() === '' ||
        (task.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.nama_anak_magang || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchPeserta =
        selectedPesertaId === 'all' || String(task.intern_id) === String(selectedPesertaId);

      let matchStatus = true;
      if (selectedStatus === 'SELESAI') {
        matchStatus = task.status === 'SELESAI';
      } else if (selectedStatus === 'DIKERJAKAN') {
        matchStatus = task.status === 'DIKERJAKAN';
      } else if (selectedStatus === 'BELUM_DIKERJAKAN') {
        matchStatus = task.status === 'BELUM_DIKERJAKAN';
      } else if (selectedStatus === 'TERLAMBAT') {
        matchStatus = Boolean(task.terlambat);
      }

      return matchSearch && matchPeserta && matchStatus;
    });
  }, [tasks, searchTerm, selectedPesertaId, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-lexend">
            Penugasan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Beri tugas, tentukan tenggat, dan pantau progres pengerjaan.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto px-4 py-2.5 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs md:text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Beri Tugas</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs md:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul tugas atau nama peserta"
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
            />
          </div>

          <div className="w-full md:w-56 relative">
            <select
              value={selectedPesertaId}
              onChange={(e) => setSelectedPesertaId(e.target.value)}
              className="w-full h-10 pl-3.5 pr-8 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] appearance-none cursor-pointer transition"
            >
              <option value="all">Semua peserta</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.nama}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <div className="w-full md:w-48 relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 pl-3.5 pr-8 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] appearance-none cursor-pointer transition"
            >
              <option value="all">Semua status</option>
              <option value="BELUM_DIKERJAKAN">Belum Dikerjakan</option>
              <option value="DIKERJAKAN">Dikerjakan</option>
              <option value="SELESAI">Selesai</option>
              <option value="TERLAMBAT">Terlambat</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Data Penugasan */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Judul Tugas</th>
                <th className="px-5 py-4 font-semibold">Peserta</th>
                <th className="px-5 py-4 font-semibold">Tenggat</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#17362f] mb-2" />
                    <span>Memuat daftar tugas...</span>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    Belum ada tugas yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isSelesai = task.status === 'SELESAI';
                  const isTerlambat = Boolean(task.terlambat);

                  let statusBadgeClass = 'bg-slate-100 text-slate-600 border border-slate-200';
                  let statusLabel = 'Belum Dikerjakan';

                  if (isSelesai) {
                    statusBadgeClass = 'bg-[#e7f5ec] text-[#206941] border border-[#c6e9d4]';
                    statusLabel = 'Selesai';
                  } else if (isTerlambat) {
                    statusBadgeClass = 'bg-[#fef2f2] text-[#b91c1c] border border-rose-200';
                    statusLabel = 'Terlambat';
                  } else if (task.status === 'DIKERJAKAN') {
                    statusBadgeClass = 'bg-[#fef9c3] text-[#854d0e] border border-amber-200';
                    statusLabel = 'Dikerjakan';
                  }

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailTask(task)}
                          className="font-bold text-slate-900 hover:text-[#17362f] hover:underline text-left block leading-snug"
                        >
                          {task.judul}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {task.nama_anak_magang || `ID Intern #${task.intern_id}`}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {formatDateToID(task.tenggat)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadgeClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailTask(task)}
                            className="text-xs text-[#17362f] hover:underline font-semibold"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id, task.judul)}
                            className="text-xs text-rose-600 hover:text-rose-800 transition p-1"
                            title="Hapus Tugas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {filteredTasks.length} tugas</span>
          <span>1 dari 1 halaman</span>
        </div>
      </div>

      {/* MODAL BERI TUGAS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold text-slate-900 font-lexend">
                Beri Tugas
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penerima tugas
                </label>
                <div className="relative">
                  <select
                    value={formData.intern_id}
                    onChange={(e) => setFormData({ ...formData, intern_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#17362f] appearance-none"
                  >
                    <option value="" disabled>Pilih peserta magang</option>
                    {interns.map((intern) => (
                      <option key={intern.id} value={intern.id}>
                        {intern.nama} ({intern.email})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {formErrors.intern_id && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.intern_id}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul tugas
                </label>
                <input
                  type="text"
                  required
                  value={formData.judul}
                  onChange={(e) => {
                    setFormData({ ...formData, judul: e.target.value });
                    if (formErrors.judul) setFormErrors({ ...formErrors, judul: null });
                  }}
                  placeholder="Contoh: Implementasi halaman laporan"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs md:text-sm text-slate-900 focus:outline-none ${
                    formErrors.judul
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-1 focus:ring-[#17362f]'
                  }`}
                />
                {formErrors.judul && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.judul}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi tugas
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.deskripsi}
                  onChange={(e) => {
                    setFormData({ ...formData, deskripsi: e.target.value });
                    if (formErrors.deskripsi) setFormErrors({ ...formErrors, deskripsi: null });
                  }}
                  placeholder="Rincikan instruksi atau kriteria pengerjaan..."
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs md:text-sm text-slate-900 focus:outline-none resize-none ${
                    formErrors.deskripsi
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-1 focus:ring-[#17362f]'
                  }`}
                />
                {formErrors.deskripsi && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.deskripsi}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenggat waktu
                </label>
                <input
                  type="date"
                  required
                  value={formData.tenggat}
                  onChange={(e) => {
                    setFormData({ ...formData, tenggat: e.target.value });
                    if (formErrors.tenggat) setFormErrors({ ...formErrors, tenggat: null });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs md:text-sm text-slate-900 focus:outline-none ${
                    formErrors.tenggat
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-1 focus:ring-[#17362f]'
                  }`}
                />
                {formErrors.tenggat && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.tenggat}</p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Beri Tugas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL TUGAS */}
      {selectedDetailTask && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#17362f] uppercase tracking-wider">
                  Detail Tugas
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {selectedDetailTask.judul}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailTask(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Penerima:</span>
                <span className="font-semibold text-slate-800">
                  {selectedDetailTask.nama_anak_magang || `Peserta #${selectedDetailTask.intern_id}`}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Tenggat:</span>
                <span className="font-semibold text-slate-800">
                  {formatDateLong(selectedDetailTask.tenggat)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-slate-800">
                  {selectedDetailTask.status === 'SELESAI' ? 'Selesai' : selectedDetailTask.terlambat ? 'Terlambat' : selectedDetailTask.status === 'DIKERJAKAN' ? 'Dikerjakan' : 'Belum Dikerjakan'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Deskripsi:</span>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-wrap">
                  {selectedDetailTask.deskripsi}
                </div>
              </div>

              {selectedDetailTask.catatan_progres && (
                <div>
                  <span className="text-slate-400 block mb-1">Catatan Progres Anak Magang:</span>
                  <div className="p-3 bg-[#eef6f2] rounded-lg text-[#17362f] leading-relaxed border border-[#d2e7dc]">
                    {selectedDetailTask.catatan_progres}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailTask(null)}
                className="px-4 py-2 bg-[#17362f] text-white text-xs font-semibold rounded-lg hover:bg-[#122b25] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasksPage;
