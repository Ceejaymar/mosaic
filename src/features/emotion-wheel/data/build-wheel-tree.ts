// src/features/emotion-wheel/data/build-wheel-tree.ts

import type { FeelingsContent, WheelTreeNode } from '../types';

function byLabel(a: { label: string }, b: { label: string }) {
  return a.label.localeCompare(b.label);
}

export function buildWheelTree(content: FeelingsContent): WheelTreeNode[] {
  const groupById = new Map(content.groups.map((g) => [g.id, g]));
  const treeById = new Map<string, WheelTreeNode>();

  // 1) Create nodes with resolved colors (from group)
  for (const n of content.nodes) {
    const g = groupById.get(n.groupId);
    treeById.set(n.id, {
      id: n.id,
      label: n.label,
      level: n.level,
      groupId: n.groupId,
      parentId: n.parentId ?? null,
      color: g?.color ?? '#ffffff',
      children: [],
    });
  }

  // 2) Link children
  const roots: WheelTreeNode[] = [];
  for (const n of content.nodes) {
    const t = treeById.get(n.id);
    if (!t) continue;

    if (!t.parentId) {
      roots.push(t);
      continue;
    }

    const parent = treeById.get(t.parentId);
    if (parent) parent.children.push(t);
  }

  // 3) Sort for deterministic layout
  roots.sort(byLabel);
  for (const r of roots) {
    r.children.sort(byLabel);
    for (const c1 of r.children) c1.children.sort(byLabel);
  }

  // Expect only level 0 roots to be returned
  return roots.filter((r) => r.level === 0);
}
