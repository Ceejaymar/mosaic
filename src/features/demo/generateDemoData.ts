import type { MoodEntry } from '@/src/db/repos/moodRepo';

// ─── Seeded PRNG (Mulberry32) ────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(12345);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Emotion IDs (Level 2 — Leaf Nodes) ──────────────────────────────────────

const HAPPY_EMOTIONS = [
  'happy_joyful_liberated',
  'happy_joyful_ecstatic',
  'happy_interested_inquisitive',
  'happy_interested_curious',
  'happy_proud_confident',
  'happy_proud_valued',
  'happy_accepted_validated',
  'happy_accepted_approved',
  'happy_powerful_empowered',
  'happy_powerful_courageous',
  'happy_intimate_playful',
  'happy_intimate_sensitive',
  'happy_appreciative_thankful',
  'happy_appreciative_loving',
  'happy_optimistic_inspired',
  'happy_optimistic_hopeful',
  'happy_playful_animated',
  'happy_playful_flirty',
] as const;

const SAD_EMOTIONS = [
  'sad_guilty_ashamed',
  'sad_guilty_remorseful',
  'sad_abandoned_ignored',
  'sad_abandoned_victimized',
  'sad_despair_powerless',
  'sad_despair_vulnerable',
  'sad_depressed_numb',
  'sad_depressed_empty',
  'sad_lonely_isolated',
  'sad_lonely_unseen',
  'sad_bored_listless',
  'sad_bored_unstimulated',
] as const;

const CALM_EMOTIONS = [
  'calm_settled_grounded',
  'calm_settled_steady',
  'calm_safe_protected',
  'calm_safe_secure',
  'calm_present_mindful',
  'calm_present_attentive',
  'calm_balanced_centered',
  'calm_balanced_composed',
  'calm_rested_restored',
  'calm_rested_refreshed',
] as const;

const ANGRY_EMOTIONS = [
  'angry_hurt_devastated',
  'angry_hurt_embarrassed',
  'angry_threatened_jealous',
  'angry_threatened_guarded',
  'angry_hateful_violated',
  'angry_hateful_resentful',
  'angry_mad_enraged',
  'angry_mad_furious',
  'angry_aggressive_provoked',
  'angry_aggressive_hostile',
  'angry_frustrated_irritated',
  'angry_frustrated_infuriated',
  'angry_distant_suspicious',
  'angry_distant_withdrawn',
  'angry_critical_sarcastic',
  'angry_critical_dismissive',
] as const;

const FEARFUL_EMOTIONS = [
  'fearful_anxious_overwhelmed',
  'fearful_anxious_worried',
  'fearful_scared_frightened',
  'fearful_scared_terrified',
  'fearful_insecure_inferior',
  'fearful_insecure_inadequate',
  'fearful_submissive_insignificant',
  'fearful_submissive_devalued',
  'fearful_rejected_excluded',
  'fearful_rejected_unwanted',
  'fearful_humiliated_ridiculed',
  'fearful_humiliated_disrespected',
] as const;

const DISGUSTED_EMOTIONS = [
  'disgusted_disapproval_judgmental',
  'disgusted_disapproval_contemptuous',
  'disgusted_disappointed_repelled',
  'disgusted_disappointed_revolted',
  'disgusted_disturbed_uneasy',
  'disgusted_disturbed_unsettled',
  'disgusted_avoidant_averse',
  'disgusted_avoidant_hesitant',
] as const;

const SURPRISED_EMOTIONS = [
  'surprised_startled_dismayed',
  'surprised_startled_shocked',
  'surprised_confused_disoriented',
  'surprised_confused_uncertain',
  'surprised_amazed_astonished',
  'surprised_amazed_awestruck',
  'surprised_excited_eager',
  'surprised_excited_energetic',
] as const;

// ─── Tags ────────────────────────────────────────────────────────────────────

const ACTIVITIES = [
  'Working',
  'Exercising',
  'Eating',
  'Relaxing',
  'Socializing',
  'Commuting',
  'Creating',
  'Gaming',
  'Reading',
  'Outdoors',
  'Cooking',
  'Studying',
] as const;

const PEOPLE = ['By Myself', 'Partner', 'Friends', 'Family', 'Co-Workers', 'Pets'] as const;

const LOCATIONS = [
  'Home',
  'Work',
  'Outside',
  'In Transit',
  'Restaurant',
  'School',
  'Gym',
  'Store',
] as const;

// ─── Journal Notes Pool ──────────────────────────────────────────────────────

const NOTES = [
  'Had a really good morning walk. The air felt crisp and clean.',
  'Feeling a bit overwhelmed with everything on my plate today.',
  'Caught up with an old friend over coffee. It was exactly what I needed.',
  'The sunset was beautiful tonight. Took a moment to just breathe.',
  'Work meeting went well. Got positive feedback on the project.',
  'Struggled to get out of bed this morning. Just one of those days.',
  'Cooked a new recipe and it turned out great!',
  'Feeling grateful for the little things today.',
  'Had a tough conversation but I feel lighter now.',
  'The gym session was brutal but I feel amazing after.',
  'Spent the afternoon reading in the park. So peaceful.',
  'Dealing with some anxiety about the upcoming deadline.',
  'Family dinner was chaotic but full of love.',
  "Journaling helps me sort through what I'm feeling.",
  'Took the dog for a long walk. Best therapy.',
  'Feeling inspired after watching that documentary.',
  'Need to set better boundaries at work.',
  'Meditation this morning really set the tone for the day.',
  'Missing home today. Called my parents.',
  'Small wins count too. Finished that task I kept putting off.',
  'The rain today matched my mood perfectly.',
  'Laughed so hard at dinner that my cheeks hurt.',
  'Feeling disconnected from everything lately.',
  'Good therapy session today. Processing a lot.',
] as const;

// ─── Time Slots ──────────────────────────────────────────────────────────────

type TimeSlot = {
  label: 'morning' | 'afternoon' | 'evening' | 'night';
  minH: number;
  maxH: number;
};

const TIME_SLOTS: TimeSlot[] = [
  { label: 'morning', minH: 7, maxH: 10 },
  { label: 'afternoon', minH: 12, maxH: 15 },
  { label: 'evening', minH: 17, maxH: 20 },
  { label: 'night', minH: 21, maxH: 23 },
];

function pickEmotionForTimeSlot(slot: TimeSlot['label']): string {
  const r = rand();
  switch (slot) {
    case 'morning':
      if (r < 0.4) return pick(CALM_EMOTIONS);
      if (r < 0.75) return pick(HAPPY_EMOTIONS);
      return pick([...SAD_EMOTIONS, ...FEARFUL_EMOTIONS]);
    case 'afternoon':
      if (r < 0.3) return pick(ANGRY_EMOTIONS);
      if (r < 0.5) return pick(FEARFUL_EMOTIONS);
      if (r < 0.7) return pick(HAPPY_EMOTIONS);
      return pick(CALM_EMOTIONS);
    case 'evening':
      if (r < 0.4) return pick(HAPPY_EMOTIONS);
      if (r < 0.6) return pick(SURPRISED_EMOTIONS);
      if (r < 0.8) return pick(CALM_EMOTIONS);
      return pick(DISGUSTED_EMOTIONS);
    case 'night':
      if (r < 0.45) return pick(CALM_EMOTIONS);
      if (r < 0.7) return pick(SAD_EMOTIONS);
      return pick(HAPPY_EMOTIONS);
  }
}

// ─── Deterministic ID Generator ──────────────────────────────────────────────

function deterministicId(dayIndex: number, entryIndex: number): string {
  const base = (dayIndex * 7 + entryIndex * 13 + 42) >>> 0;
  return `demo-${base.toString(36)}-${((dayIndex + entryIndex) * 31).toString(36)}`;
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

function dateToKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Generator ───────────────────────────────────────────────────────────────

const DAYS_BACK = 548; // ~1.5 years

let _cachedEntries: MoodEntry[] | null = null;

function generateAllEntries(): MoodEntry[] {
  if (_cachedEntries) return _cachedEntries;

  const entries: MoodEntry[] = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < DAYS_BACK; dayOffset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOffset);
    const key = dateToKey(date);

    // Distribution: ~15% no entries, ~35% 1, ~30% 2, ~15% 3, ~5% 4
    const r = rand();
    let count: number;
    if (r < 0.15) count = 0;
    else if (r < 0.5) count = 1;
    else if (r < 0.8) count = 2;
    else if (r < 0.95) count = 3;
    else count = 4;

    // Pick random time slots for this day
    const slots = pickN(TIME_SLOTS, count);
    slots.sort((a, b) => a.minH - b.minH);

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const hour = slot.minH + Math.floor(rand() * (slot.maxH - slot.minH + 1));
      const minute = Math.floor(rand() * 60);

      const occurredAt = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        minute,
      );
      const mood = pickEmotionForTimeSlot(slot.label);

      // ~30% get a note
      const note = rand() < 0.3 ? pick(NOTES) : null;

      // ~50% get tags
      let tags: string | null = null;
      if (rand() < 0.5) {
        const selected: string[] = [];
        if (rand() < 0.7) selected.push(pick(ACTIVITIES));
        if (rand() < 0.5) selected.push(pick(PEOPLE));
        if (rand() < 0.4) selected.push(pick(LOCATIONS));
        if (selected.length > 0) tags = JSON.stringify(selected);
      }

      const isoStr = occurredAt.toISOString();

      entries.push({
        id: deterministicId(dayOffset, i),
        dateKey: key,
        primaryMood: mood,
        note,
        tags,
        occurredAt: isoStr,
        createdAt: isoStr,
        updatedAt: isoStr,
      });
    }
  }

  _cachedEntries = entries;
  return entries;
}

// ─── Public API (mirrors moodRepo interface) ─────────────────────────────────

export function getDemoEntriesForDate(dateKey: string): MoodEntry[] {
  return generateAllEntries()
    .filter((e) => e.dateKey === dateKey)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export function getDemoEntriesForMonth(year: number, month: number): MoodEntry[] {
  const mm = String(month + 1).padStart(2, '0');
  const prefix = `${year}-${mm}`;
  return generateAllEntries()
    .filter((e) => e.dateKey.startsWith(prefix))
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

export function getDemoRecentEntries(limit: number): MoodEntry[] {
  return generateAllEntries()
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, limit);
}

export function getDemoEntriesPage(offset: number, limit: number): MoodEntry[] {
  const sorted = generateAllEntries().sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  return sorted.slice(offset, offset + limit);
}

export function getAllDemoEntries(): MoodEntry[] {
  return generateAllEntries();
}
