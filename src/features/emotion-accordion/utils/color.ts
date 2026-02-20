/**
 * Mutes a hex color by blending it toward a dark neutral.
 * Reduces the neon vibrancy of palette colors for a modern dark-UI look.
 * @param hex - 6-digit hex color string (e.g. '#ff1744')
 * @param factor - 0.0 (fully neutral dark) to 1.0 (original). Default: 0.68
 */
export function muteColor(hex: string, factor = 0.68): string {
  const f = Math.max(0, Math.min(1, factor));
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;
  const neutral = 0x22;
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const mr = clamp(r * f + neutral * (1 - f));
  const mg = clamp(g * f + neutral * (1 - f));
  const mb = clamp(b * f + neutral * (1 - f));
  return `#${mr.toString(16).padStart(2, '0')}${mg.toString(16).padStart(2, '0')}${mb.toString(16).padStart(2, '0')}`;
}
