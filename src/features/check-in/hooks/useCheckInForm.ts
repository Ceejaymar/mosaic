import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import type { EmotionGroupId } from '@/src/features/emotion-accordion/types';
import { triggerSpringLayoutAnimation } from '@/src/utils/animations';

export type Step = 'emotion' | 'context';

export function useCheckInForm(
  onSaveCallback: (nodeId: string, note?: string) => void,
  onCloseCallback: () => void,
) {
  const [step, setStep] = useState<Step>('emotion');
  const [activeGroupId, setActiveGroupId] = useState<EmotionGroupId | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [activities, setActivities] = useState<Set<string>>(new Set());
  const [people, setPeople] = useState<Set<string>>(new Set());
  const [locations, setLocations] = useState<Set<string>>(new Set());

  const resetState = useCallback(() => {
    setStep('emotion');
    setActiveGroupId(null);
    setSelectedNodeId(null);
    setNote('');
    setActivities(new Set());
    setPeople(new Set());
    setLocations(new Set());
  }, []);

  const handleToggleGroup = useCallback(
    (groupId: EmotionGroupId) => {
      triggerSpringLayoutAnimation();
      if (activeGroupId === groupId) {
        setActiveGroupId(null);
      } else {
        setActiveGroupId(groupId);
        setSelectedNodeId(groupId);
      }
    },
    [activeGroupId],
  );

  const toggleTag = useCallback((setter: Dispatch<SetStateAction<Set<string>>>, tag: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedNodeId) return;
    const lines: string[] = [];
    if (note.trim()) lines.push(note.trim());
    if (activities.size > 0) lines.push(`Doing: ${[...activities].join(', ')}`);
    if (people.size > 0) lines.push(`With: ${[...people].join(', ')}`);
    if (locations.size > 0) lines.push(`At: ${[...locations].join(', ')}`);

    onSaveCallback(selectedNodeId, lines.length > 0 ? lines.join('\n') : undefined);
    resetState();
  }, [selectedNodeId, note, activities, people, locations, onSaveCallback, resetState]);

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
    setActivities,
    people,
    setPeople,
    locations,
    setLocations,
    resetState,
    handleToggleGroup,
    toggleTag,
    handleSave,
    handleClose,
  };
}
