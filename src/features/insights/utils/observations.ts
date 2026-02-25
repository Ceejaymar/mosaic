import { uuid } from '@/src/lib/uuid';
import type { InsightEntry, Observation } from '../types';

export function generateObservations(entries: InsightEntry[]): Observation[] {
  if (entries.length < 3) return []; // Blank slate guardrail

  const observations: Observation[] = [];

  // 1. Find dominant morning emotion
  const morningEntries = entries.filter((e) => e.timeOfDay === 'morning');
  const morningCounts: Record<string, number> = {};
  for (const entry of morningEntries) {
    for (const color of entry.emotions) {
      morningCounts[color] = (morningCounts[color] || 0) + 1;
    }
  }

  const dominantMorningColor = Object.keys(morningCounts).sort(
    (a, b) => morningCounts[b] - morningCounts[a],
  )[0];

  if (dominantMorningColor && morningCounts[dominantMorningColor] > 1) {
    observations.push({
      id: uuid(),
      text: 'Your mornings were heavily characterized by this feeling.',
      highlightColor: dominantMorningColor,
    });
  }

  // 2. Activity Correlation
  const activityCorrelations: Record<string, Record<string, number>> = {};
  for (const entry of entries) {
    for (const activity of entry.activities) {
      if (!activityCorrelations[activity]) activityCorrelations[activity] = {};
      for (const color of entry.emotions) {
        activityCorrelations[activity][color] = (activityCorrelations[activity][color] || 0) + 1;
      }
    }
  }

  // Find the highest correlating activity + color combo
  let topActivity = '';
  let topActivityColor = '';
  let maxCount = 0;

  for (const activity in activityCorrelations) {
    for (const color in activityCorrelations[activity]) {
      if (activityCorrelations[activity][color] > maxCount) {
        maxCount = activityCorrelations[activity][color];
        topActivity = activity;
        topActivityColor = color;
      }
    }
  }

  if (topActivity && maxCount > 1) {
    observations.push({
      id: uuid(),
      text: `You frequently logged this feeling when you were ${topActivity}.`,
      highlightColor: topActivityColor,
    });
  }

  // 3. General Prominence
  const totalCounts: Record<string, number> = {};
  for (const entry of entries) {
    for (const color of entry.emotions) {
      totalCounts[color] = (totalCounts[color] || 0) + 1;
    }
  }

  const dominantTotalColor = Object.keys(totalCounts).sort(
    (a, b) => totalCounts[b] - totalCounts[a],
  )[0];

  // Avoid repeating the morning color if possible
  if (dominantTotalColor && dominantTotalColor !== dominantMorningColor) {
    observations.push({
      id: uuid(),
      text: 'This was a prominent recurring emotion for you during this timeframe.',
      highlightColor: dominantTotalColor,
    });
  }

  // Ensure we return max 3
  return observations.slice(0, 3);
}
