import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import {
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react';

const INITIAL_TASKS = [
  {
    id: 1,
    judul: 'Implementasi halaman laporan',
    peserta: 'Raka Aditya',
    email: 'raka@metro.demo',
    tenggat: '22 Okt 2026',
    rawTenggat: '2026-10-22',
    tenggatFormatted: '22 Oktober 2026',
    status: 'Dikerjakan',
    isTerlambat: false,
    deskripsi:
      'Buat halaman laporan operasional sesuai rancangan dan pastikan tampilan responsif.',
    catatanProgres: 'Tabel utama selesai, lanjut validasi filter.',
  },
  {
    id: 2,
    judul: 'Audit komponen formulir',
    peserta: 'Raka Aditya',
    email: 'raka@metro.demo',
    tenggat: '18 Okt 2026',
    rawTenggat: '2026-10-18',
    tenggatFormatted: '18 Oktober 2026',
    status: 'Belum Dikerjakan',
    isTerlambat: true,
    deskripsi:
      'Periksa label, validasi, dan urutan keyboard pada formulir utama.',
    catatanProgres: 'Belum ada pembaruan.',
  },
  {
    id: 3,
    judul: 'Dokumentasi API internal',
    peserta: 'Salsa Maharani',
    email: 'salsa@metro.demo',
    tenggat: '25 Okt 2026',
    rawTenggat: '2026-10-25',
    tenggatFormatted: '25 Oktober 2026',
    status: 'Dikerjakan',
    isTerlambat: false,
    deskripsi:
      'Lengkapi dokumentasi endpoint absensi dan logbook menggunakan Swagger.',
    catatanProgres: 'Endpoint absensi sudah tercakup.',
  },
];

export const InternTasksPage = () => {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('metrohub_tasks');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TASKS;
  });

  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState(null);
  const [modalStatus, setModalStatus] = useState('Dikerjakan');
  const [modalCatatan, setModalCatatan] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('metrohub_tasks', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  const rakaTasks = tasks.filter((t) => t.peserta === 'Raka Aditya');

  const filteredTasks = rakaTasks;

  const handleOpenUpdate = (task) => {
    setSelectedTaskToUpdate(task);
    setModalStatus(task.status);
    setModalCatatan(task.catatanProgres || '');
  };

  const handleSaveUpdate = (e) => {
    e.preventDefault();
    if (!selectedTaskToUpdate) return;

    const updatedTasks = tasks.map((t) => {
      if (t.id === selectedTaskToUpdate.id) {
        return {
          ...t,
          status: modalStatus,
          catatanProgres: modalCatatan.trim() || 'Belum ada pembaruan.',
          isTerlambat: modalStatus === 'Selesai' ? false : t.isTerlambat,
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    setSelectedTaskToUpdate(null);

    showToast({
      title: 'Pembaruan tugas tersimpan',
      message: 'Status dan catatan terbaru telah diperbarui.',
    });
  };

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Header Halaman Sesuai Figma M-04 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
          Tugas Saya
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-source-sans">
          {rakaTasks.filter((t) => t.status !== 'Selesai').length} tugas aktif · Masa magang berakhir 31 Desember 2026 (72 hari lagi).
        </p>
      </div>

      {/* Daftar Kartu Tugas */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 font-lexend">
              Tidak ada tugas dalam kategori ini
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-slate-200 p-6 md:p-7 shadow-2xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Baris Atas: Badge Terlambat (jika ada) dan Badge Status */}
              <div>
                {task.isTerlambat && task.status !== 'Selesai' && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] mb-2 font-source-sans">
                    Terlambat
                  </span>
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900 font-lexend">
                    {task.judul}
                  </h3>

                  {/* Badge Status Tugas */}
                  <div className="self-start sm:self-auto shrink-0">
                    {task.status === 'Selesai' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4] font-source-sans">
                        Selesai
                      </span>
                    ) : task.status === 'Dikerjakan' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e7f5ec] text-[#176a43] border border-[#c6e9d4] font-source-sans">
                        Dikerjakan
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 font-source-sans">
                        Belum Dikerjakan
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Deskripsi Tugas */}
              <p className="text-sm text-slate-600 leading-relaxed font-source-sans">
                {task.deskripsi}
              </p>

              {/* Meta Informasi: Tenggat & Catatan Progres */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-source-sans pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tenggat {task.tenggat}</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <div className="text-slate-500">
                  <span className="font-medium text-slate-600">Catatan:</span> {task.catatanProgres || 'Belum ada pembaruan.'}
                </div>
              </div>

              {/* Tombol Aksi: Lihat dan Perbarui */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenUpdate(task)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:scale-[0.99] text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                >
                  Lihat dan Perbarui
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL F09: Perbarui Tugas (Sesuai Figma M-04 Form & Hasil) */}
      {/* ======================================================== */}
      {selectedTaskToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-lexend">
                  Perbarui Tugas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-source-sans">
                  Raka Aditya
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskToUpdate(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveUpdate} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Judul Tugas (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Judul tugas
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedTaskToUpdate.judul}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed select-text font-source-sans"
                />
              </div>

              {/* Deskripsi (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  readOnly
                  value={selectedTaskToUpdate.deskripsi}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 leading-relaxed cursor-not-allowed select-text font-source-sans"
                />
              </div>

              {/* Tenggat (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Tenggat
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedTaskToUpdate.tenggatFormatted || selectedTaskToUpdate.tenggat}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 cursor-not-allowed select-text font-source-sans"
                />
              </div>

              {/* Pilihan Status Tugas (Radio Pill Options Sesuai Figma F09) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 font-source-sans">
                  Status tugas
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: 'Belum Dikerjakan', value: 'Belum Dikerjakan' },
                    { label: 'Dikerjakan', value: 'Dikerjakan' },
                    { label: 'Selesai', value: 'Selesai' },
                  ].map((option) => {
                    const isSelected = modalStatus === option.value;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => setModalStatus(option.value)}
                        className={
                          'px-3 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer font-source-sans ' +
                          (isSelected
                            ? 'border-[#17362f] bg-[#e7f5ec]/40 text-[#17362f] ring-1 ring-[#17362f]'
                            : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700')
                        }
                      >
                        <div
                          className={
                            'w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ' +
                            (isSelected
                              ? 'border-[#17362f] bg-[#17362f]'
                              : 'border-slate-400 bg-white')
                          }
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Catatan Progres */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Catatan progres
                </label>
                <textarea
                  rows={3}
                  value={modalCatatan}
                  onChange={(e) => setModalCatatan(e.target.value)}
                  placeholder="Tambahkan perkembangan pekerjaan..."
                  className="w-full p-3.5 bg-white border border-slate-300 focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] rounded-lg text-sm text-slate-900 leading-relaxed font-source-sans transition"
                />
                <p className="text-[11px] text-slate-400 font-source-sans mt-1">
                  Opsional. Tambahkan perkembangan pekerjaan bila diperlukan.
                </p>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedTaskToUpdate(null)}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition active:scale-[0.99] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17362f] hover:bg-[#122b25] text-white rounded-lg text-xs font-semibold shadow-xs transition active:scale-[0.99] cursor-pointer"
                >
                  Simpan Pembaruan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
