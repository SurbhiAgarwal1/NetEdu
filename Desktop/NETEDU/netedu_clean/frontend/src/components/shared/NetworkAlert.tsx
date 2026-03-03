// src/components/shared/NetworkAlert.tsx
import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function NetworkAlert() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert) return null;

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        minWidth: '320px',
        background: isOnline ? 'var(--success-bg)' : 'var(--danger-bg)',
        border: `1px solid ${isOnline ? 'var(--success)' : 'var(--danger)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '.75rem',
        boxShadow: 'var(--shadow-lg)',
        color: isOnline ? 'var(--success)' : 'var(--danger)',
      }}
    >
      {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '.875rem' }}>
          {isOnline ? 'Back Online!' : 'No Internet Connection'}
        </div>
        <div style={{ fontSize: '.75rem', opacity: 0.8 }}>
          {isOnline
            ? 'Your connection has been restored.'
            : 'You can still access downloaded content offline.'}
        </div>
      </div>
    </div>
  );
}
