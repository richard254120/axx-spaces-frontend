import { useEffect, useState } from "react";
import logo from "../assets/image.png";

export default function SplashScreen({ isReady = true, onComplete, minDuration = 4000 }) {
  const [canExit, setCanExit] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show animation for about 4 seconds
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
      }, 600); // Smooth exit fade
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
        .axx-splash-root {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: radial-gradient(circle at 50% 45%, #0e1a30 0%, #070d19 55%, #03060c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                      filter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: auto;
          user-select: none;
        }

        .axx-splash-leave {
          opacity: 0 !important;
          transform: scale(1.05) !important;
          filter: blur(10px) !important;
          pointer-events: none !important;
        }

        /* Ambient glowing orbs */
        .axx-splash-orb-gold {
          position: absolute;
          width: 580px;
          height: 580px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.08) 45%, transparent 70%);
          filter: blur(70px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: axxOrbPulse 4s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .axx-splash-orb-blue {
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, transparent 65%);
          filter: blur(90px);
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
          background-size: 52px 52px;
          mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
          pointer-events: none;
        }

        /* Center card */
        .axx-splash-card {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
        }

        /* App Logo Pedestal Container */
        .axx-splash-emblem {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 34px;
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95));
          border: 1.5px solid rgba(245, 158, 11, 0.4);
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.55),
            0 0 60px rgba(245, 158, 11, 0.28),
            inset 0 1px 1px rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: axxEmblemEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards,
                     axxEmblemFloat 4s ease-in-out 1.2s infinite alternate;
        }

        .axx-splash-emblem img {
          width: 76px;
          height: 76px;
          object-fit: contain;
          filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.6));
          animation: axxLogoShine 3s ease-in-out infinite;
        }

        /* Luminous orbital rings */
        .axx-splash-emblem-ring {
          position: absolute;
          inset: -7px;
          border-radius: 40px;
          border: 1px dashed rgba(251, 191, 36, 0.3);
          animation: axxRingRotate 12s linear infinite;
        }

        .axx-splash-emblem-halo {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%);
          filter: blur(14px);
          pointer-events: none;
          animation: axxHaloBreathe 3s ease-in-out infinite alternate;
        }

        /* Minimal Luxury Micro-Progress Beam */
        .axx-splash-progress-wrap {
          width: 130px;
          height: 2.5px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 36px;
          opacity: 0;
          animation: axxFadeIn 0.8s ease 0.4s forwards;
        }

        .axx-splash-progress-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #d97706, #fbbf24, #ffffff);
          box-shadow: 0 0 12px rgba(251, 191, 36, 0.85);
          border-radius: 999px;
          animation: axxProgress 3.8s cubic-bezier(0.3, 0, 0.2, 1) 0.2s forwards;
        }

        /* Keyframes */
        @keyframes axxEmblemEntrance {
          0% {
            opacity: 0;
            transform: scale(0.65) translateY(24px);
            filter: blur(12px);
          }
          65% {
            transform: scale(1.06) translateY(-4px);
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }

        @keyframes axxEmblemFloat {
          0% {
            transform: translateY(0) scale(1);
            box-shadow:
              0 20px 50px rgba(0, 0, 0, 0.55),
              0 0 50px rgba(245, 158, 11, 0.25);
          }
          100% {
            transform: translateY(-8px) scale(1.03);
            box-shadow:
              0 26px 60px rgba(0, 0, 0, 0.65),
              0 0 75px rgba(245, 158, 11, 0.38);
          }
        }

        @keyframes axxLogoShine {
          0%, 100% {
            filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.6)) brightness(1);
          }
          50% {
            filter: drop-shadow(0 6px 22px rgba(245, 158, 11, 0.6)) brightness(1.12);
          }
        }

        @keyframes axxHaloBreathe {
          0% {
            opacity: 0.45;
            transform: scale(0.9);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.15);
          }
        }

        @keyframes axxRingRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes axxOrbPulse {
          0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.65; }
          100% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.95; }
        }

        @keyframes axxFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes axxProgress {
          0% { width: 0%; }
          30% { width: 35%; }
          70% { width: 75%; }
          95% { width: 96%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Atmospheric lighting */}
      <div className="axx-splash-orb-gold" />
      <div className="axx-splash-orb-blue" />
      <div className="axx-splash-grid" />

      {/* Content: App Logo centered without text */}
      <div className="axx-splash-card">
        <div className="axx-splash-emblem">
          <div className="axx-splash-emblem-halo" />
          <div className="axx-splash-emblem-ring" />
          <img src={logo} alt="Axxspace Logo" />
        </div>

        {/* Minimalist 4-second loading beam */}
        <div className="axx-splash-progress-wrap">
          <div className="axx-splash-progress-bar" />
        </div>
      </div>
    </div>
  );
}
