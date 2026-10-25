import { useToast } from '../../../context/ToastContext';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  X,
} from 'lucide-react';

export const AdminInternDetailPage = () => {
  const { id } = useParams();

  // Data Peserta (Default Raka Aditya sesuai Figma A-03)
  const [intern, setIntern] = useState({
    id: id || 1,
    nama: 'Raka Aditya',
    email: 'raka@metro.demo',
    kampus: 'Universitas Negeri Yogyakarta',
    tanggal_mulai: '2026-08-01',
    tanggal_selesai: '2026-12-31',
    periodeDisplay: '1 Agustus — 31 Desember 2026',
    sisaHari: 72,
    status_kerja: 'On-site',
    status_periode: 'Aktif',
    status_akun: 'Aktif',
  });

  // State Tabs: 'ringkasan', 'absensi', 'logbook', 'tugas'
  const [activeTab, setActiveTab] = useState('ringkasan');

  // Modal Ubah Status Kerja
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatusKerja, setNewStatusKerja] = useState('Remote');

  // Modal Ubah Data
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nama: intern.nama,
    kampus: intern.kampus,
    email: intern.email,
    tanggal_mulai: intern.tanggal_mulai,
    tanggal_selesai: intern.tanggal_selesai,
  });

  // Banner Notifikasi Skenario Perubahan Status Kerja (Figma A-03 After)
  const { showToast } = useToast();

  // Simpan Perubahan Status Kerja
  const handleSaveStatusKerja = (e) => {
    e.preventDefault();
    setIntern((prev) => ({
      ...prev,
      status_kerja: newStatusKerja,
    }));
    setShowStatusModal(false);
    showToast({
      title: 'Status kerja berhasil diperbarui',
      message: `Status kerja ${intern.nama} diubah menjadi ${selectedStatusKerja}.`,
    });
  };

  // Simpan Ubah Data Peserta
  const handleSaveEditData = (e) => {
    e.preventDefault();
    setIntern((prev) => ({
      ...prev,
      nama: editForm.nama,
      kampus: editForm.kampus,
      email: editForm.email,
      tanggal_mulai: editForm.tanggal_mulai,
      tanggal_selesai: editForm.tanggal_selesai,
    }));
    setShowEditModal(false);
    showToast({
      title: 'Data peserta tersimpan',
      message: `Data ${editForm.nama} berhasil diperbarui.`,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Tombol Kembali ke Data Anak Magang */}
      <Link
        to="/admin/magang/interns"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#17362f] hover:text-[#285f52] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Data Anak Magang</span>
      </Link>

      {/* Notifikasi Umum */}
      

      

      {/* Profil Header Card Sesuai Figma */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-[11px] font-bold text-[#17362f] tracking-wider uppercase">
            PESERTA AKTIF
          </span>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-lexend mt-0.5">
            {intern.nama}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {intern.kampus} · <span className="font-mono text-slate-600">{intern.email}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition"
          >
            Ubah Data
          </button>
          <button
            type="button"
            onClick={() => {
              setNewStatusKerja(intern.status_kerja === 'On-site' ? 'Remote' : 'On-site');
              setShowStatusModal(true);
            }}
            className="px-4 py-2 bg-[#17362f] hover:bg-[#122b25] text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            Ubah Status Kerja
          </button>
        </div>
      </div>

      {/* Navigation Tabs Sesuai Figma */}
      <div className="border-b border-slate-200 flex items-center gap-8 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('ringkasan')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'ringkasan'
              ? 'border-[#17362f] text-[#17362f] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Ringkasan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('absensi')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'absensi'
              ? 'border-[#17362f] text-[#17362f] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Absensi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logbook')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'logbook'
              ? 'border-[#17362f] text-[#17362f] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Logbook
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tugas')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'tugas'
              ? 'border-[#17362f] text-[#17362f] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Tugas
        </button>
      </div>

      {/* Tab Content: Ringkasan Sesuai Figma A-03 */}
      {activeTab === 'ringkasan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card Kiri: Informasi Magang */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-2xs">
            <h3 className="text-base font-semibold text-slate-900 font-lexend mb-5">
              Informasi magang
            </h3>

            <div className="divide-y divide-slate-100 text-xs md:text-sm">
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Asal kampus</span>
                <span className="font-semibold text-slate-800">{intern.kampus}</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Periode</span>
                <span className="font-semibold text-slate-800">{intern.periodeDisplay}</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Sisa masa magang</span>
                <span className="font-semibold text-slate-800">{intern.sisaHari} hari kalender</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Status kerja</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{intern.status_kerja}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewStatusKerja(intern.status_kerja === 'On-site' ? 'Remote' : 'On-site');
                      setShowStatusModal(true);
                    }}
                    className="text-xs text-[#17362f] hover:underline font-semibold"
                  >
                    Ubah
                  </button>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Status periode</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e7f5ec] text-[#206941]">
                  {intern.status_periode}
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500">Status akun</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e7f5ec] text-[#206941]">
                  {intern.status_akun}
                </span>
              </div>
            </div>
          </div>

          {/* Card Kanan: Ringkasan Hari Ini Sesuai Figma */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 font-lexend">
                Ringkasan hari ini
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-6">
                20 Oktober 2026
              </p>

              {/* Step Timeline */}
              <div className="space-y-6">
                {/* 1. Check-in (Selesai: 08.12 WIB) */}
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#e7f5ec] text-[#206941] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-xs md:text-sm text-slate-800">Check-in</p>
                    <p className="text-xs text-slate-400 mt-0.5">08.12 WIB</p>
                  </div>
                </div>

                {/* 2. Logbook (Sudah diisi) */}
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#e7f5ec] text-[#206941] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-xs md:text-sm text-slate-800">Logbook</p>
                    <p className="text-xs text-slate-400 mt-0.5">Sudah diisi</p>
                  </div>
                </div>

                {/* 3. Check-out (Belum dilakukan) */}
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full border border-slate-300 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-xs md:text-sm text-slate-800">Check-out</p>
                    <p className="text-xs text-slate-400 mt-0.5">Belum dilakukan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Absensi Placeholder */}
      {activeTab === 'absensi' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-xs text-slate-500 shadow-2xs">
          Riwayat presensi anak magang untuk periode aktif.
        </div>
      )}

      {/* Tab Logbook Placeholder */}
      {activeTab === 'logbook' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-xs text-slate-500 shadow-2xs">
          Daftar rekam logbook kegiatan harian peserta.
        </div>
      )}

      {/* Tab Tugas Placeholder */}
      {activeTab === 'tugas' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-xs text-slate-500 shadow-2xs">
          Penugasan dan status progres pengerjaan tugas peserta.
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL UBAH STATUS KERJA (A-03 / Form Status Kerja)       */}
      {/* ======================================================== */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-7 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-xl font-semibold text-slate-900 font-lexend">
                Ubah Status Kerja
              </h3>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              {intern.nama} · <span className="font-mono text-slate-600">{intern.email}</span>
            </p>

            <form onSubmit={handleSaveStatusKerja} className="space-y-4">
              <div className="text-xs text-slate-600">
                Status saat ini: <strong className="text-slate-800">{intern.status_kerja}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status kerja baru
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      newStatusKerja === 'On-site'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f] font-semibold'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_modal"
                      checked={newStatusKerja === 'On-site'}
                      onChange={() => setNewStatusKerja('On-site')}
                      className="accent-[#17362f]"
                    />
                    <span>On-site</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition text-xs font-medium ${
                      newStatusKerja === 'Remote'
                        ? 'border-[#17362f] bg-[#eef5f2] text-[#17362f] font-semibold'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_kerja_modal"
                      checked={newStatusKerja === 'Remote'}
                      onChange={() => setNewStatusKerja('Remote')}
                      className="accent-[#17362f]"
                    />
                    <span>Remote</span>
                  </label>
                </div>
              </div>

              {/* Callout Box Sesuai Figma */}
              <div className="p-3.5 rounded-xl bg-[#eef6f2] border border-[#d2e7dc] text-xs text-[#20493e]">
                <p className="font-bold text-[#17362f]">Berlaku untuk absensi berikutnya</p>
                <p className="text-[11px] text-[#3d6559] mt-0.5">
                  Tidak mengubah status, foto, atau lokasi pada absensi yang sudah tercatat.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  Simpan Status Kerja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL UBAH DATA                                          */}
      {/* ======================================================== */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900 font-lexend">
                Ubah Data Peserta
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditData} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal kampus
                </label>
                <input
                  type="text"
                  required
                  value={editForm.kampus}
                  onChange={(e) => setEditForm({ ...editForm, kampus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#17362f] hover:bg-[#122b25] text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
