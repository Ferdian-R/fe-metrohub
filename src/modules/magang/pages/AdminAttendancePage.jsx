import React, { useState, useEffect } from 'react';
import { magangService } from '../services/magangService';
import {
  ClipboardList,
  Calendar,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  MapPin,
  X,
} from 'lucide-react';

export const AdminAttendancePage = () => {
  const [attendances, setAttendances] = useState([]);
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'logbook'
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, lbRes] = await Promise.all([
        magangService.getAllAttendances().catch(() => ({ data: [] })),
        magangService.getAllLogbooks().catch(() => ({ data: [] })),
      ]);
      setAttendances(attRes.data || []);
      setLogbooks(lbRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rekap Presensi & Logbook</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring kehadiran harian anak magang, foto selfie verifikasi, dan rekam kegiatan (MG-09).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-200/80 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'attendance'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Presensi Kehadiran
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logbook')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'logbook'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Logbook Harian
          </button>
        </div>
      </div>

      {/* Tab Kehadiran */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5">Nama Magang</th>
                  <th className="px-5 py-3.5">Check-in</th>
                  <th className="px-5 py-3.5">Check-out</th>
                  <th className="px-5 py-3.5">Status Hari</th>
                  <th className="px-5 py-3.5 text-right">Foto Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Belum ada data presensi yang masuk.
                    </td>
                  </tr>
                ) : (
                  attendances.map((item) => {
                    const noCheckout = item.jam_checkin && !item.jam_checkout;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 font-medium text-slate-800">{item.tanggal}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-800">{item.intern?.user?.nama || item.intern_name}</p>
                          <p className="text-[11px] text-slate-400">{item.intern?.status_kerja}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-slate-700">{item.jam_checkin || '-'}</p>
                          {item.lat_checkin && (
                            <p className="text-[10px] text-slate-400">
                              GPS: {item.lat_checkin?.toFixed(4)}, {item.lng_checkin?.toFixed(4)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-slate-700">{item.jam_checkout || '-'}</p>
                          {item.lat_checkout && (
                            <p className="text-[10px] text-slate-400">
                              GPS: {item.lat_checkout?.toFixed(4)}, {item.lng_checkout?.toFixed(4)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {noCheckout ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              Belum Check-out
                            </span>
                          ) : item.jam_checkout ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              Lengkap
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.foto_checkin && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedPhoto(`/api/v1/magang/attendances/photos/${item.foto_checkin}`)
                                }
                                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[11px] font-medium"
                              >
                                Foto Masuk
                              </button>
                            )}
                            {item.foto_checkout && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedPhoto(`/api/v1/magang/attendances/photos/${item.foto_checkout}`)
                                }
                                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[11px] font-medium"
                              >
                                Foto Pulang
                              </button>
                            )}
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
      )}

      {/* Tab Logbook */}
      {activeTab === 'logbook' && (
        <div className="space-y-3">
          {logbooks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
              Belum ada catatan logbook kegiatan dari anak magang.
            </div>
          ) : (
            logbooks.map((lb) => (
              <div key={lb.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">
                      {lb.intern?.user?.nama || 'Peserta Magang'}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-xs text-slate-500">{lb.tanggal}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                  {lb.isi}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Pratinjau Foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full relative shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-bold text-slate-800 text-sm mb-3">Foto Bukti Presensi</h4>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-black">
              <img
                src={selectedPhoto}
                alt="Foto Absensi"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23aaa">Foto tidak ditemukan</text></svg>';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
