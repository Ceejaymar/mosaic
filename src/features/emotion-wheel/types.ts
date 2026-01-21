export type NodeId = string;
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
  id: NodeId;
  label: string;
  level: FeelingLevel;
  groupId: FeelingGroupId;
  parentId: NodeId | null;
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

export type WheelTreeNode = {
  id: NodeId;
  label: string;
  level: FeelingLevel;
  groupId: FeelingGroupId;
  parentId: NodeId | null;
  color: string;
  children: WheelTreeNode[];
};

export type NodeLayout = {
  id: NodeId;
  label: string;
  level: FeelingLevel; // semantic only
  groupId: FeelingGroupId;
  parentId: NodeId | null;
  color: string;

  x0: number;
  y0: number;

  // visual sizing by row
  rowIndex: number; // 0 = core, 1 = first row after core...
  size: number; // diameter
};
