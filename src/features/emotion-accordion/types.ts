export type NodeId = string;
export type FeelingLevel = 0 | 1 | 2;

export type EmotionGroupId =
  | 'happy'
  | 'surprised'
  | 'calm'
  | 'sad'
  | 'disgusted'
  | 'angry'
  | 'fearful';

export interface EmotionNode {
  id: string;
  label: string;
  level: number;
  groupId: string;
  parentId: string | null;
  description: string;
  synonyms: string[];
  colorIndex: number;
}

export interface EmotionGroup {
  id: string;
  label: string;
  description: string;
  color: string;
}

export type EmotionsContent = {
  version: number;
  groups: EmotionGroup[];
  nodes: EmotionNode[];
};
