import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback(({ title, message, type = 'success', duration = 3000 }) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const resolvedType = type === 'error' || /^gagal\b/i.test(title || '') ? 'error' : type;
    setToast({ title, message, type: resolvedType });

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
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          className={`fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full shadow-xl rounded-xl p-4 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto border ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200'
              : 'bg-[#edf6f1] border-[#cde6d7]'
          }`}
        >
          <div className="space-y-0.5">
            <h4
              className={`text-sm font-bold font-source-sans ${
                toast.type === 'error' ? 'text-rose-800' : 'text-[#17362f]'
              }`}
            >
              {toast.title}
            </h4>
            {toast.message && (
              <p
                className={`text-xs leading-relaxed font-source-sans ${
                  toast.type === 'error' ? 'text-rose-700' : 'text-[#17362f]/90'
                }`}
              >
                {toast.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={hideToast}
            className={`p-1 rounded-lg transition cursor-pointer ${
              toast.type === 'error'
                ? 'text-rose-500 hover:text-rose-800'
                : 'text-[#17362f]/60 hover:text-[#17362f]'
            }`}
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
