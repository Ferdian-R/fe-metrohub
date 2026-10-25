import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { MapPin, Navigation } from 'lucide-react';

export const AdminLocationPage = () => {
  const { showToast } = useToast();

  const [locationForm, setLocationForm] = useState(() => {
    try {
      const saved = localStorage.getItem('metro_office_location');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      latitude: '-7.747033',
      longitude: '110.355398',
      radius: '100',
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveLocation = (e) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      localStorage.setItem('metro_office_location', JSON.stringify(locationForm));
      setIsSaving(false);
      showToast({
        title: 'Lokasi kantor diperbarui',
        message: `Titik koordinat ${locationForm.latitude}, ${locationForm.longitude} (Radius ${locationForm.radius}m) berhasil disimpan.`,
      });
    }, 400);
  };

  const radiusNum = Number(locationForm.radius) || 100;
  // Calculate relative circle scale for preview (min 120px, max 260px)
  const circleDiameter = Math.min(Math.max(radiusNum * 1.6, 120), 260);

  return (
    <div className="space-y-6 w-full pb-16 font-sans">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
          Lokasi Kantor
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-source-sans">
          Atur titik dan radius validasi untuk absensi on-site berikutnya.
        </p>
      </div>

      {/* Grid 2 Kolom: Form Koordinat (Kiri) & Preview Peta Simulasi (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Input Koordinat dan Radius */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 font-lexend">
            Koordinat dan radius
          </h2>

          <form onSubmit={handleSaveLocation} className="space-y-4">
            {/* Latitude */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                Latitude
              </label>
              <input
                type="text"
                required
                value={locationForm.latitude}
                onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-source-sans">
                Nilai antara -90 sampai 90.
              </p>
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                Longitude
              </label>
              <input
                type="text"
                required
                value={locationForm.longitude}
                onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-source-sans">
                Nilai antara -180 sampai 180.
              </p>
            </div>

            {/* Radius Absensi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                Radius absensi
              </label>
              <div className="flex rounded-xl border border-slate-300 focus-within:ring-1 focus-within:ring-[#17362f] focus-within:border-[#17362f] overflow-hidden">
                <input
                  type="number"
                  min="10"
                  max="5000"
                  required
                  value={locationForm.radius}
                  onChange={(e) => setLocationForm({ ...locationForm, radius: e.target.value })}
                  className="w-full bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none font-mono"
                />
                <span className="inline-flex items-center px-4 bg-slate-50 border-l border-slate-200 text-xs text-slate-500 font-source-sans select-none">
                  meter
                </span>
              </div>
            </div>

            {/* Callout Notice */}
            <div className="bg-[#edf6f1] border border-[#cde6d7] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-700 font-source-sans">
              <MapPin className="w-4 h-4 text-[#176a43] shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Perubahan hanya berlaku pada absensi berikutnya dan tidak mengubah bukti historis.
              </p>
            </div>

            {/* Tombol Simpan Perubahan */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-[#17362f] hover:bg-[#122b25] active:scale-[0.99] text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer text-center"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Preview Radius Kantor (Figma A-12 Peta Simulasi) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-4">
          {/* Canvas Simulasi Peta Visual */}
          <div className="w-full h-72 md:h-80 bg-[#f0f3f1] rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
            {/* Background Grid Pattern Map Effect */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(#17362f 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Lingkaran Radius Absensi Kantor (Dark Forest Green Circle sesuai Figma Image 2) */}
            <div
              style={{
                width: `${circleDiameter}px`,
                height: `${circleDiameter}px`,
              }}
              className="bg-[#17362f] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative group"
            >
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping" />

              {/* Pin Lokasi Pusat */}
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Navigation className="w-4 h-4 text-white transform -rotate-45" />
              </div>

              {/* Radius Tooltip on hover */}
              <span className="absolute -bottom-7 bg-slate-900/90 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow">
                Radius {locationForm.radius} m
              </span>
            </div>
          </div>

          {/* Keterangan Bawah Peta */}
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fef3c7] text-[#92400e]">
              Data contoh
            </span>
            <h3 className="text-sm font-bold text-slate-900 font-lexend mt-2">
              Preview radius kantor
            </h3>
            <p className="text-xs text-slate-500 font-source-sans mt-0.5">
              Peta simulasi dengan koordinat dan radius contoh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
