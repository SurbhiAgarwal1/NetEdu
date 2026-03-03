// src/context/ThemeContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';
interface ThemeContextType { theme: Theme; toggleTheme: () => void; isDark: boolean; }
const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => {}, isDark: true });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('netedu-theme') as Theme) || 'dark');
  useEffect(() => {
    localStorage.setItem('netedu-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--bg', '#0f0f14');
      document.documentElement.style.setProperty('--bg-secondary', '#1a1a24');
      document.documentElement.style.setProperty('--bg-card', '#16161f');
      document.documentElement.style.setProperty('--border', 'rgba(255,255,255,0.07)');
      document.documentElement.style.setProperty('--text-primary', 'rgba(255,255,255,0.9)');
      document.documentElement.style.setProperty('--text-secondary', 'rgba(255,255,255,0.45)');
      document.documentElement.style.setProperty('--text-muted', 'rgba(255,255,255,0.25)');
      document.documentElement.style.setProperty('--shadow', '0 4px 24px rgba(0,0,0,0.4)');
      document.documentElement.style.setProperty('--gray-900', '#0a0a10');
    } else {
      document.documentElement.style.setProperty('--bg', '#f4f4f8');
      document.documentElement.style.setProperty('--bg-secondary', '#ffffff');
      document.documentElement.style.setProperty('--bg-card', '#ffffff');
      document.documentElement.style.setProperty('--border', 'rgba(0,0,0,0.08)');
      document.documentElement.style.setProperty('--text-primary', 'rgba(0,0,0,0.85)');
      document.documentElement.style.setProperty('--text-secondary', 'rgba(0,0,0,0.5)');
      document.documentElement.style.setProperty('--text-muted', 'rgba(0,0,0,0.3)');
      document.documentElement.style.setProperty('--shadow', '0 4px 24px rgba(0,0,0,0.1)');
      document.documentElement.style.setProperty('--gray-900', '#1e1e2e');
    }
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
