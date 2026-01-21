import { WHEEL } from '../constants';
import type { FeelingGroupId, NodeLayout, WheelTreeNode } from '../types';

const TAU = Math.PI * 2;

type Wedge = {
  groupId: FeelingGroupId;
  a0: number;
  a1: number;
  am: number;
  span: number;
};

function polarToXY(r: number, a: number) {
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

function buildWedges(groupIds: FeelingGroupId[], paddingRad: number): Map<FeelingGroupId, Wedge> {
  const n = groupIds.length;
  const slice = TAU / n;
  const map = new Map<FeelingGroupId, Wedge>();

  for (let i = 0; i < n; i++) {
    const mid = -Math.PI / 2 + i * slice;
    const a0 = mid - slice / 2 + paddingRad;
    const a1 = mid + slice / 2 - paddingRad;
    map.set(groupIds[i], { groupId: groupIds[i], a0, a1, am: mid, span: a1 - a0 });
  }

  return map;
}

function flattenAfterCore(root: WheelTreeNode) {
  const core = root;

  const level1: WheelTreeNode[] = [];
  const level2: WheelTreeNode[] = [];

  for (const c1 of root.children) level1.push(c1);
  for (const c1 of root.children) for (const c2 of c1.children) level2.push(c2);

  return { core, after: [...level1, ...level2] };
}

function sizeForRow(rowIndex: number) {
  if (rowIndex <= 0) return WHEEL.sizeL0;

  const start = WHEEL.rowSizeStart ?? WHEEL.sizeL1;
  const decay = WHEEL.rowSizeDecay ?? 0.9;
  const min = WHEEL.rowSizeMin ?? 56;

  const s = start * decay ** (rowIndex - 1);
  return Math.max(min, Math.round(s));
}

function packRows234(args: {
  nodes: WheelTreeNode[];
  wedge: Wedge;
  baseRadius: number;
  cx: number;
  cy: number;
  startCount: number;
}): NodeLayout[] {
  const { nodes, wedge, baseRadius, cx, cy, startCount } = args;
  if (!nodes.length) return [];

  const out: NodeLayout[] = [];

  let cursor = 0;
  let row = 0;

  let prevD = sizeForRow(1) + (WHEEL.nodeGapPx ?? 14);
  let prevR = baseRadius - prevD;

  while (cursor < nodes.length) {
    const rowIndex = 1 + row;
    const size = sizeForRow(rowIndex);
    const D = size + (WHEEL.nodeGapPx ?? 14);

    const step = ((prevD + D) / 2) * (WHEEL.rowRadialStepFactor ?? 0.9);

    const want = startCount + row; // 2,3,4,5...
    const take = Math.min(want, nodes.length - cursor);
    const slice = nodes.slice(cursor, cursor + take);
    cursor += take;

    // radius for this row
    let r = Math.max(baseRadius + row * step, prevR + step);

    // compute minimum angle spacing to keep neighbors from overlapping
    const usable = wedge.span * 0.86;

    let stepAngle = take <= 1 ? 0 : 2 * Math.asin(Math.min(0.999, D / (2 * r)));
    let needed = (take - 1) * stepAngle;

    // push outward until row fits inside wedge
    let guard = 0;
    while (take > 1 && needed > usable && guard < 250) {
      r += step;
      stepAngle = 2 * Math.asin(Math.min(0.999, D / (2 * r)));
      needed = (take - 1) * stepAngle;
      guard++;
    }

    // ✅ NO STAGGER: perfectly centered rows
    const aStart = wedge.am - needed / 2;

    for (let i = 0; i < slice.length; i++) {
      const n = slice[i];
      let a = aStart + i * stepAngle;

      if (a < wedge.a0) a = wedge.a0;
      if (a > wedge.a1) a = wedge.a1;

      const p = polarToXY(r, a);

      out.push({
        id: n.id,
        label: n.label,
        level: n.level,
        groupId: n.groupId,
        parentId: n.parentId,
        color: n.color,
        x0: cx + p.x,
        y0: cy + p.y,
        rowIndex,
        size,
      });
    }

    prevD = D;
    prevR = r;
    row += 1;
  }

  return out;
}

export function buildWheelLayout(
  roots: WheelTreeNode[],
  opts: { cx: number; cy: number },
): NodeLayout[] {
  const { cx, cy } = opts;

  const groupIds = roots.map((r) => r.groupId);
  const wedges = buildWedges(groupIds, WHEEL.wedgePaddingRad);

  const out: NodeLayout[] = [];

  for (const root of roots) {
    const wedge = wedges.get(root.groupId);
    if (!wedge) continue;

    const { core, after } = flattenAfterCore(root);

    // core
    {
      const size = sizeForRow(0);
      const p = polarToXY(WHEEL.ring0Radius, wedge.am);

      out.push({
        id: core.id,
        label: core.label,
        level: core.level,
        groupId: core.groupId,
        parentId: core.parentId,
        color: core.color,
        x0: cx + p.x,
        y0: cy + p.y,
        rowIndex: 0,
        size,
      });
    }

    // after-core rows
    out.push(
      ...packRows234({
        nodes: after,
        wedge,
        baseRadius: WHEEL.ring1Radius,
        cx,
        cy,
        startCount: WHEEL.rowStart ?? 2,
      }),
    );
  }

  return out;
}
