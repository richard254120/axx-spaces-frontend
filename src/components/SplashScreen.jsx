import { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [particles, setParticles] = useState([]);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Generate particles with pre-calculated animation values
    const particleCount = 150;
    const newParticles = [];
    const colors = ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#DEB887', '#F4A460', '#FFD700', '#FFA500'];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 200 + Math.random() * 400;
      const size = 5 + Math.random() * 15;
      const duration = 1.5 + Math.random() * 2;
      const delay = Math.random() * 0.5;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      const rotation = Math.random() * 720;

      newParticles.push({
        id: i,
        size,
        duration,
        delay,
        color: colors[Math.floor(Math.random() * colors.length)],
        endX,
        endY,
        rotation
      });
    }

    setParticles(newParticles);

    // Show logo after particles spread
    const logoTimeout = setTimeout(() => {
      setShowLogo(true);
    }, 1500);

    // Show text after logo
    const textTimeout = setTimeout(() => {
      setShowText(true);
    }, 2000);

    // Complete animation
    const completeTimeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      clearTimeout(logoTimeout);
      clearTimeout(textTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Particle Container */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: particle.color,
              boxShadow: `0 0 ${particle.size}px ${particle.color}`,
              animation: `explode ${particle.duration}s ease-out ${particle.delay}s forwards`,
              '--endX': `${particle.endX}px`,
              '--endY': `${particle.endY}px`,
              '--rotation': `${particle.rotation}deg`
            }}
          />
        ))}
      </div>

      {/* Central Logo */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        opacity: showLogo ? 1 : 0,
        transform: showLogo ? 'scale(1)' : 'scale(0)',
        transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B6B 100%)',
          borderRadius: '50%',
          margin: '0 auto 20px',
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#fff'
        }}>
          A
        </div>

        {/* Text */}
        <div style={{
          opacity: showText ? 1 : 0,
          transform: showText ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 'clamp(36px, 8vw, 72px)',
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: '#fff',
          textShadow: '0 0 30px rgba(255, 215, 0, 0.8)'
        }}>
          AXXSPACE
        </div>

        {/* Tagline */}
        <div style={{
          opacity: showText ? 1 : 0,
          transform: showText ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.2s',
          marginTop: '16px',
          fontSize: 'clamp(14px, 3vw, 18px)',
          color: 'rgba(255, 255, 255, 0.7)',
          letterSpacing: '0.1em'
        }}>
          Your Space, Your Way
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes explode {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--endX), var(--endY)) rotate(var(--rotation)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
