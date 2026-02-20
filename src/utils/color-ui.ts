/** Returns true when the hex color has enough luminance to need dark text. */
export function isLightColor(hex: string): boolean {
  if (typeof hex !== 'string' || hex.length !== 7 || hex[0] !== '#') return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
  return 0.299 * (r / 255) + 0.587 * (g / 255) + 0.114 * (b / 255) > 0.5;
}

/** Converts a 6-digit hex color to an rgba() string with the given alpha (0–1). */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;
  return `rgba(${r},${g},${b},${alpha})`;
}
