import { useMemo } from 'react';
import { uuid } from '@/src/lib/uuid';
import type { InsightEntry, TimeFrame } from '../types';

export const EMOTION_PALETTES = {
  default: {
    happy: ['#ffd300'], // Core Yellow
    surprised: ['#00e5ff'], // Core Cyan
    calm: ['#4caf50'], // Core Green
    sad: ['#2979ff'], // Core Blue
    disgusted: ['#aa00ff'], // Core Purple
    angry: ['#ff1744'], // Core Red
    fearful: ['#ff9100'], // Core Orange
  },
};

const MOCK_ACTIVITIES = ['Reading', 'Working Out', 'Commuting', 'Socializing'];
const MOCK_PEOPLE = ['Partner', 'Friends', 'Family', 'Colleagues'];
const MOCK_PLACES = ['Home', 'Office', 'Park', 'Coffee Shop'];
const MOCK_TIMES = ['morning', 'afternoon', 'evening', 'night'] as const;

export function useInsightsData(timeFrame: TimeFrame, offset: number) {
  return useMemo(() => {
    const daysCount = timeFrame === 'week' ? 7 : timeFrame === 'month' ? 30 : 365;
    const entries: InsightEntry[] = [];
    const now = new Date();

    for (let d = 0; d < daysCount; d++) {
      const entryDate = new Date(now);
      entryDate.setDate(now.getDate() - d + offset * daysCount);
      const dateString = entryDate.toISOString().split('T')[0];

      const checkinsToday = Math.floor(Math.random() * 4) + 1;
      const availableTimes = [...MOCK_TIMES];

      for (let i = 0; i < checkinsToday; i++) {
        const timeIndex = Math.floor(Math.random() * availableTimes.length);
        const timeOfDay = availableTimes.splice(timeIndex, 1)[0] || 'night';

        let emotionCategory: keyof typeof EMOTION_PALETTES.default = 'happy';
        let activity = MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
        let place = MOCK_PLACES[Math.floor(Math.random() * MOCK_PLACES.length)];

        // Bias the data to create distinct patterns
        if (timeOfDay === 'morning') {
          emotionCategory = Math.random() > 0.3 ? 'calm' : 'happy';
          activity = 'Reading';
          place = 'Home';
        } else if (timeOfDay === 'afternoon') {
          emotionCategory = Math.random() > 0.4 ? 'angry' : 'fearful';
          activity = 'Commuting';
          place = 'Office';
        } else if (timeOfDay === 'evening') {
          emotionCategory = Math.random() > 0.3 ? 'happy' : 'surprised';
          activity = 'Socializing';
        } else {
          emotionCategory = Math.random() > 0.5 ? 'calm' : 'sad';
        }

        // Grab ONLY the core color
        const coreColor = EMOTION_PALETTES.default[emotionCategory][0];

        entries.push({
          id: uuid(),
          date: dateString,
          emotions: [coreColor],
          timeOfDay,
          activities: [activity],
          people: [MOCK_PEOPLE[Math.floor(Math.random() * MOCK_PEOPLE.length)]],
          places: [place],
        });
      }
    }

    return entries;
  }, [timeFrame, offset]);
}
