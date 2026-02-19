/**
 * Mutes a hex color by blending it toward a dark neutral.
 * Reduces the neon vibrancy of palette colors for a modern dark-UI look.
 * @param hex - 6-digit hex color string (e.g. '#ff1744')
 * @param factor - 0.0 (fully neutral dark) to 1.0 (original). Default: 0.68
 */
export function muteColor(hex: string, factor = 0.68): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const neutral = 0x22;
  const mr = Math.round(r * factor + neutral * (1 - factor));
  const mg = Math.round(g * factor + neutral * (1 - factor));
  const mb = Math.round(b * factor + neutral * (1 - factor));
  return `#${mr.toString(16).padStart(2, '0')}${mg.toString(16).padStart(2, '0')}${mb.toString(16).padStart(2, '0')}`;
}
