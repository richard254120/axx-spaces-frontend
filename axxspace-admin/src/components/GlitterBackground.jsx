import "./GlitterBackground.css";

export default function GlitterBackground() {
  // Sparkle colors: white, gold, cyan, purple
  const sparkleColors = [
    "rgba(255, 255, 255, 0.9)",    // white
    "rgba(251, 191, 36, 0.8)",     // gold
    "rgba(34, 211, 238, 0.7)",     // cyan
    "rgba(167, 139, 250, 0.6)"     // purple
  ];

  // Sparkle sizes: 2-6px (small), 6-10px (medium), 10-16px (large)
  const sparkleSize = () => {
    const rand = Math.random();
    if (rand < 0.4) return Math.random() * 4 + 2;      // 2-6px small
    if (rand < 0.7) return Math.random() * 4 + 6;      // 6-10px medium
    return Math.random() * 6 + 10;                      // 10-16px large
  };

  // Animation durations for sparkles: 2s-6s
  const sparkleAnimationDuration = () => Math.random() * 4 + 2;

  // Generate 30 sparkle elements
  const sparkles = Array.from({ length: 30 }, (_, i) => {
    const size = sparkleSize();
    const duration = sparkleAnimationDuration();
    const delay = Math.random() * 6;
    const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];

    return {
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`
    };
  });

  // Splash colors: gold, blue, purple, cyan with low opacity
  const splashColors = [
    "rgba(251, 191, 36, 0.2)",     // gold
    "rgba(59, 130, 246, 0.2)",     // blue
    "rgba(139, 92, 246, 0.2)",     // purple
    "rgba(6, 182, 212, 0.2)"       // cyan
  ];

  // Animation durations for splashes: 4s-10s
  const splashAnimationDuration = () => Math.random() * 6 + 4;

  // Generate 8 splash elements
  const splashes = Array.from({ length: 8 }, (_, i) => {
    const duration = splashAnimationDuration();
    const delay = Math.random() * 10;
    const color = splashColors[Math.floor(Math.random() * splashColors.length)];
    const size = Math.random() * 100 + 80;  // 80-180px

    return {
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: `radial-gradient(circle, ${color}, transparent)`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`
    };
  });

  return (
    <div className="glitter-bg">
      {/* Sparkle particles */}
      {sparkles.map((sparkle) => (
        <span
          key={`sparkle-${sparkle.id}`}
          className="sparkle"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: sparkle.width,
            height: sparkle.height,
            backgroundColor: sparkle.backgroundColor,
            animationDuration: sparkle.animationDuration,
            animationDelay: sparkle.animationDelay
          }}
        />
      ))}

      {/* Splash burst particles */}
      {splashes.map((splash) => (
        <div
          key={`splash-${splash.id}`}
          className="splash"
          style={{
            top: splash.top,
            left: splash.left,
            width: splash.width,
            height: splash.height,
            background: splash.background,
            animationDuration: splash.animationDuration,
            animationDelay: splash.animationDelay
          }}
        />
      ))}
    </div>
  );
}
