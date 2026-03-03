// src/components/shared/Toast.tsx
import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />,
  };

  const colors = {
    success: { bg: 'var(--success-bg)', border: 'var(--success)', text: 'var(--success)' },
    error: { bg: 'var(--danger-bg)', border: 'var(--danger)', text: 'var(--danger)' },
    info: { bg: 'var(--info-bg)', border: 'var(--info)', text: 'var(--info)' },
    warning: { bg: 'var(--warning-bg)', border: 'var(--warning)', text: 'var(--warning)' },
  };

  const style = colors[type];

  return (
    <div
      className="toast fade-in"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        minWidth: '320px',
        maxWidth: '420px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '.75rem',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 9999,
        color: style.text,
      }}
    >
      {icons[type]}
      <span style={{ flex: 1, fontSize: '.875rem', fontWeight: 500 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '.25rem',
          color: style.text,
          opacity: 0.7,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
