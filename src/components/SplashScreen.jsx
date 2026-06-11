import { useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0D1B2A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999
    }}>
      <div style={{
        textAlign: 'center',
        color: '#C9A84C',
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '48px',
        fontWeight: 700
      }}>
        AXXSPACE
      </div>
    </div>
  );
};

export default SplashScreen;
