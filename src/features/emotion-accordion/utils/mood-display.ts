import { getEmotionNode, getGroupPalette } from './emotion-utils';

export function getMoodDisplayInfo(nodeId: string): { label: string; color: string } | null {
  const node = getEmotionNode(nodeId);
  if (!node) return null;

  const palette = getGroupPalette(node.groupId);
  const color = palette?.[node.colorIndex];
  if (!color) return null;

  return { label: node.label, color };
}
