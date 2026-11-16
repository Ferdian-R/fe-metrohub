import React, { useEffect, useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { MapPin, Loader2, Crosshair, Search, ExternalLink, ClipboardPaste, X } from 'lucide-react';
import { coreService } from '../../core/services/coreService';

// ===== Utilitas Google Maps (tanpa API key) =====
// Peta memakai embed publik Google Maps (output=embed). Koordinat tidak bisa dibaca langsung
// dari iframe (beda origin), jadi admin menempelkan link/koordinat dari Google Maps ke form.

const ANGKA = '(-?\\d{1,3}(?:\\.\\d+)?)';

// Urutan penting: !3d/!4d adalah titik tempat yang dipilih, sedangkan @lat,lng hanya pusat tampilan peta.
const POLA_KOORDINAT = [
  new RegExp(`!3d${ANGKA}!4d${ANGKA}`),
  new RegExp(`[?&](?:q|query|ll|destination|center)=${ANGKA},\\s*\\+?${ANGKA}`),
  new RegExp(`/(?:search|place|dir)/${ANGKA},\\s*\\+?${ANGKA}`),
  new RegExp(`@${ANGKA},\\s*${ANGKA}`),
  new RegExp(`^\\s*${ANGKA}\\s*[,;\\s]\\s*${ANGKA}\\s*$`),
];

// Format derajat-menit-detik, misalnya 0°54'48.1"S 100°21'11.6"E
const POLA_DMS =
  /(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:\.\d+)?)["″]?\s*([NS])[\s,]*(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:\.\d+)?)["″]?\s*([EW])/i;

const koordinatValid = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

function parseKoordinatGoogleMaps(input) {
  let teks = input.trim();
  if (!teks) return { error: 'Tempel link atau koordinat dari Google Maps terlebih dahulu.' };
  if (/(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(teks)) {
    return {
      error:
        'Link pendek (maps.app.goo.gl) tidak bisa dibaca. Buka link tersebut di browser, lalu salin link lengkap dari address bar atau salin koordinatnya.',
    };
  }
  try {
    teks = decodeURIComponent(teks);
  } catch {
    // Biarkan apa adanya bila ada karakter % yang tidak valid
  }

  for (const pola of POLA_KOORDINAT) {
    const m = teks.match(pola);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (koordinatValid(lat, lng)) return { lat, lng };
    }
  }

  const dms = teks.match(POLA_DMS);
  if (dms) {
    const keDesimal = (d, mnt, dtk, arah) =>
      (Number(d) + Number(mnt) / 60 + Number(dtk) / 3600) * (/[SW]/i.test(arah) ? -1 : 1);
    const lat = keDesimal(dms[1], dms[2], dms[3], dms[4]);
    const lng = keDesimal(dms[5], dms[6], dms[7], dms[8]);
    if (koordinatValid(lat, lng)) return { lat, lng };
  }

  return { error: 'Koordinat tidak ditemukan. Contoh yang valid: -0.9134, 100.3602 atau link lengkap Google Maps.' };
}

const embedUrl = (q, zoom) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&hl=id&output=embed`;
const searchUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

// Meter per piksel pada proyeksi Web Mercator (tile 256 px)
const meterPerPiksel = (lat, zoom) => (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;

// Pilih zoom terdekat agar lingkaran radius kira-kira berdiameter targetPx
function hitungSkalaRadius(lat, radius, targetPx = 200) {
  const r = Math.max(radius, 1);
  const ideal = Math.log2((156543.03392 * Math.cos((lat * Math.PI) / 180) * targetPx) / (2 * r));
  const zoom = Math.min(19, Math.max(3, Math.floor(ideal)));
  return { zoom, diameter: (2 * r) / meterPerPiksel(lat, zoom) };
}

// Tunda nilai agar iframe peta tidak dimuat ulang di setiap ketukan keyboard
function useDebounced(value, delay = 600) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export const AdminLocationPage = () => {
  const { showToast } = useToast();

  const [locationForm, setLocationForm] = useState({ latitude: '', longitude: '', radius: '' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Pencarian Google Maps
  const [searchText, setSearchText] = useState('');
  const [activeSearch, setActiveSearch] = useState(''); // query yang sedang ditampilkan di peta
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await coreService.getOfficeSettings();
        const d = res?.data;
        if (d) {
          setLocationForm({
            latitude: String(d.latitude),
            longitude: String(d.longitude),
            radius: String(d.radius_meter),
          });
        }
      } catch (err) {
        // 404 = lokasi belum pernah diatur; form dibiarkan kosong
        if (err?.message && !/belum diatur/i.test(err.message)) setFormError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setKoordinat = (lat, lng) => {
    setLocationForm((f) => ({ ...f, latitude: lat.toFixed(7), longitude: lng.toFixed(7) }));
    setActiveSearch(''); // kembali menampilkan titik kantor + radius
    setFormError('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return setFormError('Browser tidak mendukung GPS.');
    navigator.geolocation.getCurrentPosition(
      (pos) => setKoordinat(pos.coords.latitude, pos.coords.longitude),
      () => setFormError('Gagal membaca lokasi. Pastikan izin lokasi diberikan.'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSearch = () => {
    const q = searchText.trim();
    if (!q) return;
    // Bila yang diketik ternyata koordinat/link, langsung terapkan
    const hasil = parseKoordinatGoogleMaps(q);
    if (!hasil.error) {
      setKoordinat(hasil.lat, hasil.lng);
      showToast({ title: 'Koordinat diterapkan', message: `${hasil.lat.toFixed(7)}, ${hasil.lng.toFixed(7)}` });
      return;
    }
    setActiveSearch(q);
  };

  const handleApplyPaste = () => {
    setPasteError('');
    const hasil = parseKoordinatGoogleMaps(pasteText);
    if (hasil.error) return setPasteError(hasil.error);
    setKoordinat(hasil.lat, hasil.lng);
    setPasteText('');
    showToast({
      title: 'Koordinat diterapkan',
      message: `${hasil.lat.toFixed(7)}, ${hasil.lng.toFixed(7)}. Klik Simpan Perubahan untuk menyimpan.`,
    });
  };

  const handlePasteFromClipboard = async () => {
    try {
      const teks = await navigator.clipboard.readText();
      setPasteText(teks);
      setPasteError('');
    } catch {
      setPasteError('Browser tidak mengizinkan membaca clipboard. Tempel manual dengan Ctrl+V.');
    }
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setFormError('');
    const latitude = Number(locationForm.latitude);
    const longitude = Number(locationForm.longitude);
    const radius_meter = Number(locationForm.radius);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
      return setFormError('Latitude harus angka antara -90 sampai 90.');
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
      return setFormError('Longitude harus angka antara -180 sampai 180.');
    if (!Number.isInteger(radius_meter) || radius_meter <= 0 || radius_meter > 10000)
      return setFormError('Radius harus bilangan bulat 1 sampai 10.000 meter.');

    try {
      setIsSaving(true);
      const res = await coreService.updateOfficeSettings({ latitude, longitude, radius_meter });
      const d = res?.data;
      if (d) {
        setLocationForm({ latitude: String(d.latitude), longitude: String(d.longitude), radius: String(d.radius_meter) });
      }
      showToast({
        title: 'Lokasi kantor diperbarui',
        message: `Titik ${latitude}, ${longitude} (radius ${radius_meter} m) berlaku untuk absensi berikutnya.`,
      });
    } catch (err) {
      setFormError(err?.details?.[0]?.message || err?.message || 'Gagal menyimpan lokasi kantor.');
    } finally {
      setIsSaving(false);
    }
  };

  // Nilai untuk peta (ditunda agar iframe tidak berkedip saat mengetik)
  const debLat = Number(useDebounced(locationForm.latitude));
  const debLng = Number(useDebounced(locationForm.longitude));
  const debRadius = Number(useDebounced(locationForm.radius)) || 100;
  // 0,0 adalah placeholder dari seed, dianggap belum diatur
  const adaTitik = koordinatValid(debLat, debLng) && !(debLat === 0 && debLng === 0);
  const skala = adaTitik ? hitungSkalaRadius(debLat, debRadius) : null;

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#17362f] mb-3" />
        <p className="text-sm">Memuat lokasi kantor...</p>
      </div>
    );
  }

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

      {/* Grid 2 Kolom: Form Koordinat (Kiri) & Peta Google Maps (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri */}
        <div className="lg:col-span-6 space-y-6">
          {/* Kartu: Cari lewat Google Maps */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-lexend">Cari lewat Google Maps</h2>
              <p className="text-[11px] text-slate-500 mt-1 font-source-sans">
                Cari nama kantor atau alamat, lalu tempel koordinat titik yang tepat.
              </p>
            </div>

            {/* Langkah 1: Cari */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                1. Nama tempat atau alamat
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    placeholder="Contoh: Metro Software Padang"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!searchText.trim()}
                  className="px-4 py-2.5 bg-[#17362f] hover:bg-[#122b25] disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
                >
                  Cari
                </button>
              </div>
              {searchText.trim() && (
                <a
                  href={searchUrl(searchText.trim())}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#17362f] hover:underline mt-2"
                >
                  <ExternalLink className="w-3 h-3" /> Buka pencarian di Google Maps
                </a>
              )}
            </div>

            {/* Langkah 2: Tempel koordinat/link */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                2. Tempel koordinat atau link Google Maps
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pasteText}
                  onChange={(e) => {
                    setPasteText(e.target.value);
                    setPasteError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyPaste();
                    }
                  }}
                  placeholder="-0.9134, 100.3602 atau https://www.google.com/maps/..."
                  className="flex-1 min-w-0 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
                />
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  title="Tempel dari clipboard"
                  className="px-3 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl transition cursor-pointer"
                >
                  <ClipboardPaste className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleApplyPaste}
                  disabled={!pasteText.trim()}
                  className="px-4 py-2.5 border border-[#17362f] text-[#17362f] hover:bg-[#edf6f1] disabled:border-slate-300 disabled:text-slate-400 text-xs font-semibold rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
                >
                  Terapkan
                </button>
              </div>
              {pasteError && <p className="text-[11px] text-rose-600 font-medium mt-1.5">{pasteError}</p>}
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-source-sans">
                Di Google Maps, klik kanan tepat di titik kantor lalu klik angka koordinat paling atas untuk menyalin.
                Bisa juga menyalin link lengkap dari address bar.
              </p>
            </div>
          </div>

          {/* Kartu: Koordinat dan radius */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 font-lexend">Koordinat dan radius</h2>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              {/* Latitude */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">Latitude</label>
                <input
                  type="text"
                  required
                  value={locationForm.latitude}
                  onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
                />
                <p className="text-[11px] text-slate-400 mt-1 font-source-sans">Nilai antara -90 sampai 90.</p>
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">Longitude</label>
                <input
                  type="text"
                  required
                  value={locationForm.longitude}
                  onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#17362f] focus:border-[#17362f]"
                />
                <p className="text-[11px] text-slate-400 mt-1 font-source-sans">Nilai antara -180 sampai 180.</p>
              </div>

              {/* Radius Absensi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-source-sans">
                  Radius absensi
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:ring-1 focus-within:ring-[#17362f] focus-within:border-[#17362f] overflow-hidden">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    step="1"
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

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#17362f] hover:underline cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5" /> Gunakan lokasi saya saat ini
              </button>

              {formError && <p className="text-xs text-rose-600 font-medium">{formError}</p>}

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
        </div>

        {/* Kolom Kanan: Peta Google Maps */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-4 lg:sticky lg:top-6">
          <div className="w-full h-80 md:h-96 bg-[#f0f3f1] rounded-xl border border-slate-200 relative overflow-hidden">
            {activeSearch ? (
              <>
                <iframe
                  key={`cari-${activeSearch}`}
                  title="Hasil pencarian Google Maps"
                  src={embedUrl(activeSearch, 16)}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
                  <span className="bg-white/95 text-[11px] text-slate-700 px-2.5 py-1.5 rounded-lg shadow max-w-[75%] leading-snug">
                    Hasil pencarian: <b>{activeSearch}</b>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveSearch('')}
                    className="pointer-events-auto inline-flex items-center gap-1 bg-white/95 hover:bg-white text-[11px] font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg shadow cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Tutup
                  </button>
                </div>
              </>
            ) : adaTitik ? (
              <>
                <iframe
                  key={`titik-${debLat}-${debLng}-${skala.zoom}`}
                  title="Titik kantor di Google Maps"
                  src={embedUrl(`${debLat},${debLng}`, skala.zoom)}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                {/* Lingkaran radius (perkiraan skala) di atas peta, tidak menghalangi interaksi */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    style={{ width: `${skala.diameter}px`, height: `${skala.diameter}px` }}
                    className="rounded-full bg-[#17362f]/15 border-2 border-[#17362f]/70"
                  />
                </div>
                <span className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none">
                  Radius {debRadius} m
                </span>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(#17362f 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />
                <MapPin className="w-8 h-8 text-[#17362f]/60 mb-2 relative" />
                <p className="text-sm font-semibold text-slate-700 relative">Titik kantor belum diatur</p>
                <p className="text-[11px] text-slate-500 mt-1 relative">
                  Cari lokasi kantor lewat Google Maps atau gunakan lokasi Anda saat ini.
                </p>
              </div>
            )}
          </div>

          {/* Keterangan Bawah Peta */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-lexend">
              {activeSearch ? 'Hasil pencarian Google Maps' : 'Preview radius kantor'}
            </h3>
            <p className="text-xs text-slate-500 font-source-sans mt-0.5 leading-relaxed">
              {activeSearch
                ? 'Peta pencarian hanya untuk referensi. Salin koordinat titik kantor lalu tempel di langkah 2.'
                : 'Lingkaran radius adalah perkiraan skala di atas peta.'}{' '}
              {!activeSearch && adaTitik && (
                <a
                  href={`https://www.google.com/maps?q=${debLat},${debLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#17362f] hover:underline"
                >
                  Buka titik di Google Maps
                </a>
              )}
              {activeSearch && (
                <a
                  href={searchUrl(activeSearch)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#17362f] hover:underline"
                >
                  Buka di Google Maps
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
