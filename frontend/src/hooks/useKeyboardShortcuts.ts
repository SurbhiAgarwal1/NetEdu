// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + K: Search (future feature)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        console.log('Search shortcut - to be implemented');
      }

      // Ctrl/Cmd + D: Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        navigate('/dashboard');
      }

      // Ctrl/Cmd + N: Network
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/network');
      }

      // Ctrl/Cmd + L: Learning
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        navigate('/learning');
      }

      // ? key: Show shortcuts help
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        showShortcutsHelp();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
}

function showShortcutsHelp() {
  const shortcuts = [
    { keys: 'Ctrl/Cmd + D', action: 'Go to Dashboard' },
    { keys: 'Ctrl/Cmd + N', action: 'Go to Network' },
    { keys: 'Ctrl/Cmd + L', action: 'Go to Learning' },
    { keys: '?', action: 'Show this help' },
  ];

  const helpText = shortcuts.map(s => `${s.keys}: ${s.action}`).join('\n');
  alert(`Keyboard Shortcuts:\n\n${helpText}`);
}
