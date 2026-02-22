import { memo, useMemo } from 'react';
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

import { PillButton } from '@/src/components/pill-button';
import { TagSection } from '@/src/features/check-in/components/context-tags';
import {
  ACTIVITY_TAGS,
  LOCATION_TAGS,
  PEOPLE_TAGS,
} from '@/src/features/check-in/data/context-tags';
import { useCheckInForm } from '@/src/features/check-in/hooks/useCheckInForm';
import { getTimeSubtitle } from '@/src/features/check-in/utils/time-of-day';
import { EmotionSelector } from '@/src/features/emotion-accordion/components/emotion-selector';
import {
  getEmotionColor,
  getEmotionNode,
} from '@/src/features/emotion-accordion/utils/emotion-utils';
import { hexToRgba, isLightColor } from '@/src/utils/color-ui';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (nodeId: string, note?: string, tags?: string[]) => void;
};

function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel="Close"
    >
      <Text style={styles.closeIcon}>✕</Text>
    </Pressable>
  );
}

export const CheckInSheet = memo(function CheckInSheet({ visible, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const form = useCheckInForm(onSave, onClose);

  const selectedNode = useMemo(() => getEmotionNode(form.selectedNodeId), [form.selectedNodeId]);

  const selectedColor = useMemo(() => getEmotionColor(selectedNode), [selectedNode]);

  const bannerBg = selectedColor ?? theme.colors.divider;
  const bannerTextColor = isLightColor(bannerBg) ? theme.colors.onAccent : '#ffffff';

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
              <CloseButton onPress={form.handleClose} />
            </View>

            <EmotionSelector
              selectedNodeId={form.selectedNodeId}
              activeGroupId={form.activeGroupId}
              onSelectNode={form.setSelectedNodeId}
              onToggleGroup={form.handleToggleGroup}
              onSelectionPress={() => {
                if (form.selectedNodeId) form.setStep('context');
              }}
              scrollPaddingBottom={form.selectedNodeId ? 160 : 32}
            />
          </>
        ) : (
          <>
            <View style={styles.step2Header}>
              <Pressable
                onPress={() => form.setStep('emotion')}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
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

              <CloseButton onPress={form.handleClose} />
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
                <Text style={[styles.emotionBannerPre, { color: hexToRgba(bannerTextColor, 0.7) }]}>
                  I'm feeling
                </Text>
                <Text style={[styles.emotionBannerText, { color: bannerTextColor }]}>
                  {selectedNode?.label}
                </Text>
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
                onToggle={form.toggleActivity}
              />
              <TagSection
                title="Who are you with?"
                tags={PEOPLE_TAGS}
                selected={form.people}
                color={selectedColor}
                onToggle={form.togglePerson}
              />
              <TagSection
                title="Where are you?"
                tags={LOCATION_TAGS}
                selected={form.locations}
                color={selectedColor}
                onToggle={form.toggleLocation}
              />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <PillButton label="Save check-in" onPress={form.handleSave} elevated />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
});

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
    letterSpacing: -0.66,
  },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4, lineHeight: 22 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    shadowColor: theme.colors.typography,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  closeIcon: { fontSize: 13, color: theme.colors.textMuted },

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
  selectedEmotionPill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emotionDot: { width: 8, height: 8, borderRadius: 4 },
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
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  emotionBannerText: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    textTransform: 'capitalize',
    lineHeight: 40,
    letterSpacing: -1.08,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
    shadowColor: theme.colors.typography,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: { fontSize: 15, color: theme.colors.typography, minHeight: 56, lineHeight: 25 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
}));
