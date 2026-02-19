import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccordionGroup } from '@/src/features/emotion-accordion/components/accordion-group';
import { EMOTIONS_CONTENT } from '@/src/features/emotion-accordion/content';
import { EMOTION_PALETTES } from '@/src/features/emotion-accordion/palettes';
import type { EmotionGroupId, EmotionNode } from '@/src/features/emotion-accordion/types';
import { ACTIVITY_TAGS, LOCATION_TAGS, PEOPLE_TAGS } from '../data/context-tags';
import { getCurrentTimeSlot, getTimeSlotLabel } from '../utils/time-of-day';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Sheet is always dark regardless of app theme
const BG = '#111113';
const SURFACE = '#1C1C1E';
const STROKE = '#2C2C2E';
const MUTED = '#8E8E93';
const TEXT = '#F2F2F7';

type Step = 'emotion' | 'context';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (nodeId: string, note?: string) => void;
};

function getTimeSubtitle(): string {
  const time = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const slot = getTimeSlotLabel(getCurrentTimeSlot());
  return `${time} · ${slot}`;
}

function TagChip({
  label,
  isSelected,
  color,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  color: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: isSelected ? (color ?? MUTED) : STROKE,
        backgroundColor: isSelected ? STROKE : 'transparent',
        opacity: pressed ? 0.75 : 1,
      })}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
    >
      <Text
        style={{
          fontSize: 14,
          color: isSelected ? (color ?? TEXT) : MUTED,
          fontWeight: isSelected ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TagSection({
  title,
  tags,
  selected,
  color,
  onToggle,
}: {
  title: string;
  tags: readonly string[];
  selected: Set<string>;
  color: string | null;
  onToggle: (tag: string) => void;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: MUTED,
          letterSpacing: 1.2,
          marginBottom: 10,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((tag) => (
          <TagChip
            key={tag}
            label={tag}
            isSelected={selected.has(tag)}
            color={color}
            onPress={() => onToggle(tag)}
          />
        ))}
      </View>
    </View>
  );
}

export function CheckInSheet({ visible, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('emotion');
  const [activeGroupId, setActiveGroupId] = useState<EmotionGroupId | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [activities, setActivities] = useState<Set<string>>(new Set());
  const [people, setPeople] = useState<Set<string>>(new Set());
  const [locations, setLocations] = useState<Set<string>>(new Set());

  const nodesByGroup = useMemo(() => {
    const map: Record<string, EmotionNode[]> = {};
    EMOTIONS_CONTENT.nodes.forEach((node) => {
      if (node.level > 0) {
        if (!map[node.groupId]) map[node.groupId] = [];
        map[node.groupId].push(node);
      }
    });
    return map;
  }, []);

  const selectedNode = useMemo(
    () => (selectedNodeId ? EMOTIONS_CONTENT.nodes.find((n) => n.id === selectedNodeId) : null),
    [selectedNodeId],
  );

  const selectedColor = useMemo(() => {
    if (!selectedNode) return null;
    const palette =
      EMOTION_PALETTES.default[selectedNode.groupId as keyof (typeof EMOTION_PALETTES)['default']];
    return palette?.[selectedNode.colorIndex] ?? null;
  }, [selectedNode]);

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
      // Auto-select the root emotion for this group (level 0, id === groupId)
      setSelectedNodeId(groupId);
    }
  };

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleContinue = () => {
    if (!selectedNodeId) return;
    setStep('context');
  };

  const handleBack = () => {
    setStep('emotion');
  };

  const handleSave = () => {
    if (!selectedNodeId) return;
    const lines: string[] = [];
    if (note.trim()) lines.push(note.trim());
    if (activities.size > 0) lines.push(`Doing: ${[...activities].join(', ')}`);
    if (people.size > 0) lines.push(`With: ${[...people].join(', ')}`);
    if (locations.size > 0) lines.push(`At: ${[...locations].join(', ')}`);
    onSave(selectedNodeId, lines.length > 0 ? lines.join('\n') : undefined);
    resetState();
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const toggleTag = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, tag: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: BG }}
      >
        {step === 'emotion' ? (
          <>
            {/* Handle bar */}
            <View
              style={{
                width: 36,
                height: 4,
                backgroundColor: '#48484A',
                borderRadius: 2,
                alignSelf: 'center',
                marginTop: 12,
                marginBottom: 4,
              }}
            />

            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: '700',
                    fontFamily: 'Fraunces',
                    color: TEXT,
                  }}
                >
                  What are you feeling?
                </Text>
                <Text style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>
                  {getTimeSubtitle()}
                </Text>
              </View>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => ({
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: STROKE,
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
                  marginLeft: 16,
                  opacity: pressed ? 0.7 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={{ fontSize: 13, color: MUTED }}>✕</Text>
              </Pressable>
            </View>

            {/* Accordion emotion list */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 4,
                paddingBottom: selectedNode ? 140 : 32,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {EMOTIONS_CONTENT.groups.map((group) => (
                <AccordionGroup
                  key={group.id}
                  group={group}
                  childrenNodes={nodesByGroup[group.id] || []}
                  isOpen={activeGroupId === group.id}
                  selectedNodeId={selectedNodeId}
                  onToggle={() => handleToggleGroup(group.id)}
                  onSelectNode={handleSelectNode}
                />
              ))}
            </ScrollView>

            {/* Sticky footer — visible when an emotion is selected */}
            {selectedNode && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: BG,
                  borderTopWidth: 1,
                  borderTopColor: STROKE,
                  paddingHorizontal: 20,
                  paddingTop: 14,
                  paddingBottom: Math.max(insets.bottom, 20),
                }}
              >
                {/* Selected preview */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: selectedColor ?? MUTED,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      color: TEXT,
                      fontWeight: '600',
                      fontFamily: 'Fraunces',
                      textTransform: 'capitalize',
                    }}
                  >
                    {selectedNode.label}
                  </Text>
                </View>

                {/* Continue button */}
                <Pressable
                  onPress={handleContinue}
                  style={({ pressed }) => ({
                    paddingVertical: 16,
                    borderRadius: 100,
                    alignItems: 'center' as const,
                    backgroundColor: selectedColor ?? STROKE,
                    opacity: pressed ? 0.88 : 1,
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  })}
                  accessibilityRole="button"
                  accessibilityLabel="Continue"
                >
                  <Text style={{ fontSize: 17, fontWeight: '600', color: '#050505' }}>
                    Continue →
                  </Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Step 2 header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: STROKE,
              }}
            >
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <Text style={{ fontSize: 15, color: selectedColor ?? TEXT, fontWeight: '500' }}>
                  ← Back
                </Text>
              </Pressable>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <View
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: selectedColor ?? MUTED,
                  }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    fontFamily: 'Fraunces',
                    color: TEXT,
                    textTransform: 'capitalize',
                  }}
                >
                  {selectedNode?.label}
                </Text>
              </View>

              <Pressable
                onPress={handleClose}
                style={({ pressed }) => ({
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: STROKE,
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
                  opacity: pressed ? 0.7 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={{ fontSize: 13, color: MUTED }}>✕</Text>
              </Pressable>
            </View>

            {/* Context content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 24,
                paddingBottom: 120,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Note input */}
              <View
                style={{
                  marginBottom: 28,
                  backgroundColor: SURFACE,
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  minHeight: 80,
                }}
              >
                <TextInput
                  style={{ fontSize: 15, color: TEXT, minHeight: 56 }}
                  placeholder="What's on your mind? (optional)"
                  placeholderTextColor={MUTED}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  maxLength={200}
                  returnKeyType="done"
                  submitBehavior="blurAndSubmit"
                />
              </View>

              {/* Context tag sections */}
              <TagSection
                title="What are you doing?"
                tags={ACTIVITY_TAGS}
                selected={activities}
                color={selectedColor}
                onToggle={(tag) => toggleTag(setActivities, tag)}
              />
              <TagSection
                title="Who are you with?"
                tags={PEOPLE_TAGS}
                selected={people}
                color={selectedColor}
                onToggle={(tag) => toggleTag(setPeople, tag)}
              />
              <TagSection
                title="Where are you?"
                tags={LOCATION_TAGS}
                selected={locations}
                color={selectedColor}
                onToggle={(tag) => toggleTag(setLocations, tag)}
              />
            </ScrollView>

            {/* Save button */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: Math.max(insets.bottom, 20),
                borderTopWidth: 1,
                borderTopColor: STROKE,
              }}
            >
              <Pressable
                onPress={handleSave}
                style={({ pressed }) => ({
                  paddingVertical: 16,
                  borderRadius: 100,
                  alignItems: 'center' as const,
                  backgroundColor: selectedColor ?? STROKE,
                  opacity: pressed ? 0.88 : 1,
                  transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                })}
                accessibilityRole="button"
                accessibilityLabel={
                  selectedNode ? `Save ${selectedNode.label} check-in` : 'Save check-in'
                }
              >
                <Text style={{ fontSize: 17, fontWeight: '600', color: '#050505' }}>
                  Save check-in
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
