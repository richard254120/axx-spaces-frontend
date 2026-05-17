import { useEffect } from 'react';

export const useDevToolsProtection = () => {
  useEffect(() => {
    if (import.meta.env.DEV) return;

    const showWarning = () => {
      console.clear();
      console.log(
        '%c⚠️  WARNING: DEVELOPER TOOLS DETECTED',
        'color: #ff0000; font-size: 24px; font-weight: bold;'
      );
      console.log(
        '%c🚫 Do NOT paste or run any code here!',
        'color: #ff8800; font-size: 18px; font-weight: 600;'
      );
      console.log(
        '%cThis can lead to your account being compromised.',
        'color: #ffffff; font-size: 14px;'
      );
    };

    const detectDevTools = () => {
      const threshold = 160;

      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        showWarning();
      }

      const start = performance.now();
      debugger;
      const end = performance.now();

      if (end - start > 80) {
        showWarning();
      }
    };

    const blockShortcuts = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        (e.metaKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))
      ) {
        e.preventDefault();
        showWarning();
        return false;
      }
    };

    const interval = setInterval(detectDevTools, 900);

    document.addEventListener('keydown', blockShortcuts);
    window.addEventListener('resize', detectDevTools);

    setTimeout(detectDevTools, 600);
    setTimeout(detectDevTools, 1500);

    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', blockShortcuts);
      window.removeEventListener('resize', detectDevTools);
    };
  }, []);
};
