import { useCallback, useState } from 'react';
import type { MoodEntry } from '@/src/db/repos/moodRepo';
import {
  ACTIVITY_TAGS,
  LOCATION_TAGS,
  PEOPLE_TAGS,
} from '@/src/features/check-in/data/context-tags';
import type { EmotionGroupId } from '@/src/features/emotion-accordion/types';
import { triggerSpringLayoutAnimation } from '@/src/utils/animations';

export type Step = 'emotion' | 'context';

export type CheckInFormInitialData = {
  targetDate?: string;
  existingEntry?: MoodEntry;
};

function parseTagSets(entry?: MoodEntry) {
  let raw: string[] = [];
  try {
    const parsed = entry?.tags ? JSON.parse(entry.tags) : [];
    if (Array.isArray(parsed) && parsed.every((t) => typeof t === 'string')) {
      raw = parsed;
    }
  } catch {
    raw = [];
  }
  return {
    activitySet: new Set(raw.filter((t) => (ACTIVITY_TAGS as readonly string[]).includes(t))),
    peopleSet: new Set(raw.filter((t) => (PEOPLE_TAGS as readonly string[]).includes(t))),
    locationSet: new Set(raw.filter((t) => (LOCATION_TAGS as readonly string[]).includes(t))),
  };
}

export function useCheckInForm(
  onSaveCallback: (nodeId: string, note?: string, tags?: string[]) => void | Promise<void>,
  onCloseCallback: () => void,
  initialData?: CheckInFormInitialData,
) {
  const existingEntry = initialData?.existingEntry;
  const targetDate = initialData?.targetDate;
  const isEditing = !!existingEntry;

  const [step, setStep] = useState<Step>(() => (existingEntry ? 'context' : 'emotion'));
  const [activeGroupId, setActiveGroupId] = useState<EmotionGroupId | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    () => existingEntry?.primaryMood ?? null,
  );
  const [note, setNote] = useState(() => existingEntry?.note ?? '');
  const [initialSets] = useState(() => parseTagSets(existingEntry));
  const [activities, setActivities] = useState<Set<string>>(initialSets.activitySet);
  const [people, setPeople] = useState<Set<string>>(initialSets.peopleSet);
  const [locations, setLocations] = useState<Set<string>>(initialSets.locationSet);

  const resetState = useCallback(() => {
    const sets = parseTagSets(existingEntry);
    setStep(existingEntry ? 'context' : 'emotion');
    setActiveGroupId(null);
    setSelectedNodeId(existingEntry?.primaryMood ?? null);
    setNote(existingEntry?.note ?? '');
    setActivities(sets.activitySet);
    setPeople(sets.peopleSet);
    setLocations(sets.locationSet);
  }, [existingEntry]);

  const handleToggleGroup = useCallback(
    (groupId: EmotionGroupId | null) => {
      if (!groupId) {
        setActiveGroupId(null);
        return;
      }
      triggerSpringLayoutAnimation();
      const isOpening = activeGroupId !== groupId;
      if (isOpening) setSelectedNodeId(groupId);
      setActiveGroupId(isOpening ? groupId : null);
    },
    [activeGroupId],
  );

  const toggleActivity = useCallback((tag: string) => {
    setActivities((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const togglePerson = useCallback((tag: string) => {
    setPeople((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const toggleLocation = useCallback((tag: string) => {
    setLocations((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!selectedNodeId || isSaving) return;
    setIsSaving(true);
    const tags = [...activities, ...people, ...locations];
    try {
      await onSaveCallback(
        selectedNodeId,
        note.trim() || undefined,
        tags.length > 0 ? tags : undefined,
      );
      resetState();
    } catch (err) {
      console.error('Failed to save check-in', err);
    } finally {
      setIsSaving(false);
    }
  }, [selectedNodeId, isSaving, note, activities, people, locations, onSaveCallback, resetState]);

  const handleClose = useCallback(() => {
    onCloseCallback();
    resetState();
  }, [onCloseCallback, resetState]);

  return {
    step,
    setStep,
    activeGroupId,
    selectedNodeId,
    setSelectedNodeId,
    note,
    setNote,
    activities,
    people,
    locations,
    isEditing,
    targetDate,
    resetState,
    handleToggleGroup,
    toggleActivity,
    togglePerson,
    toggleLocation,
    isSaving,
    handleSave,
    handleClose,
  };
}
