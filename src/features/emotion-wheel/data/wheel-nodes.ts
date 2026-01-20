import type { EmotionNode } from '../types';

const CORE = [
  'Joy',
  'Trust',
  'Fear',
  'Surprise',
  'Sadness',
  'Disgust',
  'Anger',
  'Anticipation',
] as const;

function idify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-');
}

function makeSecondLevelLabels(core: string) {
  const base = [
    'Calm',
    'Open',
    'Tense',
    'Playful',
    'Heavy',
    'Irritated',
    'Restless',
    'Focused',
    'Warm',
    'Detached',
  ];
  const count = core.length % 3 === 0 ? 10 : core.length % 2 === 0 ? 7 : 5;
  return base.slice(0, count).map((b) => `${b} ${core}`);
}

function makeThirdLevelLabels(second: string) {
  const base = ['Low', 'Medium', 'High'];
  const count = second.length % 2 === 0 ? 3 : 2;
  return base.slice(0, count).map((b) => `${b} ${second}`);
}

export function buildWheelNodes(): EmotionNode[] {
  const roots: EmotionNode[] = CORE.map((label) => ({
    id: `l0-${idify(label)}`,
    label,
    level: 0,
    color: '#ffffff',
    parentId: null,
    children: [],
  }));

  for (const core of roots) {
    const level1Labels = makeSecondLevelLabels(core.label);

    core.children = level1Labels.map((l1): EmotionNode => {
      const l1Node: EmotionNode = {
        id: `l1-${idify(l1)}`,
        label: l1,
        level: 1,
        color: '#ffffff',
        parentId: core.id,
        children: [],
      };

      const level2Labels = makeThirdLevelLabels(l1);
      l1Node.children = level2Labels.map(
        (l2): EmotionNode => ({
          id: `l2-${idify(l2)}`,
          label: l2,
          level: 2,
          color: '#ffffff',
          parentId: l1Node.id,
          // children omitted if you made it optional; otherwise: children: []
          children: [],
        }),
      );

      return l1Node;
    });
  }

  return roots;
}
