import { useEffect, useState } from "react";
import logo from "../assets/image.png";

export default function SplashScreen({ isReady = true, onComplete, minDuration = 2100 }) {
  const [canExit, setCanExit] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Ensure the animation has full cinematic runtime before fading out
    const minTimer = setTimeout(() => {
      setCanExit(true);
    }, minDuration);
    return () => clearTimeout(minTimer);
  }, [minDuration]);

  useEffect(() => {
    if (canExit && isReady && !isExiting) {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 550); // Matches the CSS exit transition
      return () => clearTimeout(exitTimer);
    }
  }, [canExit, isReady, isExiting, onComplete]);

  return (
    <div
      className={`axx-splash-root ${isExiting ? "axx-splash-leave" : ""}`}
      aria-hidden={isExiting}
      role="status"
      aria-live="polite"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;800&family=Instrument+Sans:wght@500;600;700&display=swap');

        .axx-splash-root {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: radial-gradient(circle at 50% 35%, #0e1a30 0%, #070d19 55%, #03060c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
                      filter 0.55s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: auto;
          user-select: none;
        }

        .axx-splash-leave {
          opacity: 0 !important;
          transform: scale(1.04) !important;
          filter: blur(8px) !important;
          pointer-events: none !important;
        }

        /* Ambient glowing orbs */
        .axx-splash-orb-gold {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.06) 45%, transparent 70%);
          filter: blur(60px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -55%);
          animation: axxOrbPulse 4s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .axx-splash-orb-blue {
          position: absolute;
          width: 650px;
          height: 650px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 65%);
          filter: blur(80px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        /* Ambient high-tech grid */
        .axx-splash-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(circle at 50% 50%, black 25%, transparent 75%);
          -webkit-mask-image: radial-gradient(circle at 50% 50%, black 25%, transparent 75%);
          pointer-events: none;
        }

        /* Center card */
        .axx-splash-card {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px;
          animation: axxCardEnter 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Logo Emblem Container */
        .axx-splash-emblem {
          position: relative;
          width: 84px;
          height: 84px;
          border-radius: 24px;
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.75), rgba(15, 23, 42, 0.9));
          border: 1px solid rgba(245, 158, 11, 0.35);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.45), 0 0 40px rgba(245, 158, 11, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          animation: axxEmblemPop 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .axx-splash-emblem img {
          width: 52px;
          height: 52px;
          object-fit: contain;
          filter: drop-shadow(0 2px 10px rgba(0,0,0,0.5));
        }

        .axx-splash-emblem-ring {
          position: absolute;
          inset: -4px;
          border-radius: 28px;
          border: 1px solid rgba(251, 191, 36, 0.2);
          animation: axxRingRotate 8s linear infinite;
        }

        /* Brand Typography */
        .axx-splash-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(38px, 6.5vw, 62px);
          font-weight: 800;
          line-height: 1;
          margin: 0;
          letter-spacing: 0.18em;
          text-indent: 0.18em;
          background: linear-gradient(
            110deg,
            #d97706 0%,
            #fbbf24 20%,
            #fffbeb 45%,
            #ffffff 50%,
            #fffbeb 55%,
            #fbbf24 80%,
            #d97706 100%
          );
          background-size: 240% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: axxShimmer 3.2s ease-in-out infinite, axxLetterSpread 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          filter: drop-shadow(0 4px 20px rgba(245, 158, 11, 0.35));
        }

        /* Gold Laser Divider */
        .axx-splash-laser {
          height: 2px;
          width: 0;
          margin: 16px 0 14px;
          background: linear-gradient(90deg, transparent 0%, rgba(245, 158, 11, 0.9) 50%, transparent 100%);
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.7);
          animation: axxLaserGrow 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }

        /* Tagline */
        .axx-splash-tagline {
          font-family: 'Instrument Sans', sans-serif;
          font-size: clamp(10px, 1.4vw, 12px);
          font-weight: 600;
          letter-spacing: 0.32em;
          text-indent: 0.32em;
          color: #94a3b8;
          text-transform: uppercase;
          margin: 0 0 28px;
          opacity: 0;
          transform: translateY(6px);
          animation: axxTaglineFade 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
        }

        /* Micro Progress Track */
        .axx-splash-progress-wrap {
          width: 140px;
          height: 3px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          opacity: 0;
          animation: axxFadeIn 0.6s ease 0.6s forwards;
        }

        .axx-splash-progress-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #d97706, #fbbf24, #ffffff);
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.7);
          border-radius: 999px;
          animation: axxProgress 1.9s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        }

        /* Keyframes */
        @keyframes axxCardEnter {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes axxEmblemPop {
          0% {
            opacity: 0;
            transform: scale(0.7) rotate(-6deg);
          }
          60% {
            transform: scale(1.05) rotate(1deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes axxRingRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes axxOrbPulse {
          0% { transform: translate(-50%, -55%) scale(0.92); opacity: 0.6; }
          100% { transform: translate(-50%, -55%) scale(1.1); opacity: 0.9; }
        }

        @keyframes axxShimmer {
          0% { background-position: 180% 0; }
          100% { background-position: -60% 0; }
        }

        @keyframes axxLetterSpread {
          0% {
            letter-spacing: 0.12em;
            text-indent: 0.12em;
            filter: blur(4px);
          }
          100% {
            letter-spacing: 0.24em;
            text-indent: 0.24em;
            filter: blur(0px);
          }
        }

        @keyframes axxLaserGrow {
          0% { width: 0px; opacity: 0; }
          50% { opacity: 1; }
          100% { width: 220px; opacity: 0.9; }
        }

        @keyframes axxTaglineFade {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 0.85; transform: translateY(0); }
        }

        @keyframes axxFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes axxProgress {
          0% { width: 0%; }
          30% { width: 45%; }
          75% { width: 85%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Atmospheric lighting */}
      <div className="axx-splash-orb-gold" />
      <div className="axx-splash-orb-blue" />
      <div className="axx-splash-grid" />

      {/* Content */}
      <div className="axx-splash-card">
        <div className="axx-splash-emblem">
          <div className="axx-splash-emblem-ring" />
          <img src={logo} alt="Axxspace Emblem" />
        </div>

        <h1 className="axx-splash-title">AXXSPACE</h1>

        <div className="axx-splash-laser" />

        <p className="axx-splash-tagline">KENYA'S PROPERTY &amp; SPACES NETWORK</p>

        <div className="axx-splash-progress-wrap">
          <div className="axx-splash-progress-bar" />
        </div>
      </div>
    </div>
  );
}
