import { useMemo } from 'react';
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
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AccordionGroup } from '@/src/features/emotion-accordion/components/accordion-group';
import { SelectionModal } from '@/src/features/emotion-accordion/components/selection-modal';
import { EMOTIONS_CONTENT } from '@/src/features/emotion-accordion/content';
import { EMOTION_PALETTES } from '@/src/features/emotion-accordion/palettes';
import type { EmotionNode } from '@/src/features/emotion-accordion/types';
import { muteColor } from '@/src/features/emotion-accordion/utils/color';
import { ACTIVITY_TAGS, LOCATION_TAGS, PEOPLE_TAGS } from '../data/context-tags';
import { useCheckInForm } from '../hooks/useCheckInsForm';
import { getTimeSubtitle } from '../utils/time-of-day';
import { TagSection } from './context-tags';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (nodeId: string, note?: string) => void;
};

export function CheckInSheet({ visible, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const form = useCheckInForm(onSave, onClose);

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
    () =>
      form.selectedNodeId
        ? (EMOTIONS_CONTENT.nodes.find((n) => n.id === form.selectedNodeId) ?? null)
        : null,
    [form.selectedNodeId],
  );

  const selectedColor = useMemo(() => {
    if (!selectedNode) return null;
    const palette =
      EMOTION_PALETTES.default[selectedNode.groupId as keyof typeof EMOTION_PALETTES.default];
    const raw = palette?.[selectedNode.colorIndex] ?? null;
    return raw ? muteColor(raw) : null;
  }, [selectedNode]);

  const selectionModalBottom = Math.max(insets.bottom, 16) + 8;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
      onRequestClose={form.handleClose}
      onDismiss={form.resetState}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {form.step === 'emotion' ? (
          <>
            <View style={styles.handleBar} />

            <View style={styles.header}>
              <View style={styles.flex1}>
                <Text style={styles.title}>What are you feeling?</Text>
                <Text style={styles.subtitle}>{getTimeSubtitle()}</Text>
              </View>
              <Pressable onPress={form.handleClose} style={styles.closeBtn}>
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.flex1}
              contentContainerStyle={styles.emotionScroll(!!selectedNode)}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {EMOTIONS_CONTENT.groups.map((group) => (
                <AccordionGroup
                  key={group.id}
                  group={group}
                  childrenNodes={nodesByGroup[group.id] || []}
                  isOpen={form.activeGroupId === group.id}
                  selectedNodeId={form.selectedNodeId}
                  onToggle={() => form.handleToggleGroup(group.id)}
                  onSelectNode={form.setSelectedNodeId}
                />
              ))}
            </ScrollView>

            <SelectionModal
              selectedNode={selectedNode}
              onPress={() => {
                if (form.selectedNodeId) form.setStep('context');
              }}
              style={{ bottom: selectionModalBottom }}
            />
          </>
        ) : (
          <>
            <View style={styles.step2Header}>
              <Pressable onPress={() => form.setStep('emotion')}>
                <Text style={[styles.backBtn, { color: selectedColor ?? theme.colors.typography }]}>
                  ← Back
                </Text>
              </Pressable>

              <View style={styles.selectedEmotionPill}>
                <View
                  style={[
                    styles.emotionDot,
                    { backgroundColor: selectedColor ?? theme.colors.textMuted },
                  ]}
                />
                <Text style={styles.selectedEmotionText}>{selectedNode?.label}</Text>
              </View>

              <Pressable onPress={form.handleClose} style={styles.closeBtn}>
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.flex1}
              contentContainerStyle={styles.contextScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[
                  styles.emotionBanner,
                  { backgroundColor: selectedColor ?? theme.colors.divider },
                ]}
              >
                <Text style={styles.emotionBannerPre}>I'm feeling</Text>
                <Text style={styles.emotionBannerText}>{selectedNode?.label}</Text>
              </View>

              <Text style={styles.inputLabel}>What's on your mind?</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add a note... (optional)"
                  placeholderTextColor={theme.colors.textMuted}
                  value={form.note}
                  onChangeText={form.setNote}
                  multiline
                  maxLength={200}
                  returnKeyType="done"
                  submitBehavior="blurAndSubmit"
                />
              </View>

              <TagSection
                title="What are you doing?"
                tags={ACTIVITY_TAGS}
                selected={form.activities}
                color={selectedColor}
                onToggle={(tag) => form.toggleTag(form.setActivities, tag)}
              />
              <TagSection
                title="Who are you with?"
                tags={PEOPLE_TAGS}
                selected={form.people}
                color={selectedColor}
                onToggle={(tag) => form.toggleTag(form.setPeople, tag)}
              />
              <TagSection
                title="Where are you?"
                tags={LOCATION_TAGS}
                selected={form.locations}
                color={selectedColor}
                onToggle={(tag) => form.toggleTag(form.setLocations, tag)}
              />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <Pressable
                onPress={form.handleSave}
                style={({ pressed }) => [
                  styles.saveBtn,
                  pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={styles.saveBtnText}>Save check-in</Text>
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  flex1: { flex: 1 },
  keyboardContainer: { flex: 1, backgroundColor: theme.colors.background },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
  },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 3 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  closeIcon: { fontSize: 13, color: theme.colors.textMuted },
  emotionScroll: (hasSelected: boolean) => ({
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: hasSelected ? 160 : 32,
  }),

  // Step 2 Styles
  step2Header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backBtn: { fontSize: 15, fontWeight: '500' },
  selectedEmotionPill: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  emotionDot: { width: 9, height: 9, borderRadius: 5 },
  selectedEmotionText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    textTransform: 'capitalize',
  },
  contextScroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
  emotionBanner: { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 20, marginBottom: 24 },
  emotionBannerPre: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(5,5,5,0.55)',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  emotionBannerText: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: '#050505',
    textTransform: 'capitalize',
    lineHeight: 40,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputContainer: {
    marginBottom: 28,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 80,
  },
  textInput: { fontSize: 15, color: theme.colors.typography, minHeight: 56 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    backgroundColor: theme.colors.mosaicGold,
  },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: '#050505' },
}));
