// src/components/shared/ThemeToggle.tsx
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();
  return (
    <button onClick={toggleTheme} title={`Switch to ${isDark ? 'light' : 'dark'} mode`} style={{ display:'flex', alignItems:'center', gap:'.4rem', padding:'.4rem .75rem', background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', border:`1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, borderRadius:20, cursor:'pointer', transition:'all 0.2s', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
      <span style={{ fontSize:'.75rem', fontWeight:600 }}>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
