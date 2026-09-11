import React, { createContext, useContext, useState, useCallback } from 'react';
import MaterialIcon from './MaterialIcon';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title = '', message = '', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((message, title = 'Success') => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const showError = useCallback((message, title = 'Error') => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const showWarning = useCallback((message, title = 'Notice') => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const showInfo = useCallback((message, title = 'Information') => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  const confirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
    onConfirm = () => {},
  }) => {
    setConfirmDialog({
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      onConfirm: async () => {
        setConfirmDialog(null);
        await onConfirm();
      },
      onCancel: () => setConfirmDialog(null),
    });
  }, []);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: 'check_circle',
          border: 'border-emerald-500/40',
          bg: 'bg-slate-900/95 text-white shadow-emerald-500/10',
          iconColor: 'text-emerald-400 bg-emerald-500/15',
          accent: 'bg-emerald-500',
        };
      case 'error':
        return {
          icon: 'error',
          border: 'border-rose-500/40',
          bg: 'bg-slate-900/95 text-white shadow-rose-500/10',
          iconColor: 'text-rose-400 bg-rose-500/15',
          accent: 'bg-rose-500',
        };
      case 'warning':
        return {
          icon: 'warning',
          border: 'border-amber-500/40',
          bg: 'bg-slate-900/95 text-white shadow-amber-500/10',
          iconColor: 'text-amber-400 bg-amber-500/15',
          accent: 'bg-amber-500',
        };
      default:
        return {
          icon: 'info',
          border: 'border-cyan-500/40',
          bg: 'bg-slate-900/95 text-white shadow-cyan-500/10',
          iconColor: 'text-cyan-400 bg-cyan-500/15',
          accent: 'bg-cyan-500',
        };
    }
  };

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    confirm,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const style = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border ${style.border} ${style.bg} shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-3 fade-in duration-200 transition-all`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconColor}`}>
                <MaterialIcon name={style.icon} size={20} filled />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                {toast.title && <h4 className="text-xs font-black text-white leading-tight">{toast.title}</h4>}
                <p className="text-xs text-slate-300 font-medium leading-relaxed mt-0.5 break-words">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                aria-label="Dismiss notification"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmDialog.isDanger ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                <MaterialIcon name={confirmDialog.isDanger ? 'delete_forever' : 'help_outline'} size={24} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed mt-1">{confirmDialog.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-lg ${
                  confirmDialog.isDanger
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
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
