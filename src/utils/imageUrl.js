// ─────────────────────────────────────────────────────────────────────────────
//  IMAGE DELIVERY
//
//  Uploads land on Cloudinary at full camera resolution (often 3–8 MB). Storing
//  the original is fine, but serving it into a 320px card is what makes the site
//  feel slow. These helpers rewrite Cloudinary URLs on the fly so the CDN returns
//  an AVIF/WebP at (roughly) the pixel size the layout actually needs.
//
//  Usage:
//    <img src={optimizeImage(url, IMG_WIDTH.card)} loading="lazy" decoding="async" />
//    <img src={optimizeImage(url, IMG_WIDTH.card)} srcSet={imageSrcSet(url)} sizes="..." />
// ─────────────────────────────────────────────────────────────────────────────

/** Pixel widths used across the site. Keep them in one place so quality is predictable. */
export const IMG_WIDTH = {
  thumb: 160,   // table rows, avatars, small chips
  card: 480,    // listing cards, gallery thumbnails
  panel: 900,   // modal / sidebar previews
  hero: 1600,   // detail-page hero, full-bleed banners
};

const DEFAULT_SRCSET_WIDTHS = [320, 480, 800, 1200];

const CLOUDINARY_IMAGE_RE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i;

/**
 * Returns a Cloudinary URL that delivers an auto-format, auto-quality,
 * width-capped version of the asset. Anything that is not a plain
 * Cloudinary image URL (already transformed, local /uploads, data:, blob:,
 * third-party CDN) is returned untouched.
 */
export function optimizeImage(url, width = IMG_WIDTH.card, options = {}) {
  if (!url || typeof url !== "string") return "";

  const clean = url.trim();
  if (!clean) return "";

  const match = clean.match(CLOUDINARY_IMAGE_RE);
  if (!match) return clean;

  const [, prefix, rest] = match;

  // Never double-apply transforms if the URL already carries one
  const firstSegment = rest.split("/")[0];
  if (/^(f_|q_|w_|c_)/.test(firstSegment) || firstSegment.includes("f_auto")) {
    return clean;
  }

  const {
    quality = "auto:good",
    crop = "limit",
    dpr = true,
  } = options;

  const transform = ["f_auto", `q_${quality}`];
  if (width) {
    transform.push(`w_${Math.round(width)}`, `c_${crop}`);
  }
  if (dpr) {
    transform.push("dpr_auto");
  }

  return `${prefix}${transform.join(",")}/${rest}`;
}

/**
 * Builds a srcSet so the browser can pick the smallest file that still looks
 * sharp on the visitor's screen. Returns "" for non-Cloudinary URLs.
 */
export function imageSrcSet(url, widths = DEFAULT_SRCSET_WIDTHS) {
  if (!url || typeof url !== "string") return "";
  if (!CLOUDINARY_IMAGE_RE.test(url.trim())) return "";

  return widths
    .map((w) => `${optimizeImage(url, w)} ${w}w`)
    .join(", ");
}

/**
 * Convenience wrapper for the very common "render a listing photo" case.
 * Handles both `"https://…"` strings and `{ imageUrl }` / `{ url }` objects
 * that the API returns for some collections.
 */
export function listingImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.imageUrl || image.url || "";
}

/** Placeholder used while a photo is still decoding, or when it fails. */
export const IMAGE_FALLBACK =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='360'%3E%3Crect width='480' height='360' fill='%231e293b'/%3E%3Cpath d='M180 230l50-60 40 45 30-35 50 60z' fill='%23334155'/%3E%3Ccircle cx='200' cy='150' r='16' fill='%23334155'/%3E%3C/svg%3E";
