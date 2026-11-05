import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../context/ToastContext';
import {
  Calendar,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { magangService } from '../services/magangService';

export const InternTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState(null);
  const [modalStatus, setModalStatus] = useState('DIKERJAKAN');
  const [modalCatatan, setModalCatatan] = useState('');
  const { showToast } = useToast();

  const fetchMyTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await magangService.getMyTasks();
      setTasks(res?.data || []);
    } catch (err) {
      console.error('Failed to load my tasks:', err);
      setError(err?.message || 'Gagal memuat tugas saya');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  const handleOpenUpdate = (task) => {
    setSelectedTaskToUpdate(task);
    setModalStatus(task.status || 'BELUM_DIKERJAKAN');
    setModalCatatan(task.catatan_progres || '');
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTaskToUpdate) return;

    try {
      setSubmitting(true);
      const payload = {
        status: modalStatus,
        catatan_progres: modalCatatan.trim(),
      };

      await magangService.updateTaskProgress(selectedTaskToUpdate.id, payload);
      showToast({
        title: 'Progres diperbarui',
        message: `Status tugas "${selectedTaskToUpdate.judul}" berhasil disimpan.`,
      });

      setSelectedTaskToUpdate(null);
      await fetchMyTasks();
    } catch (err) {
      console.error('Failed to update task progress:', err);
      showToast({
        title: 'Gagal memperbarui progres',
        message: err?.message || 'Terjadi kesalahan sistem',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateToID = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
          Tugas Saya
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Penugasan dan status pengerjaan yang dibagikan oleh admin/pembimbing.
        </p>
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
            onClick={fetchMyTasks}
            className="px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Daftar Tugas Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Judul Tugas & Deskripsi</th>
                <th className="px-5 py-4 font-semibold">Tenggat</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#17362f] mb-2" />
                    <span>Memuat tugas Anda...</span>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                    Belum ada penugasan untuk Anda saat ini.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
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
                        <p className="font-bold text-slate-900 leading-snug">
                          {task.judul}
                        </p>
                        <p className="text-slate-500 text-xs mt-1 max-w-lg line-clamp-2">
                          {task.deskripsi}
                        </p>
                        {task.catatan_progres && (
                          <p className="text-[11px] text-[#17362f] font-medium mt-1.5 bg-[#eef6f2] px-2 py-0.5 rounded inline-block">
                            Catatan: {task.catatan_progres}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {formatDateToID(task.tenggat)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadgeClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenUpdate(task)}
                          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
                        >
                          Perbarui Progres
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {tasks.length} tugas</span>
          <span>1 dari 1 halaman</span>
        </div>
      </div>

      {/* MODAL PERBARUI PROGRES */}
      {selectedTaskToUpdate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#17362f] uppercase tracking-wider">
                  Perbarui Progres Tugas
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {selectedTaskToUpdate.judul}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskToUpdate(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status pengerjaan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer text-xs font-semibold transition ${
                      modalStatus === 'BELUM_DIKERJAKAN'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modal_status"
                      value="BELUM_DIKERJAKAN"
                      checked={modalStatus === 'BELUM_DIKERJAKAN'}
                      onChange={() => setModalStatus('BELUM_DIKERJAKAN')}
                      className="sr-only"
                    />
                    <span>Belum Mulai</span>
                  </label>

                  <label
                    className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer text-xs font-semibold transition ${
                      modalStatus === 'DIKERJAKAN'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modal_status"
                      value="DIKERJAKAN"
                      checked={modalStatus === 'DIKERJAKAN'}
                      onChange={() => setModalStatus('DIKERJAKAN')}
                      className="sr-only"
                    />
                    <span>Dikerjakan</span>
                  </label>

                  <label
                    className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer text-xs font-semibold transition ${
                      modalStatus === 'SELESAI'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f]'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modal_status"
                      value="SELESAI"
                      checked={modalStatus === 'SELESAI'}
                      onChange={() => setModalStatus('SELESAI')}
                      className="sr-only"
                    />
                    <span>Selesai</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Progres
                </label>
                <textarea
                  rows={3}
                  value={modalCatatan}
                  onChange={(e) => setModalCatatan(e.target.value)}
                  placeholder="Ceritakan progres terkini pengerjaan tugas ini..."
                  className="w-full p-3 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setSelectedTaskToUpdate(null)}
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
                  <span>Simpan Progres</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternTasksPage;
