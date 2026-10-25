import React from 'react';

export const InternLogbookPage = () => {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight font-lexend">
          Logbook Saya
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-source-sans">
          Catatan aktivitas dan progres pekerjaan harian.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center py-16">
        <div className="w-12 h-12 rounded-full bg-[#e7f5ec] text-[#17362f] font-bold text-lg flex items-center justify-center mx-auto mb-3">
          ✓
        </div>
        <h3 className="text-base font-bold text-slate-800 font-lexend">Modul Logbook Saya</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-source-sans">
          Halaman ini siap diisi dengan alur dan form lengkap sesuai rancangan Figma.
        </p>
      </div>
    </div>
  );
};
