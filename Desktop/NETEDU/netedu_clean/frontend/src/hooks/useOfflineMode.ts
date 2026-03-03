// src/hooks/useOfflineMode.ts
import { useState, useEffect, useCallback } from 'react';

export interface CachedLesson { id: string; title: string; content: string; courseTitle: string; cachedAt: Date; }
const CACHE_KEY = 'netedu_offline_lessons';

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedLessons, setCachedLessons] = useState<CachedLesson[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) { const parsed = JSON.parse(raw); setCachedLessons(parsed.map((l: any) => ({ ...l, cachedAt: new Date(l.cachedAt) }))); }
    } catch {}
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const cacheLesson = useCallback((lesson: Omit<CachedLesson, 'cachedAt'>) => {
    setCachedLessons(prev => {
      const exists = prev.find(l => l.id === lesson.id);
      const updated = exists ? prev.map(l => l.id === lesson.id ? { ...lesson, cachedAt: new Date() } : l) : [...prev, { ...lesson, cachedAt: new Date() }];
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeCached = useCallback((id: string) => {
    setCachedLessons(prev => { const updated = prev.filter(l => l.id !== id); localStorage.setItem(CACHE_KEY, JSON.stringify(updated)); return updated; });
  }, []);

  const clearCache = useCallback(() => { setCachedLessons([]); localStorage.removeItem(CACHE_KEY); }, []);

  return { isOnline, cachedLessons, cacheLesson, removeCached, clearCache };
}
