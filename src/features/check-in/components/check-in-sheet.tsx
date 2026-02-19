import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EMOTIONS_CONTENT } from '@/src/features/emotion-accordion/content';
import { EMOTION_PALETTES } from '@/src/features/emotion-accordion/palettes';
import type { EmotionGroupId } from '@/src/features/emotion-accordion/types';
import type { TimeSlot } from '../utils/time-of-day';
import { getTimeSlotLabel } from '../utils/time-of-day';

// Sheet is always dark regardless of app theme
const BG = '#111113';
const SURFACE = '#1C1C1E';
const STROKE = '#2C2C2E';
const MUTED = '#8E8E93';
const TEXT = '#F2F2F7';
const GOLD = '#E0C097';

type Props = {
  visible: boolean;
  slot: TimeSlot;
  onClose: () => void;
  onSave: (nodeId: string, note?: string) => void;
};

export function CheckInSheet({ visible, slot, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [activeGroupId, setActiveGroupId] = useState<EmotionGroupId>('happy');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [note, setNote] = useState('');

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

  const childNodes = useMemo(
    () => EMOTIONS_CONTENT.nodes.filter((n) => n.groupId === activeGroupId && n.level > 0),
    [activeGroupId],
  );

  const handleGroupSelect = (groupId: EmotionGroupId) => {
    setActiveGroupId(groupId);
    setSelectedNodeId(null);
  };

  const handleSave = () => {
    if (!selectedNodeId) return;
    onSave(selectedNodeId, note.trim() || undefined);
    setSelectedNodeId(null);
    setNote('');
  };

  const handleClose = () => {
    setSelectedNodeId(null);
    setNote('');
    onClose();
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
              {getTimeSlotLabel(slot)} check-in
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

        {/* Emotion Group Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 8,
            paddingBottom: 4,
          }}
          style={{ flexGrow: 0, marginBottom: 8 }}
        >
          {EMOTIONS_CONTENT.groups.map((group) => {
            const isActive = activeGroupId === group.id;
            return (
              <Pressable
                key={group.id}
                onPress={() => handleGroupSelect(group.id as EmotionGroupId)}
                style={({ pressed }) => ({
                  flexDirection: 'row' as const,
                  alignItems: 'center' as const,
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: isActive ? group.color : STROKE,
                  backgroundColor: isActive ? group.color + '22' : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: group.color,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: isActive ? group.color : MUTED,
                  }}
                >
                  {group.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Emotion Chips Grid */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            paddingVertical: 8,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {childNodes.map((node) => {
            const palette =
              EMOTION_PALETTES.default[node.groupId as keyof (typeof EMOTION_PALETTES)['default']];
            const color = palette?.[node.colorIndex] ?? MUTED;
            const isSelected = selectedNodeId === node.id;

            return (
              <Pressable
                key={node.id}
                onPress={() => setSelectedNodeId((prev) => (prev === node.id ? null : node.id))}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 100,
                  borderWidth: 1.5,
                  borderColor: color,
                  backgroundColor: isSelected ? color : 'transparent',
                  opacity: pressed ? 0.85 : 1,
                })}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={node.label}
              >
                <Text
                  style={{
                    fontSize: 14,
                    textTransform: 'capitalize',
                    color: isSelected ? '#050505' : color,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                  numberOfLines={1}
                >
                  {node.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Note Input */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 12,
            backgroundColor: SURFACE,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            minHeight: 66,
          }}
        >
          <TextInput
            style={{
              fontSize: 15,
              color: TEXT,
              minHeight: 46,
            }}
            placeholder="Add a note... (optional)"
            placeholderTextColor={MUTED}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
            returnKeyType="done"
            blurOnSubmit
          />
        </View>

        {/* Save Button */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom, 20),
          }}
        >
          <Pressable
            onPress={handleSave}
            disabled={!selectedNodeId}
            style={({ pressed }) => ({
              paddingVertical: 16,
              borderRadius: 100,
              alignItems: 'center' as const,
              backgroundColor: selectedColor ?? STROKE,
              opacity: pressed && selectedNodeId ? 0.88 : 1,
              transform: pressed && selectedNodeId ? [{ scale: 0.98 }] : [{ scale: 1 }],
            })}
            accessibilityRole="button"
            accessibilityLabel={
              selectedNode ? `Save ${selectedNode.label}` : 'Select a mood to save'
            }
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                color: selectedColor ? '#050505' : MUTED,
              }}
            >
              {selectedNode ? `Save — ${selectedNode.label}` : 'Select how you feel'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
