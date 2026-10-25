import React, { useState, useEffect, useRef } from "react";

/**
 * AxxspaceCar Component
 * A signature animated SUV branded "AXXSPACE" driving smoothly across an animated road.
 *
 * Customization quick-tweaks:
 * - Speed: change `--drive-duration` (default 14s) or `--turbo-drive-duration` (default 6.5s)
 * - Car Size: change `--car-width` (default 260px; mobile 190px)
 * - Road Height: change `--track-height` (default 140px)
 */
export default function AxxspaceCar() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isTurbo, setIsTurbo] = useState(false);

  // Pause animations when off-screen to preserve battery and CPU
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className={`axx-car-track ${isVisible ? "in-view" : "off-screen"} ${isTurbo ? "turbo-mode" : ""}`}
      aria-label="Axxspace signature brand car"
      onMouseEnter={() => setIsTurbo(true)}
      onMouseLeave={() => setIsTurbo(false)}
      onTouchStart={() => setIsTurbo((prev) => !prev)}
    >
      <style>{`
        .axx-car-track {
          --brand-red: #E31B1B;
          --brand-red-dark: #B91C1C;
          --navy-bg: #08101D;
          --navy-card: #0F172A;
          --track-height: 140px;
          --car-width: 250px;
          --drive-duration: 13s;
          --turbo-drive-duration: 6s;
          --road-speed: 1.2s;
          --turbo-road-speed: 0.55s;

          position: relative;
          width: 100%;
          height: var(--track-height);
          background: linear-gradient(180deg, #09121F 0%, #060B14 100%);
          overflow: hidden;
          user-select: none;
          border-top: 1px solid rgba(226, 232, 240, 0.08);
          border-bottom: 1px solid rgba(226, 232, 240, 0.08);
          box-shadow: inset 0 6px 16px rgba(0, 0, 0, 0.35);
        }

        /* Ambient Horizon & Distant Silhouette */
        .axx-car-backdrop {
          position: absolute;
          inset: 0 0 46px 0;
          pointer-events: none;
          opacity: 0.45;
          background: radial-gradient(circle at 50% 100%, rgba(227, 27, 27, 0.12) 0%, transparent 60%);
        }

        .axx-car-skyline {
          position: absolute;
          bottom: 46px;
          left: 0;
          width: 200%;
          height: 38px;
          opacity: 0.22;
          background-repeat: repeat-x;
          background-size: 360px 38px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 38' fill='%2364748B'%3E%3Cpath d='M0 38 L0 26 L18 26 L18 18 L32 18 L32 26 L48 26 L48 10 L62 10 L62 26 L90 26 L90 14 L110 14 L110 26 L130 26 L130 6 L148 6 L148 26 L180 26 L180 16 L205 16 L205 26 L230 26 L230 12 L248 12 L248 26 L270 26 L270 4 L288 4 L288 26 L320 26 L320 18 L340 18 L340 26 L360 26 L360 38 Z'/%3E%3C/svg%3E");
          animation: axxSkylineScroll 45s linear infinite;
        }

        @keyframes axxSkylineScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Road Surface */
        .axx-car-road {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 48px;
          background: #0B111A;
          border-top: 2px solid #1E293B;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.5);
        }

        /* Curb Reflector Stripe */
        .axx-car-curb {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: repeating-linear-gradient(90deg, #EF4444 0px, #EF4444 24px, #FFFFFF 24px, #FFFFFF 48px);
          opacity: 0.85;
        }

        /* Scrolling Road Dash Lines (moving in reverse for speed effect) */
        .axx-car-road-lines {
          position: absolute;
          top: 22px;
          left: 0;
          width: 200%;
          height: 4px;
          background: repeating-linear-gradient(90deg, #F59E0B 0px, #F59E0B 32px, transparent 32px, transparent 72px);
          animation: axxRoadScroll var(--road-speed) linear infinite;
        }

        .axx-car-track.turbo-mode .axx-car-road-lines {
          animation-duration: var(--turbo-road-speed);
        }

        @keyframes axxRoadScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* The Moving Car Wrapper */
        .axx-car-carrier {
          position: absolute;
          bottom: 22px;
          left: 0;
          width: var(--car-width);
          cursor: pointer;
          transform: translateX(-120%);
          animation: axxDriveCross var(--drive-duration) linear infinite;
          will-change: transform;
          z-index: 5;
        }

        .axx-car-track.turbo-mode .axx-car-carrier {
          animation-duration: var(--turbo-drive-duration);
        }

        @keyframes axxDriveCross {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(calc(100vw + 60px));
          }
        }

        /* Body Suspension & Subtle Road Bumps */
        .axx-car-chassis {
          position: relative;
          width: 100%;
          animation: axxSuspension 0.4s ease-in-out infinite alternate;
        }

        .axx-car-track.turbo-mode .axx-car-chassis {
          animation-duration: 0.22s;
        }

        @keyframes axxSuspension {
          0% { transform: translateY(0); }
          100% { transform: translateY(-1.8px); }
        }

        /* Interactive Tooltip */
        .axx-car-tooltip {
          position: absolute;
          top: -34px;
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: rgba(15, 23, 42, 0.95);
          color: #FFFFFF;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 4px 10px;
          border-radius: 999px;
          white-space: nowrap;
          border: 1px solid var(--brand-red);
          box-shadow: 0 4px 14px rgba(227, 27, 27, 0.35);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .axx-car-track.turbo-mode .axx-car-tooltip,
        .axx-car-carrier:hover .axx-car-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Wheel Spin Animation */
        .axx-wheel-spin {
          transform-origin: center;
          animation: axxWheelRotation 0.6s linear infinite;
        }

        .axx-car-track.turbo-mode .axx-wheel-spin {
          animation-duration: 0.25s;
        }

        @keyframes axxWheelRotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Headlight Projected Cone of Light */
        .axx-light-beam {
          opacity: 0.55;
          animation: axxBeamFlicker 2s infinite alternate;
        }

        .axx-car-track.turbo-mode .axx-light-beam {
          opacity: 0.85;
        }

        @keyframes axxBeamFlicker {
          0% { opacity: 0.5; }
          100% { opacity: 0.65; }
        }

        /* Speed Trails Behind Car */
        .axx-speed-line {
          stroke: #E31B1B;
          stroke-dasharray: 14 10;
          opacity: 0.25;
          animation: axxTrailPulse 0.4s linear infinite;
        }

        .axx-car-track.turbo-mode .axx-speed-line {
          opacity: 0.85;
          stroke: #F59E0B;
        }

        @keyframes axxTrailPulse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -24; }
        }

        /* Exhaust Smoke Puffs */
        .axx-exhaust-puff {
          fill: rgba(226, 232, 240, 0.3);
          animation: axxPuff 0.6s ease-out infinite;
        }

        .axx-car-track.turbo-mode .axx-exhaust-puff {
          fill: rgba(245, 158, 11, 0.6);
          animation-duration: 0.3s;
        }

        @keyframes axxPuff {
          0% { transform: scale(0.6) translateX(0); opacity: 0.7; }
          100% { transform: scale(1.6) translateX(-26px); opacity: 0; }
        }

        /* Paused when off-screen */
        .axx-car-track.off-screen * {
          animation-play-state: paused !important;
        }

        /* Reduced Motion Compliance */
        @media (prefers-reduced-motion: reduce) {
          .axx-car-track * {
            animation: none !important;
          }
          .axx-car-carrier {
            left: 50%;
            transform: translateX(-50%) !important;
          }
        }

        /* Responsive Scaling */
        @media (max-width: 768px) {
          .axx-car-track {
            --track-height: 120px;
            --car-width: 200px;
          }
          .axx-car-carrier {
            bottom: 20px;
          }
        }

        @media (max-width: 480px) {
          .axx-car-track {
            --track-height: 105px;
            --car-width: 175px;
          }
          .axx-car-carrier {
            bottom: 18px;
          }
        }
      `}</style>

      {/* Parallax Skyline & Ambient Horizon */}
      <div className="axx-car-backdrop" aria-hidden="true" />
      <div className="axx-car-skyline" aria-hidden="true" />

      {/* Animated Road Track */}
      <div className="axx-car-road" aria-hidden="true">
        <div className="axx-car-curb" />
        <div className="axx-car-road-lines" />
      </div>

      {/* Moving Branded Car */}
      <div className="axx-car-carrier" role="img" aria-label="Axxspace branded SUV driving across the platform">
        <div className="axx-car-tooltip">Axxspace &mdash; Move with us &rarr;</div>

        <div className="axx-car-chassis">
          <svg
            viewBox="0 0 340 120"
            width="100%"
            height="auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
          >
            <defs>
              {/* Headlight Forward Volumetric Light Cone */}
              <linearGradient id="axxHeadlightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </linearGradient>

              {/* Body Paint Gradient: Pristine Pearl White with Chrome Accents */}
              <linearGradient id="axxBodyPaint" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#F8FAFC" />
                <stop offset="80%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>

              {/* Tinted Privacy Glass */}
              <linearGradient id="axxWindowGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0F172A" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#1E293B" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0B1322" stopOpacity="0.98" />
              </linearGradient>

              {/* Brand Red Accent Stripe */}
              <linearGradient id="axxBrandRedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B91C1C" />
                <stop offset="35%" stopColor="#E31B1B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>

              {/* Wheel Rim Gradient */}
              <linearGradient id="axxWheelRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Under-Car Contact Shadow */}
              <radialGradient id="axxContactShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
                <stop offset="65%" stopColor="#000000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              {/* Taillight Glow Filter */}
              <filter id="axxTailGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Volumetric Headlight Light Beam (Projects forward to the right) */}
            <polygon
              className="axx-light-beam"
              points="285,68 440,54 455,95 285,76"
              fill="url(#axxHeadlightBeam)"
              aria-hidden="true"
            />

            {/* 2. Speed / Turbo Lines Behind Car */}
            <g aria-hidden="true">
              <line x1="-15" y1="56" x2="35" y2="56" strokeWidth="2.5" className="axx-speed-line" />
              <line x1="-30" y1="66" x2="28" y2="66" strokeWidth="2" className="axx-speed-line" />
              <line x1="-20" y1="76" x2="40" y2="76" strokeWidth="2" className="axx-speed-line" />
              {/* Exhaust Puffs */}
              <circle cx="28" cy="85" r="5" className="axx-exhaust-puff" />
              <circle cx="20" cy="84" r="7" className="axx-exhaust-puff" style={{ animationDelay: "-0.2s" }} />
            </g>

            {/* 3. Soft Contact Shadow under Wheels */}
            <ellipse cx="165" cy="100" rx="135" ry="9" fill="url(#axxContactShadow)" aria-hidden="true" />

            {/* 4. Car Body: Sleek Modern Aerodynamic SUV Profile */}
            {/* Main Upper Cabin & Roof Rails */}
            <path
              d="M85 36 L130 18 L220 18 L258 48 L278 54 L288 64 L288 80 L275 80 
                 A 22 22 0 0 0 231 80 L115 80 
                 A 22 22 0 0 0 71 80 L42 80 L38 68 L48 48 Z"
              fill="url(#axxBodyPaint)"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />

            {/* Glossy Black Roof & Aerodynamic Rear Spoiler */}
            <path
              d="M72 38 L128 17 L226 17 L224 22 L128 22 L80 40 Z"
              fill="#0F172A"
            />
            {/* Sport Roof Rails */}
            <line x1="125" y1="15" x2="218" y2="15" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="140" y1="15" x2="140" y2="18" stroke="#64748B" strokeWidth="2" />
            <line x1="205" y1="15" x2="205" y2="18" stroke="#64748B" strokeWidth="2" />

            {/* Tinted Side Glass / Windows (Sleek Coupe-SUV Glasshouse) */}
            <path
              d="M94 38 L134 23 L180 23 L180 48 L94 48 Z"
              fill="url(#axxWindowGlass)"
              stroke="#0F172A"
              strokeWidth="1.5"
            />
            <path
              d="M185 23 L220 23 L250 48 L185 48 Z"
              fill="url(#axxWindowGlass)"
              stroke="#0F172A"
              strokeWidth="1.5"
            />
            {/* Rear Quarter Privacy Glass */}
            <path
              d="M75 42 L90 38 L90 48 L68 48 Z"
              fill="url(#axxWindowGlass)"
            />

            {/* Window Glass Reflection Highlights */}
            <line x1="110" y1="25" x2="160" y2="46" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.45" />
            <line x1="195" y1="25" x2="235" y2="46" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.45" />

            {/* Pillar Dividers (B & C Pillars in Gloss Piano Black) */}
            <rect x="180" y="22" width="5" height="26" fill="#08101D" />

            {/* Body Aerodynamic Crease Line */}
            <path
              d="M50 56 Q160 52 284 66"
              stroke="#94A3B8"
              strokeWidth="1.2"
              fill="none"
              strokeOpacity="0.7"
            />

            {/* Signature Axxspace Crimson Lower Rocker Stripe */}
            <path
              d="M42 78 L71 78 A 22 22 0 0 1 115 78 L231 78 A 22 22 0 0 1 275 78 L286 78 L286 82 L42 82 Z"
              fill="url(#axxBrandRedGrad)"
            />

            {/* 5. Signature "AXXSPACE" Flank Decal Branding */}
            <g transform="translate(120, 68)">
              {/* Backplate Plaque */}
              <rect x="-4" y="-12" width="98" height="15" rx="3" fill="#0F172A" opacity="0.9" />
              <rect x="-4" y="-12" width="98" height="15" rx="3" fill="none" stroke="url(#axxBrandRedGrad)" strokeWidth="1" />
              {/* Bold Lettering */}
              <text
                x="45"
                y="-1"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9.5"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="2.2px"
              >
                AXXSPACE
              </text>
            </g>

            {/* Side Mirrors with LED Turn Signal */}
            <path d="M228 47 L238 46 L242 50 L230 51 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.8" />
            <line x1="234" y1="48" x2="240" y2="48" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />

            {/* Door Handles */}
            <rect x="145" y="52" width="14" height="2.5" rx="1.2" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.5" />
            <rect x="200" y="52" width="14" height="2.5" rx="1.2" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.5" />

            {/* 6. Front Fascia: Sport Bumper, Headlight & LED DRL */}
            {/* Chrome Front Grille Accents */}
            <rect x="282" y="70" width="4" height="6" rx="1" fill="#1E293B" stroke="#94A3B8" strokeWidth="0.5" />
            {/* LED Headlight Optical Cluster */}
            <path
              d="M266 57 L285 64 L284 71 L268 67 Z"
              fill="#F8FAFC"
              stroke="#38BDF8"
              strokeWidth="1"
            />
            <circle cx="277" cy="66" r="3.2" fill="#FFFBEB" filter="url(#axxTailGlow)" />

            {/* 7. Rear Fascia: Ruby LED Taillight Bar */}
            <path
              d="M39 58 L49 58 L46 64 L37 64 Z"
              fill="#EF4444"
              filter="url(#axxTailGlow)"
            />
            {/* Dual Chrome Exhaust Tips */}
            <ellipse cx="38" cy="82" rx="3.5" ry="2.2" fill="#1E293B" stroke="#CBD5E1" strokeWidth="1" />

            {/* 8. Wheels: Detailed Alloy Rims with Spinning Spokes */}
            {/* REAR WHEEL (Center at X: 93, Y: 80) */}
            <g transform="translate(93, 80)">
              {/* Outer Rubber Tire */}
              <circle cx="0" cy="0" r="19" fill="#0B1322" stroke="#1E293B" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="15" fill="#1E293B" />
              {/* Red Brake Caliper */}
              <path d="M-6 -10 A 11 11 0 0 1 6 -10 L4 -6 A 8 8 0 0 0 -4 -6 Z" fill="#EF4444" />
              {/* Rotating 5-Spoke Alloy Rim */}
              <g className="axx-wheel-spin">
                <circle cx="0" cy="0" r="13" fill="none" stroke="url(#axxWheelRim)" strokeWidth="2" />
                {/* 5 Rims/Spokes */}
                <line x1="0" y1="0" x2="0" y2="-12" stroke="url(#axxWheelRim)" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="0" x2="11.4" y2="-3.7" stroke="url(#axxWheelRim)" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="0" x2="7" y2="9.7" stroke="url(#axxWheelRim)" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="0" x2="-7" y2="9.7" stroke="url(#axxWheelRim)" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="0" x2="-11.4" y2="-3.7" stroke="url(#axxWheelRim)" strokeWidth="2.4" strokeLinecap="round" />
                {/* Center Hub Cap */}
                <circle cx="0" cy="0" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.8" />
              </g>
            </g>

            {/* FRONT WHEEL (Center at X: 253, Y: 80) */}
            <g transform="translate(253, 80)">
              {/* Outer Rubber Tire */}
              <circle cx="0" cy="0" r="19" fill="#0B1322" stroke="#1E293B" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="15" fill="#1E293B" />
              {/* Red Brake Caliper */}
              <path d="M-6 -10 A 11 11 0 0 1 6 -10 L4 -6 A 8 8 0 0 0 -4 -6 Z" fill="#EF4444" />
              {/* Rotating 5-Spoke Alloy Rim */}
              <g className="axx-wheel-spin">
                <circle cx="0" cy="0" r="13" fill="none" stroke="url(#axxWheelRim)" strokeWidth="2" />
                {/* 5 Rims/Spokes */}
                <line x1="0" y1="0" x2="0" y2="-12" stroke="url(#axxWheelRim)" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="0" x2="11.4" y2="-3.7" stroke="url(#axxWheelRim)" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="0" x2="7" y2="9.7" stroke="url(#axxWheelRim)" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="0" x2="-7" y2="9.7" stroke="url(#axxWheelRim)" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="0" y1="0" x2="-11.4" y2="-3.7" stroke="url(#axxWheelRim)" strokeWidth="2.4" strokeLinecap="round" />
                {/* Center Hub Cap */}
                <circle cx="0" cy="0" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.8" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
