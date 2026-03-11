import type { MoodEntry } from '@/src/db/repos/moodRepo';
import { getMoodDisplayInfo } from '@/src/features/check-in/utils/mood-helpers';
import { parseStoredTags } from '@/src/features/check-in/utils/parse-tags';
import {
  getTimeSlotForOccurredAt,
  getTimeSlotLabel,
} from '@/src/features/check-in/utils/time-of-day';
import type { EmotionGroupId } from '@/src/features/emotion-accordion/types';
import { getEmotionNode } from '@/src/features/emotion-accordion/utils/emotion-utils';

// ─── Internal helpers ─────────────────────────────────────────────────────────

const GROUP_LABELS: Record<EmotionGroupId, string> = {
  happy: 'Joy',
  surprised: 'Surprise',
  calm: 'Calm',
  sad: 'Sadness',
  disgusted: 'Disgust',
  angry: 'Anger',
  fearful: 'Fear',
};

function getMoodLabel(primaryMood: string): string {
  return getMoodDisplayInfo(primaryMood)?.label ?? primaryMood;
}

function getGroupId(primaryMood: string): EmotionGroupId | null {
  return getEmotionNode(primaryMood)?.groupId ?? null;
}

function timeSlotOf(occurredAt: string): string {
  return getTimeSlotLabel(getTimeSlotForOccurredAt(occurredAt)).toLowerCase();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Derives 1–3 neutral, data-driven observations from today's check-ins.
 *
 * Rules:
 *  - Returns [] when entries is empty.
 *  - No advice, no prescriptions. Only objective pattern statements.
 *  - Input order does not matter; entries are sorted internally by occurredAt.
 */
export function generateDailyObservation(entries: MoodEntry[]): string[] {
  if (entries.length === 0) return [];

  // Sort chronologically regardless of DB order (newest-first)
  const sorted = [...entries].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );

  const count = sorted.length;
  const first = sorted[0];
  const last = sorted[count - 1];
  const obs: string[] = [];

  // ── 1 entry ────────────────────────────────────────────────────────────────
  if (count === 1) {
    const label = getMoodLabel(first.primaryMood);
    const slot = timeSlotOf(first.occurredAt);
    obs.push(`Started the ${slot} with ${label}`);
    const tags = parseStoredTags(first.tags);
    if (tags.length > 0) obs.push(`Focus has been primarily on ${tags[0]}`);
    return obs;
  }

  // ── 2 entries ──────────────────────────────────────────────────────────────
  if (count === 2) {
    const label1 = getMoodLabel(first.primaryMood);
    const label2 = getMoodLabel(last.primaryMood);
    const slot1 = timeSlotOf(first.occurredAt);
    const slot2 = timeSlotOf(last.occurredAt);

    obs.push(`Started the ${slot1} with ${label1}`);

    if (first.primaryMood === last.primaryMood) {
      obs.push(`Maintained ${label1} across both check-ins`);
    } else {
      const group1 = getGroupId(first.primaryMood);
      const group2 = getGroupId(last.primaryMood);
      if (group1 && group1 === group2) {
        obs.push(`Both moments within the ${GROUP_LABELS[group1]} space`);
      } else if (slot1 === slot2) {
        obs.push(`Later shifted to ${label2}`);
      } else {
        obs.push(`Shifted to ${label2} this ${slot2}`);
      }
    }

    return obs;
  }

  // ── 3+ entries ────────────────────────────────────────────────────────────
  obs.push(`Started the day with ${getMoodLabel(first.primaryMood)}`);

  // Pattern: dominant emotion family or recurring tag
  const groupIds = sorted
    .map((e) => getGroupId(e.primaryMood))
    .filter((g): g is EmotionGroupId => g !== null);

  const groupCounts = new Map<EmotionGroupId, number>();
  for (const g of groupIds) groupCounts.set(g, (groupCounts.get(g) ?? 0) + 1);

  let dominantGroup: EmotionGroupId | null = null;
  let dominantCount = 0;
  for (const [g, c] of groupCounts) {
    if (c > dominantCount) {
      dominantGroup = g;
      dominantCount = c;
    }
  }

  if (dominantGroup && dominantCount >= 2) {
    obs.push(`${dominantCount} check-ins from the ${GROUP_LABELS[dominantGroup]} family`);
  } else {
    const allTags = sorted.flatMap((e) => parseStoredTags(e.tags));
    const tagCounts = new Map<string, number>();
    for (const t of allTags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);

    let topTag: string | null = null;
    let topTagCount = 0;
    for (const [t, c] of tagCounts) {
      if (c > topTagCount) {
        topTag = t;
        topTagCount = c;
      }
    }

    if (topTag && topTagCount >= 2) {
      const capitalizedTag = topTag.charAt(0).toUpperCase() + topTag.slice(1);
      obs.push(`${capitalizedTag} across ${topTagCount} check-ins`);
    } else {
      const uniqueGroupCount = new Set(groupIds).size;
      obs.push(
        uniqueGroupCount === 0
          ? 'Across multiple different emotional spaces'
          : `Across ${uniqueGroupCount} different emotional spaces`,
      );
    }
  }

  // Latest shift: only add if the mood changed from the first
  if (last.primaryMood !== first.primaryMood) {
    const lastLabel = getMoodLabel(last.primaryMood);
    const lastSlot = timeSlotOf(last.occurredAt);
    obs.push(`Most recently feeling ${lastLabel} this ${lastSlot}`);
  }

  return obs;
}
