// src/hooks/useNetworkAlerts.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export type AlertType = 'critical' | 'warning' | 'recovery' | 'info';
export interface NetworkAlert { id: string; type: AlertType; title: string; message: string; timestamp: Date; }
export interface NetworkStatus { isOnline: boolean; latency: number | null; quality: 'excellent' | 'good' | 'poor' | 'offline'; }

function generateId() { return Math.random().toString(36).substr(2, 9); }

async function measurePing(): Promise<number | null> {
  try {
    const start = performance.now();
    const token = localStorage.getItem('access_token');
    await fetch(`/api/network/ping/?t=${Date.now()}`, { method: 'GET', cache: 'no-store', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return Math.round(performance.now() - start);
  } catch { return null; }
}

function getQuality(latency: number | null, isOnline: boolean): NetworkStatus['quality'] {
  if (!isOnline || latency === null) return 'offline';
  if (latency < 80) return 'excellent';
  if (latency < 150) return 'good';
  return 'poor';
}

export function useNetworkAlerts() {
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [status, setStatus] = useState<NetworkStatus>({ isOnline: navigator.onLine, latency: null, quality: 'good' });
  const prevQuality = useRef<NetworkStatus['quality']>('good');

  const addAlert = useCallback((type: AlertType, title: string, message: string) => {
    setAlerts(prev => [{ id: generateId(), type, title, message, timestamp: new Date() }, ...prev].slice(0, 10));
  }, []);

  const dismissAlert = useCallback((id: string) => { setAlerts(prev => prev.filter(a => a.id !== id)); }, []);
  const dismissAll = useCallback(() => setAlerts([]), []);

  useEffect(() => {
    const handleOnline = () => { addAlert('recovery', 'Connection Restored', 'Your internet is back online.'); setStatus(s => ({ ...s, isOnline: true })); };
    const handleOffline = () => { addAlert('critical', 'No Internet Connection', 'You are offline.'); setStatus({ isOnline: false, latency: null, quality: 'offline' }); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [addAlert]);

  useEffect(() => {
    const check = async () => {
      if (!navigator.onLine) return;
      const latency = await measurePing();
      const quality = getQuality(latency, navigator.onLine);
      setStatus({ isOnline: navigator.onLine, latency, quality });
      const prev = prevQuality.current;
      if (latency === null && prev !== 'offline') addAlert('critical', 'Server Unreachable', 'Cannot reach the server.');
      else if (quality === 'poor' && prev !== 'poor') addAlert('warning', 'Poor Connection', `High latency: ${latency}ms.`);
      else if ((quality === 'excellent' || quality === 'good') && prev === 'poor') addAlert('recovery', 'Connection Improved', `Latency: ${latency}ms.`);
      prevQuality.current = quality;
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [addAlert]);

  return { alerts, status, dismissAlert, dismissAll };
}
