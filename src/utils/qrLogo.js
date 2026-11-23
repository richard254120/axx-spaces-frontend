import QRCode from "qrcode";

/**
 * Draws the AxxSpace icon cleanly in the exact center of a QR code canvas.
 * For reliable scanning, the QR code MUST be generated with errorCorrectionLevel: "H".
 *
 * @param {HTMLCanvasElement} canvas - The canvas containing the rendered QR code.
 * @param {Object} [options]
 * @param {string} [options.logoSrc] - Path or URL to the logo image (defaults to /logo.png).
 * @param {number} [options.ratio] - Size ratio relative to canvas width (default: 0.22, ideal for scanning).
 * @param {string} [options.backgroundColor] - Badge background color (default: #ffffff).
 * @param {boolean} [options.shadow] - Whether to render a subtle elevation shadow (default: true).
 * @returns {Promise<void>}
 */
export const drawQrCenterLogo = (canvas, options = {}) => {
  return new Promise((resolve) => {
    if (!canvas) return resolve();
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve();

    const {
      logoSrc = "/logo.png",
      ratio = 0.22,
      backgroundColor = "#ffffff",
      shadow = true,
    } = options;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const cw = canvas.width;
      const ch = canvas.height;

      // Center badge sizing: ~22% of QR width is optimal for High error correction (H allows up to 30% coverage)
      const badgeSize = Math.round(cw * ratio);
      const bx = (cw - badgeSize) / 2;
      const by = (ch - badgeSize) / 2;
      const radius = Math.round(badgeSize * 0.22);

      // 1. Draw rounded white background card with clean drop shadow
      ctx.save();
      if (shadow) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
        ctx.shadowBlur = Math.round(badgeSize * 0.12);
        ctx.shadowOffsetY = Math.round(badgeSize * 0.04);
      }

      ctx.beginPath();
      ctx.moveTo(bx + radius, by);
      ctx.lineTo(bx + badgeSize - radius, by);
      ctx.quadraticCurveTo(bx + badgeSize, by, bx + badgeSize, by + radius);
      ctx.lineTo(bx + badgeSize, by + badgeSize - radius);
      ctx.quadraticCurveTo(bx + badgeSize, by + badgeSize, bx + badgeSize - radius, by + badgeSize);
      ctx.lineTo(bx + radius, by + badgeSize);
      ctx.quadraticCurveTo(bx, by + badgeSize, bx, by + badgeSize - radius);
      ctx.lineTo(bx, by + radius);
      ctx.quadraticCurveTo(bx, by, bx + radius, by);
      ctx.closePath();

      ctx.fillStyle = backgroundColor;
      ctx.fill();
      ctx.restore();

      // 2. Subtle crisp border around the white badge
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx + radius, by);
      ctx.lineTo(bx + badgeSize - radius, by);
      ctx.quadraticCurveTo(bx + badgeSize, by, bx + badgeSize, by + radius);
      ctx.lineTo(bx + badgeSize, by + badgeSize - radius);
      ctx.quadraticCurveTo(bx + badgeSize, by + badgeSize, bx + badgeSize - radius, by + badgeSize);
      ctx.lineTo(bx + radius, by + badgeSize);
      ctx.quadraticCurveTo(bx, by + badgeSize, bx, by + badgeSize - radius);
      ctx.lineTo(bx, by + radius);
      ctx.quadraticCurveTo(bx, by, bx + radius, by);
      ctx.closePath();
      ctx.strokeStyle = "rgba(8, 26, 52, 0.12)";
      ctx.lineWidth = Math.max(1, Math.round(badgeSize * 0.025));
      ctx.stroke();
      ctx.restore();

      // 3. Draw the AxxSpace logo centered inside with safe padding
      const padding = Math.round(badgeSize * 0.12);
      const logoSize = badgeSize - padding * 2;
      const lx = bx + padding;
      const ly = by + padding;

      // Clip logo slightly with rounded corners to keep it neatly inside the badge
      ctx.save();
      const innerRadius = Math.max(2, radius - Math.round(padding * 0.5));
      ctx.beginPath();
      ctx.moveTo(lx + innerRadius, ly);
      ctx.lineTo(lx + logoSize - innerRadius, ly);
      ctx.quadraticCurveTo(lx + logoSize, ly, lx + logoSize, ly + innerRadius);
      ctx.lineTo(lx + logoSize, ly + logoSize - innerRadius);
      ctx.quadraticCurveTo(lx + logoSize, ly + logoSize, lx + logoSize - innerRadius, ly + logoSize);
      ctx.lineTo(lx + innerRadius, ly + logoSize);
      ctx.quadraticCurveTo(lx, ly + logoSize, lx, ly + logoSize - innerRadius);
      ctx.lineTo(lx, ly + innerRadius);
      ctx.quadraticCurveTo(lx, ly, lx + innerRadius, ly);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, lx, ly, logoSize, logoSize);
      ctx.restore();

      resolve();
    };

    img.onerror = () => {
      console.warn("Failed to load QR logo:", logoSrc);
      resolve();
    };

    img.src = logoSrc;
  });
};

/**
 * Generates a branded QR Code Data URL with the AxxSpace icon embedded in the center.
 *
 * @param {string} text - URL or text to encode.
 * @param {Object} [qrOptions] - QRCode library options (width, color, margin, etc.).
 * @param {Object} [logoOptions] - Logo badge options.
 * @returns {Promise<string>} - Returns base64 PNG data URL.
 */
export const generateBrandedQrDataUrl = async (text, qrOptions = {}, logoOptions = {}) => {
  const canvas = document.createElement("canvas");
  const width = qrOptions.width || 360;

  await QRCode.toCanvas(canvas, text, {
    width,
    margin: qrOptions.margin ?? 1.5,
    errorCorrectionLevel: "H", // High error correction (30%) is mandatory for center logos
    color: {
      dark: qrOptions.color?.dark || "#081A34",
      light: qrOptions.color?.light || "#ffffff",
    },
  });

  await drawQrCenterLogo(canvas, logoOptions);
  return canvas.toDataURL("image/png");
};
