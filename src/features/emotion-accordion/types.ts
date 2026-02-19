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
  groupId: EmotionGroupId;
  parentId: string | null;
  description: string;
  synonyms: string[];
  colorIndex: number;
}

export interface EmotionGroup {
  id: EmotionGroupId;
  label: string;
  description: string;
  color: string;
}

export type EmotionsContent = {
  version: number;
  groups: EmotionGroup[];
  nodes: EmotionNode[];
};
