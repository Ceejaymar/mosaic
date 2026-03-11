export type TimeFrame = 'week' | 'month' | 'year';

export type InsightEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  emotions: string[];
  coreEmotions: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  activities: string[];
  people: string[];
  places: string[];
};

export type Observation = {
  id: string;
  text: string;
  highlightColor?: string; // Optional hex to colorize the card or text accent
};
