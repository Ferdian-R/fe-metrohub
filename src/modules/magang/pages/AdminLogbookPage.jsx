import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { magangService } from '../services/magangService';

export const AdminLogbookPage = () => {
  const [logbooks, setLogbooks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPesertaId, setSelectedPesertaId] = useState('all');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');
  const [activeModalItem, setActiveModalItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedPesertaId !== 'all') params.intern_id = selectedPesertaId;
      if (dariTanggal) params.dari = dariTanggal;
      if (sampaiTanggal) params.sampai = sampaiTanggal;

      const [lbRes, internsRes] = await Promise.all([
        magangService.getAllLogbooks(params),
        magangService.getAllInterns(),
      ]);

      setLogbooks(lbRes?.data || []);
      setInterns(internsRes?.data || []);
    } catch (err) {
      console.error('Failed to load logbooks / interns:', err);
      setError(err?.message || 'Gagal memuat data logbook peserta');
    } finally {
      setLoading(false);
    }
  }, [selectedPesertaId, dariTanggal, sampaiTanggal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleResetFilter = () => {
    setSelectedPesertaId('all');
    setDariTanggal('');
    setSampaiTanggal('');
    setSearchTerm('');
  };

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

  const filteredLogbooks = useMemo(() => {
    return logbooks.filter((item) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const isi = (item.isi || '').toLowerCase();
      const nama = (item.intern?.user?.nama || '').toLowerCase();
      return isi.includes(term) || nama.includes(term);
    });
  }, [logbooks, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-lexend">
          Logbook Peserta
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Catatan harian peserta dan riwayat aktivitas kerja.
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
            onClick={fetchData}
            className="px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Filter Card */}
      <form onSubmit={handleApplyFilter} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
          {/* Input Cari */}
          <div className="flex-1 relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pencarian
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari isi catatan atau nama peserta"
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
            />
          </div>

          {/* Dropdown Peserta */}
          <div className="w-full md:w-56 relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Peserta
            </label>
            <div className="relative">
              <select
                value={selectedPesertaId}
                onChange={(e) => setSelectedPesertaId(e.target.value)}
                className="w-full h-10 pl-3.5 pr-8 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] appearance-none cursor-pointer transition"
              >
                <option value="all">Semua peserta</option>
                {interns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nama}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Dari Tanggal */}
          <div className="w-full md:w-44">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dari tanggal
            </label>
            <input
              type="date"
              value={dariTanggal}
              onChange={(e) => setDariTanggal(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
            />
          </div>

          {/* Sampai Tanggal */}
          <div className="w-full md:w-44">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sampai tanggal
            </label>
            <input
              type="date"
              value={sampaiTanggal}
              onChange={(e) => setSampaiTanggal(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 focus:outline-none focus:border-[#17362f] focus:ring-1 focus:ring-[#17362f] transition"
            />
          </div>

          {/* Action */}
          <div className="flex items-center gap-2 pt-2 md:pt-0">
            <button
              type="submit"
              className="h-10 px-4 bg-[#17362f] hover:bg-[#122b25] text-white text-xs md:text-sm font-semibold rounded-lg shadow-xs transition"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="h-10 px-3 text-slate-500 hover:text-slate-800 text-xs md:text-sm font-medium transition"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Tabel Logbook */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-4 font-semibold">Tanggal</th>
                <th className="px-5 py-4 font-semibold">Peserta</th>
                <th className="px-5 py-4 font-semibold">Isi Catatan</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#17362f] mb-2" />
                    <span>Memuat catatan logbook...</span>
                  </td>
                </tr>
              ) : filteredLogbooks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                    Belum ada data logbook yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLogbooks.map((item) => {
                  const internName = item.intern?.user?.nama || `Peserta #${item.intern_id}`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4 font-medium text-slate-900 whitespace-nowrap">
                        {formatDateToID(item.tanggal)}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">
                        {internName}
                      </td>
                      <td className="px-5 py-4">
                        <p className="line-clamp-2 text-slate-600 max-w-xl">
                          {item.isi}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setActiveModalItem(item)}
                          className="text-xs text-[#17362f] hover:underline font-semibold"
                        >
                          Lihat Lengkap
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
          <span>Menampilkan {filteredLogbooks.length} catatan logbook</span>
          <span>1 dari 1 halaman</span>
        </div>
      </div>

      {/* MODAL LIHAT DETAIL LOGBOOK */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#17362f] uppercase tracking-wider">
                  Detail Logbook
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {activeModalItem.intern?.user?.nama || `Peserta #${activeModalItem.intern_id}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Tanggal:</span>
                <span className="font-semibold text-slate-800">
                  {formatDateLong(activeModalItem.tanggal)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Catatan Kegiatan:</span>
                <div className="p-4 bg-slate-50 rounded-xl text-slate-800 leading-relaxed border border-slate-100 whitespace-pre-wrap text-xs md:text-sm font-sans">
                  {activeModalItem.isi}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
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

export default AdminLogbookPage;
