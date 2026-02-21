import { useCallback, useState } from 'react';
import type { EmotionGroupId } from '@/src/features/emotion-accordion/types';
import { triggerSpringLayoutAnimation } from '@/src/utils/animations';

export type Step = 'emotion' | 'context';

export function useCheckInForm(
  onSaveCallback: (nodeId: string, note?: string, tags?: string[]) => void,
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

  const handleSave = useCallback(() => {
    if (!selectedNodeId) return;
    const tags = [...activities, ...people, ...locations];
    onSaveCallback(selectedNodeId, note.trim() || undefined, tags.length > 0 ? tags : undefined);
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
    people,
    locations,
    resetState,
    handleToggleGroup,
    toggleActivity,
    togglePerson,
    toggleLocation,
    handleSave,
    handleClose,
  };
}
