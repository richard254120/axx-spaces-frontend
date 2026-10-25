import React, { useState, useEffect, useRef } from "react";

/**
 * AnimatedBackdrop Component
 * 
 * A soft, dimmed, cinematic looping animated background representing Axxspace's
 * 4 flagship services: AxxBiashara, QuickSales, Rentals, and Accommodation.
 *
 * Props:
 * - variant: "all" (default) | "biashara" | "quicksales" | "rentals" | "accommodation"
 * - mode: "fixed" (default, full screen) | "hero" (absolute, inside hero parent)
 * - dimness: number between 0.2 and 0.9 (default 0.65 = 65% dim overlay)
 * - videoSrc: optional string URL/import to a looping MP4 video
 * - poster: optional fallback poster image URL
 */
export default function AnimatedBackdrop({
  variant = "all",
  mode = "fixed",
  dimness = 0.65,
  videoSrc,
  poster,
  className = "",
}) {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [saveDataActive, setSaveDataActive] = useState(false);

  // Check Data Saver mode on client
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.connection &&
      navigator.connection.saveData
    ) {
      setSaveDataActive(true);
    }
  }, []);

  // Performance: Pause when tab is inactive or element is off-screen
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    let observer = null;
    const el = containerRef.current;
    if (el && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsPaused(!entry.isIntersecting);
        },
        { rootMargin: "80px" }
      );
      observer.observe(el);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (observer && el) observer.unobserve(el);
    };
  }, []);

  const shouldRenderVideo = Boolean(videoSrc && !videoError && !saveDataActive);

  return (
    <div
      ref={containerRef}
      className={`axx-backdrop-root ${mode === "hero" ? "mode-hero" : "mode-fixed"} ${
        isPaused ? "is-paused" : ""
      } ${className}`}
      aria-hidden="true"
      style={{
        "--dim-opacity": dimness,
      }}
    >
      <style>{`
        .axx-backdrop-root {
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          background: #08101D;
          user-select: none;
        }

        .axx-backdrop-root.mode-fixed {
          position: fixed;
          z-index: 0;
        }

        .axx-backdrop-root.mode-hero {
          position: absolute;
          z-index: 0;
        }

        /* ── Base Ambient Mesh ── */
        .axx-bg-mesh {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 25%, #112035 0%, #08101D 85%);
          overflow: hidden;
        }

        /* Ambient Color Blobs */
        .axx-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(85px);
          opacity: 0.5;
          pointer-events: none;
          will-change: transform;
        }

        .axx-blob-1 {
          top: -10%;
          left: 15%;
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, rgba(227, 27, 27, 0.28) 0%, transparent 70%);
          animation: axxDriftOne 32s ease-in-out infinite alternate;
        }

        .axx-blob-2 {
          top: 35%;
          right: 10%;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, transparent 70%);
          animation: axxDriftTwo 38s ease-in-out infinite alternate;
        }

        .axx-blob-3 {
          bottom: -15%;
          left: 30%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%);
          animation: axxDriftThree 35s ease-in-out infinite alternate;
        }

        .axx-blob-4 {
          top: 50%;
          left: 5%;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%);
          animation: axxDriftFour 42s ease-in-out infinite alternate;
        }

        @keyframes axxDriftOne {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(80px, 40px, 0) scale(1.12); }
          100% { transform: translate3d(-40px, 70px, 0) scale(0.95); }
        }

        @keyframes axxDriftTwo {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-90px, -50px, 0) scale(1.1); }
          100% { transform: translate3d(50px, -30px, 0) scale(0.92); }
        }

        @keyframes axxDriftThree {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-60px, -60px, 0) scale(1.08); }
          100% { transform: translate3d(70px, 30px, 0) scale(0.96); }
        }

        @keyframes axxDriftFour {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(50px, -40px, 0) scale(1.05); }
          100% { transform: translate3d(-30px, 40px, 0) scale(1.14); }
        }

        /* ── Subtle Light Sweep Beam ── */
        .axx-light-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 42%,
            rgba(255, 255, 255, 0.035) 48%,
            rgba(227, 27, 27, 0.04) 50%,
            rgba(255, 255, 255, 0.035) 52%,
            transparent 58%,
            transparent 100%
          );
          opacity: 0.7;
          transform: translateX(-100%);
          animation: axxSweep 18s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes axxSweep {
          0%, 65% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }

        /* ── Optional Video Layer ── */
        .axx-bg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.35;
          mix-blend-mode: luminosity;
        }

        /* ── Dim Overlay & Vignette ── */
        .axx-dim-overlay {
          position: absolute;
          inset: 0;
          background: rgba(8, 16, 29, var(--dim-opacity, 0.65));
        }

        .axx-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, transparent 35%, rgba(6, 11, 20, 0.8) 100%);
          pointer-events: none;
        }

        /* ── Themed Service Floating Icons ── */
        .axx-icons-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .axx-f-icon {
          position: absolute;
          stroke: #94A3B8;
          fill: none;
          stroke-width: 1.4;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0.08;
          transition: opacity 0.5s ease;
          animation: axxIconFloat 16s ease-in-out infinite alternate;
        }

        /* Service Highlight Variants */
        .axx-f-icon.biashara {
          --hl-color: #F59E0B;
        }
        .axx-f-icon.quicksales {
          --hl-color: #E31B1B;
        }
        .axx-f-icon.rentals {
          --hl-color: #38BDF8;
        }
        .axx-f-icon.accommodation {
          --hl-color: #10B981;
        }

        ${
          variant !== "all"
            ? `
          .axx-f-icon.${variant} {
            opacity: 0.17 !important;
            stroke: var(--hl-color, #E31B1B) !important;
            filter: drop-shadow(0 0 6px rgba(227, 27, 27, 0.25));
          }
          .axx-f-icon:not(.${variant}) {
            opacity: 0.04 !important;
          }
        `
            : ""
        }

        @keyframes axxIconFloat {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(12px, -18px, 0) rotate(2deg);
          }
          100% {
            transform: translate3d(-10px, 12px, 0) rotate(-2deg);
          }
        }

        /* Floating Soft Dust Particles */
        .axx-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #FFFFFF;
          opacity: 0.25;
          animation: axxParticleDrift 14s ease-in-out infinite alternate;
        }

        @keyframes axxParticleDrift {
          0% { transform: translateY(0) scale(0.8); opacity: 0.15; }
          50% { transform: translateY(-35px) scale(1.3); opacity: 0.45; }
          100% { transform: translateY(-70px) scale(0.8); opacity: 0.1; }
        }

        /* ── Paused State (When inactive or off-screen) ── */
        .axx-backdrop-root.is-paused * {
          animation-play-state: paused !important;
        }

        /* ── Reduced Motion Accessibility ── */
        @media (prefers-reduced-motion: reduce) {
          .axx-backdrop-root * {
            animation: none !important;
          }
        }

        /* ── Mobile Optimizations ── */
        @media (max-width: 768px) {
          .axx-blob {
            filter: blur(48px);
          }
          .axx-f-icon.mobile-hidden {
            display: none;
          }
        }
      `}</style>

      {/* 1. Deep Ambient Mesh Layer */}
      <div className="axx-bg-mesh">
        <div className="axx-blob axx-blob-1" />
        <div className="axx-blob axx-blob-2" />
        <div className="axx-blob axx-blob-3" />
        <div className="axx-blob axx-blob-4" />
      </div>

      {/* 2. Optional Looping Video Layer */}
      {shouldRenderVideo && (
        <video
          className="axx-bg-video"
          src={videoSrc}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        />
      )}

      {/* 3. Subtle Luminous Sweep Beam */}
      <div className="axx-light-sweep" />

      {/* 4. Dimming & Vignette Overlays */}
      <div className="axx-dim-overlay" />
      <div className="axx-vignette" />

      {/* 5. Floating Service Themed Vector Icons */}
      <div className="axx-icons-layer">
        {/* ── AxxBiashara (Business) ── */}
        {/* Storefront */}
        <svg
          className="axx-f-icon biashara"
          style={{ top: "16%", left: "12%", width: 34, height: 34, animationDuration: "18s" }}
          viewBox="0 0 24 24"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>

        {/* Briefcase */}
        <svg
          className="axx-f-icon biashara mobile-hidden"
          style={{ top: "68%", left: "78%", width: 32, height: 32, animationDuration: "22s" }}
          viewBox="0 0 24 24"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>

        {/* Growth Chart */}
        <svg
          className="axx-f-icon biashara"
          style={{ top: "34%", right: "18%", width: 30, height: 30, animationDuration: "24s" }}
          viewBox="0 0 24 24"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <path d="M4 18l8-8 4 4 6-6" />
        </svg>

        {/* ── QuickSales (Marketplace & Selling) ── */}
        {/* Price Tag */}
        <svg
          className="axx-f-icon quicksales"
          style={{ top: "25%", right: "28%", width: 32, height: 32, animationDuration: "20s" }}
          viewBox="0 0 24 24"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5" />
        </svg>

        {/* Lightning Bolt */}
        <svg
          className="axx-f-icon quicksales mobile-hidden"
          style={{ top: "58%", left: "22%", width: 28, height: 28, animationDuration: "17s" }}
          viewBox="0 0 24 24"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>

        {/* Shopping Bag */}
        <svg
          className="axx-f-icon quicksales"
          style={{ top: "82%", right: "36%", width: 30, height: 30, animationDuration: "25s" }}
          viewBox="0 0 24 24"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>

        {/* ── Rentals (Residential Properties) ── */}
        {/* House */}
        <svg
          className="axx-f-icon rentals"
          style={{ top: "45%", left: "6%", width: 36, height: 36, animationDuration: "21s" }}
          viewBox="0 0 24 24"
        >
          <path d="M3 10.5L12 3l9 7.5" />
          <path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
          <rect x="9" y="14" width="6" height="7" />
        </svg>

        {/* Key */}
        <svg
          className="axx-f-icon rentals mobile-hidden"
          style={{ top: "78%", left: "42%", width: 30, height: 30, animationDuration: "19s" }}
          viewBox="0 0 24 24"
        >
          <path d="M21 2l-2 2m-1.5 1.5L14 9l-2-2-4 4 3 3-5 5H2v-4l5-5 3 3 4-4-2-2 3.5-3.5" />
          <circle cx="17.5" cy="6.5" r="2.5" />
        </svg>

        {/* Apartment Building */}
        <svg
          className="axx-f-icon rentals"
          style={{ top: "12%", right: "8%", width: 34, height: 34, animationDuration: "23s" }}
          viewBox="0 0 24 24"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="9" y1="6" x2="9.01" y2="6" strokeWidth="2" />
          <line x1="15" y1="6" x2="15.01" y2="6" strokeWidth="2" />
          <line x1="9" y1="10" x2="9.01" y2="10" strokeWidth="2" />
          <line x1="15" y1="10" x2="15.01" y2="10" strokeWidth="2" />
          <line x1="9" y1="14" x2="9.01" y2="14" strokeWidth="2" />
          <line x1="15" y1="14" x2="15.01" y2="14" strokeWidth="2" />
          <path d="M10 22v-4h4v4" />
        </svg>

        {/* ── Accommodation (Stays & Lodges) ── */}
        {/* Luxury Bed */}
        <svg
          className="axx-f-icon accommodation"
          style={{ top: "52%", right: "12%", width: 34, height: 34, animationDuration: "20s" }}
          viewBox="0 0 24 24"
        >
          <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v3" />
          <circle cx="6" cy="11" r="1.5" />
        </svg>

        {/* Map Pin */}
        <svg
          className="axx-f-icon accommodation mobile-hidden"
          style={{ top: "86%", left: "14%", width: 28, height: 28, animationDuration: "16s" }}
          viewBox="0 0 24 24"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>

        {/* Hotel Building */}
        <svg
          className="axx-f-icon accommodation"
          style={{ top: "28%", left: "48%", width: 32, height: 32, animationDuration: "26s" }}
          viewBox="0 0 24 24"
        >
          <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
          <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3" />
        </svg>
      </div>

      {/* 6. Faint Ambient Floating Dust Particles */}
      <div className="axx-particle" style={{ top: "22%", left: "28%", animationDelay: "-2s" }} />
      <div className="axx-particle" style={{ top: "48%", right: "24%", animationDelay: "-6s" }} />
      <div className="axx-particle" style={{ top: "72%", left: "54%", animationDelay: "-9s" }} />
      <div className="axx-particle" style={{ top: "84%", right: "16%", animationDelay: "-4s" }} />
      <div className="axx-particle" style={{ top: "36%", left: "80%", animationDelay: "-11s" }} />
    </div>
  );
}
