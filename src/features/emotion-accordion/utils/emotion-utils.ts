import { EMOTIONS_CONTENT } from '../content';
import { EMOTION_PALETTES } from '../palettes';
import type { EmotionGroupId, EmotionNode } from '../types';
import { muteColor } from './color';

export function getEmotionNode(nodeId: string | null): EmotionNode | null {
  if (!nodeId) return null;
  return EMOTIONS_CONTENT.nodes.find((n) => n.id === nodeId) ?? null;
}

export function getGroupPalette(groupId: EmotionGroupId) {
  return EMOTION_PALETTES.default[groupId];
}

/** Returns the muted display color for a node, or null if lookup fails. */
export function getEmotionColor(node: EmotionNode | null): string | null {
  if (!node) return null;
  const palette = getGroupPalette(node.groupId);
  const raw = palette?.[node.colorIndex] ?? null;
  return raw ? muteColor(raw) : null;
}
