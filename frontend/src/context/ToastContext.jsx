import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { IconAlert, IconCheckCircle, IconInfo, IconX, IconXCircle } from '../components/Icons';

/**
 * ToastContext — global notification system.
 * Usage: const toast = useToast();  toast.success('Group created successfully.');
 */
const ToastContext = createContext(null);

const ICONS = {
  success: <IconCheckCircle size={19} />,
  error: <IconXCircle size={19} />,
  warning: <IconAlert size={19} />,
  info: <IconInfo size={19} />,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, type = 'info', duration = 3600) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { id, message, type }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const api = useMemo(
    () => ({
      success: (msg, duration) => push(msg, 'success', duration),
      error: (msg, duration) => push(msg, 'error', duration),
      warning: (msg, duration) => push(msg, 'warning', duration),
      info: (msg, duration) => push(msg, 'info', duration),
      remove,
    }),
    [push, remove]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast container — always rendered, even during page transitions */}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="t-icon">{ICONS[toast.type]}</span>
            <span className="t-msg">{toast.message}</span>
            <button
              type="button"
              className="t-close"
              onClick={() => remove(toast.id)}
              aria-label="Dismiss notification"
            >
              <IconX size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
};
