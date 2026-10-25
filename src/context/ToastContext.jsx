import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback(({ title, message, type = 'success', duration = 3000 }) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ title, message, type });

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Global Bottom Toast Notification (Auto Dismiss 3 Detik) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full bg-[#edf6f1] border border-[#cde6d7] shadow-xl rounded-xl p-4 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-[#17362f] font-source-sans">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-xs text-[#17362f]/90 leading-relaxed font-source-sans">
                {toast.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={hideToast}
            className="text-[#17362f]/60 hover:text-[#17362f] p-1 rounded-lg transition cursor-pointer"
            title="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
