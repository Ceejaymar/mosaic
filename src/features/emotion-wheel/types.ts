export type NodeId = string;

export type EmotionNode = {
  id: NodeId;
  label: string;
  level: 0 | 1 | 2;
  color?: string;
  parentId?: NodeId | null;
  children?: EmotionNode[];
};

export type NodeLayout = {
  id: NodeId;
  label: string;
  level: 0 | 1 | 2;
  color: string;
  parentId: NodeId | null;
  x0: number;
  y0: number;
};

export type FeelingLevel = 0 | 1 | 2;

export type FeelingGroupId =
  | 'happy'
  | 'surprised'
  | 'calm'
  | 'sad'
  | 'disgusted'
  | 'angry'
  | 'fear';

export type FeelingNode = {
  id: string;
  label: string;
  level: FeelingLevel;
  groupId: FeelingGroupId;
  parentId?: string | null;

  description: string;
  synonyms: string[];
};

export type FeelingGroup = {
  id: FeelingGroupId;
  label: string;
  description: string;
  color: string;
};

export type FeelingsContent = {
  version: number;
  groups: FeelingGroup[];
  nodes: FeelingNode[];
};
