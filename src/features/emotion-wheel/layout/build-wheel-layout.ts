import { WHEEL } from '../constants';
import { GROUP_COLORS } from '../feelings-colors'; // Adjust path as needed
import type { FeelingGroupId, NodeLayout, WheelTreeNode } from '../types';
import { getRowAdjustedColor } from '../utils/row-adjusted-color';

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
  const level1 = root.children;
  const level2 = root.children.flatMap((c) => c.children);
  return { core: root, after: [...level1, ...level2] };
}

function sizeForRow(rowIndex: number) {
  if (rowIndex <= 0) return WHEEL.sizeL0;
  return Math.max(
    WHEEL.rowSizeMin,
    Math.round(WHEEL.rowSizeStart * WHEEL.rowSizeDecay ** (rowIndex - 1)),
  );
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

  let prevD = (sizeForRow(1) + WHEEL.nodeGapPx) * WHEEL.layoutSafetyFactor;
  let prevR = baseRadius - prevD;

  const wedgeA0 = wedge.a0 + WHEEL.wedgeEdgeInsetRad;
  const wedgeA1 = wedge.a1 - WHEEL.wedgeEdgeInsetRad;
  const wedgeUsableSpan = Math.max(0, wedgeA1 - wedgeA0);

  while (cursor < nodes.length) {
    const rowIndex = 1 + row;
    const size = sizeForRow(rowIndex);
    const D = (size + WHEEL.nodeGapPx) * WHEEL.layoutSafetyFactor;
    const step = ((prevD + D) / 2) * WHEEL.rowRadialStepFactor;

    const want = startCount + row;
    const take = Math.min(want, nodes.length - cursor);
    const slice = nodes.slice(cursor, cursor + take);
    cursor += take;

    let r = Math.max(baseRadius + row * step, prevR + step);
    let stepAngle = take <= 1 ? 0 : 2 * Math.asin(Math.min(0.999, D / (2 * r)));
    let needed = (take - 1) * stepAngle;

    let guard = 0;
    while (take > 1 && needed > wedgeUsableSpan && guard < 100) {
      r += 10;
      stepAngle = 2 * Math.asin(Math.min(0.999, D / (2 * r)));
      needed = (take - 1) * stepAngle;
      guard++;
    }

    const slack = Math.max(0, wedgeUsableSpan - needed);
    const aStart = wedgeA0 + slack / 2;

    for (let i = 0; i < slice.length; i++) {
      const n = slice[i];
      const a = take <= 1 ? (wedgeA0 + wedgeA1) / 2 : aStart + i * stepAngle;
      const p = polarToXY(r, a);

      // ✅ Use the GROUP_COLORS map based on the groupId
      const baseColor = GROUP_COLORS[n.groupId] || n.color;

      out.push({
        id: n.id,
        label: n.label,
        level: n.level,
        groupId: n.groupId,
        parentId: n.parentId,
        color: getRowAdjustedColor(baseColor, rowIndex),
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

    const coreP = polarToXY(WHEEL.ring0Radius, wedge.am);
    const baseColor = GROUP_COLORS[core.groupId] || core.color;

    out.push({
      id: core.id,
      label: core.label,
      level: core.level,
      groupId: core.groupId,
      parentId: core.parentId,
      color: baseColor, // Row 0 uses pure base color
      x0: cx + coreP.x,
      y0: cy + coreP.y,
      rowIndex: 0,
      size: sizeForRow(0),
    });

    out.push(
      ...packRows234({
        nodes: after,
        wedge,
        baseRadius: WHEEL.ring1Radius,
        cx,
        cy,
        startCount: WHEEL.rowStart,
      }),
    );
  }
  return out;
}
