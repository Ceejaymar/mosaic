import { WHEEL } from '../constants';
import type { NodeLayout, WheelTreeNode } from '../types';
import { jitterSigned } from './wheel-math';

// Axial hex coords
type Hex = { q: number; r: number; d: number };

// hex distance from origin
function hexDist(q: number, r: number) {
  const s = -q - r;
  return (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
}

// axial -> pixel (pointy-top hex)
function hexToPixel(q: number, r: number, step: number) {
  const x = step * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = step * (1.5 * r);
  return { x, y };
}

function flattenTree(roots: WheelTreeNode[]) {
  const level0: WheelTreeNode[] = [];
  const level1: WheelTreeNode[] = [];
  const level2: WheelTreeNode[] = [];

  for (const r of roots) {
    level0.push(r);
    for (const c1 of r.children) {
      level1.push(c1);
      for (const c2 of c1.children) level2.push(c2);
    }
  }

  return { level0, level1, level2 };
}

export function buildWheelLayout(
  roots: WheelTreeNode[],
  opts: { cx: number; cy: number },
): NodeLayout[] {
  const { cx, cy } = opts;

  /**
   * ✅ Tighter grid:
   * Base step derived from SMALLER nodes, not the biggest ones.
   * Then bandScale gives the center a bit more room.
   */
  const baseStep = (WHEEL.sizeL2 + WHEEL.gap) * WHEEL.packingTightness;

  // Generate hex cells inside radius
  const cells: Hex[] = [];
  const R = WHEEL.hexRadius;

  for (let q = -R; q <= R; q++) {
    for (let r = -R; r <= R; r++) {
      const d = hexDist(q, r);
      if (d <= R) cells.push({ q, r, d });
    }
  }

  // Center outward
  cells.sort((a, b) => a.d - b.d);

  const band0 = cells.filter((c) => c.d <= WHEEL.level0Max);
  const band1 = cells.filter((c) => c.d > WHEEL.level0Max && c.d <= WHEEL.level1Max);
  const band2 = cells.filter((c) => c.d > WHEEL.level1Max);

  const { level0, level1, level2 } = flattenTree(roots);

  function place(nodes: WheelTreeNode[], band: Hex[], bandScale: number): NodeLayout[] {
    const out: NodeLayout[] = [];
    const count = Math.min(nodes.length, band.length);

    const step = baseStep * bandScale;

    for (let i = 0; i < count; i++) {
      const n = nodes[i];
      const c = band[i];
      const p = hexToPixel(c.q, c.r, step);

      const j = WHEEL.positionJitterPx;
      const jx = jitterSigned(`${n.id}:x`) * j;
      const jy = jitterSigned(`${n.id}:y`) * j;

      out.push({
        id: n.id,
        label: n.label,
        level: n.level,
        groupId: n.groupId,
        parentId: n.parentId ?? null,
        color: n.color,
        x0: cx + p.x + jx,
        y0: cy + p.y + jy,
      });
    }

    return out;
  }

  return [
    ...place(level0, band0, WHEEL.bandScale0),
    ...place(level1, band1, WHEEL.bandScale1),
    ...place(level2, band2, WHEEL.bandScale2),
  ];
}
