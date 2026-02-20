import { EMOTIONS_CONTENT } from '../content';
import { EMOTION_PALETTES } from '../palettes';

export function getMoodDisplayInfo(nodeId: string): { label: string; color: string } | null {
  const node = EMOTIONS_CONTENT.nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const palette =
    EMOTION_PALETTES.default[node.groupId as keyof (typeof EMOTION_PALETTES)['default']];
  const color = palette?.[node.colorIndex];

  if (!color) return null;
  return { label: node.label, color };
}
