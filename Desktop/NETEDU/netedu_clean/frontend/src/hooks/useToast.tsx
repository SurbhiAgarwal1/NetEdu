// src/hooks/useToast.tsx
import { useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import Toast, { ToastType } from '../components/shared/Toast';

let toastContainer: HTMLDivElement | null = null;
let toastRoot: ReturnType<typeof createRoot> | null = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
    toastRoot = createRoot(toastContainer);
  }
  return { container: toastContainer, root: toastRoot! };
}

export function useToast() {
  const show = useCallback((message: string, type: ToastType = 'info') => {
    const { root } = getToastContainer();

    const removeToast = () => {
      root.render(null);
    };

    root.render(
      <Toast message={message} type={type} onClose={removeToast} />
    );
  }, []);

  return {
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
    info: (message: string) => show(message, 'info'),
    warning: (message: string) => show(message, 'warning'),
  };
}
