import { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [visibleLetters, setVisibleLetters] = useState(0);
  const text = 'AXXSPACE';
  const totalDuration = 4000;
  const letterDelay = totalDuration / text.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLetters((prev) => {
        if (prev < text.length) {
          return prev + 1;
        }
        return prev;
      });
    }, letterDelay);

    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, totalDuration + 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [letterDelay, text.length, onComplete]);

  const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #0D1B2A 0%, #1a2a4a 50%, #0D1B2A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      <div style={{
        textAlign: 'center',
        perspective: '1000px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 'clamp(48px, 10vw, 120px)',
          fontWeight: 700,
          letterSpacing: '0.1em'
        }}>
          {text.split('').map((letter, index) => (
            <span
              key={index}
              style={{
                color: colors[index % colors.length],
                opacity: index < visibleLetters ? 1 : 0,
                transform: index < visibleLetters
                  ? 'scale(1) rotateY(0deg)'
                  : 'scale(0.5) rotateY(-90deg)',
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'inline-block',
                transformStyle: 'preserve-3d',
                textShadow: index < visibleLetters
                  ? '0 0 20px currentColor, 0 0 40px currentColor'
                  : 'none'
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        <div style={{
          marginTop: '60px',
          width: '200px',
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <div style={{
            height: '100%',
            width: `${(visibleLetters / text.length) * 100}%`,
            background: 'linear-gradient(90deg, #FFD700, #FFA500, #FF6B6B, #4ECDC4, #45B7D1)',
            borderRadius: '2px',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 10px rgba(255,215,0,0.5)'
          }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
