import React, { useState, useEffect } from 'react';
import { magangService } from '../services/magangService';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Save,
} from 'lucide-react';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [progressStatus, setProgressStatus] = useState('Dikerjakan');
  const [progressNotes, setProgressNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await magangService.getMyTasks();
      setTasks(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setProgressStatus(task.status || 'Dikerjakan');
    setProgressNotes(task.catatan_progres || '');
    setMsg('');
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);
    setMsg('');

    try {
      await magangService.updateTaskProgress(selectedTask.id, {
        status: progressStatus,
        catatan_progres: progressNotes,
      });
      setMsg('Progres tugas berhasil diperbarui!');
      await fetchTasks();
      setTimeout(() => setSelectedTask(null), 800);
    } catch (err) {
      setMsg(err.message || 'Gagal memperbarui progres.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Daftar Tugas Saya</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau tenggat waktu pekerjaan dan laporkan progres tugas yang diberikan oleh pembimbing/admin.
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">Belum Ada Tugas</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Pembimbing magang belum memberikan penugasan baru. Anda dapat fokus pada kegiatan hari ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const isLate = task.terlambat || (task.status !== 'Selesai' && new Date(task.tenggat) < new Date());
            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        task.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-700'
                          : task.status === 'Dikerjakan'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.status}
                    </span>

                    {isLate && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Terlambat
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-800 text-sm">{task.judul}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3">{task.deskripsi || 'Tidak ada deskripsi rinci.'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tenggat: {new Date(task.tenggat).toLocaleDateString('id-ID')}</span>
                  </div>

                  {task.catatan_progres && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-700 mb-0.5">Catatan Progres:</p>
                      <p>{task.catatan_progres}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => openUpdateModal(task)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition"
                  >
                    Perbarui Status & Progres
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Update Progres */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-slate-800 text-base mb-1">Perbarui Progres Tugas</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedTask.judul}</p>

            {msg && (
              <div className="mb-4 p-3 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-medium">
                {msg}
              </div>
            )}

            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pengerjaan</label>
                <select
                  value={progressStatus}
                  onChange={(e) => setProgressStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                >
                  <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                  <option value="Dikerjakan">Dikerjakan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan / Link Progres</label>
                <textarea
                  rows={4}
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Ceritakan progres pengerjaan atau cantumkan tautan PR / deliverable..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
