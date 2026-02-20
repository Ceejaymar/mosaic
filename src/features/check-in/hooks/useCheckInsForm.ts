import { useState } from 'react';
import { LayoutAnimation } from 'react-native';
import type { EmotionGroupId } from '@/src/features/emotion-accordion/types';

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

  const resetState = () => {
    setStep('emotion');
    setActiveGroupId(null);
    setSelectedNodeId(null);
    setNote('');
    setActivities(new Set());
    setPeople(new Set());
    setLocations(new Set());
  };

  const handleToggleGroup = (groupId: EmotionGroupId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeGroupId === groupId) {
      setActiveGroupId(null);
    } else {
      setActiveGroupId(groupId);
      setSelectedNodeId(groupId);
    }
  };

  const toggleTag = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, tag: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleSave = () => {
    if (!selectedNodeId) return;
    const lines: string[] = [];
    if (note.trim()) lines.push(note.trim());
    if (activities.size > 0) lines.push(`Doing: ${[...activities].join(', ')}`);
    if (people.size > 0) lines.push(`With: ${[...people].join(', ')}`);
    if (locations.size > 0) lines.push(`At: ${[...locations].join(', ')}`);

    onSaveCallback(selectedNodeId, lines.length > 0 ? lines.join('\n') : undefined);
    resetState();
  };

  const handleClose = () => {
    onCloseCallback();
    resetState();
  };

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
