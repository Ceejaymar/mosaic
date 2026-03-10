import { memo, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
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
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { hexToRgba, isLightColor } from '@/src/utils/color-ui';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (nodeId: string, note?: string, tags?: string[]) => void;
};

function CloseButton({ onPress }: { onPress: () => void }) {
  const colors = useAccessibleColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.closeBtn,
        { backgroundColor: colors.divider },
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Close"
    >
      <AppText colorVariant="muted" style={styles.closeIcon}>
        ✕
      </AppText>
    </Pressable>
  );
}

export const CheckInSheet = memo(function CheckInSheet({ visible, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();

  const form = useCheckInForm(onSave, onClose);

  const selectedNode = useMemo(() => getEmotionNode(form.selectedNodeId), [form.selectedNodeId]);

  const selectedColor = useMemo(() => getEmotionColor(selectedNode), [selectedNode]);

  const bannerBg = selectedColor ?? colors.divider;
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
            <View style={[styles.handleBar, { backgroundColor: colors.divider }]} />

            <View style={styles.header}>
              <View style={styles.flex1}>
                <AppText variant="heading" style={styles.title}>
                  What are you feeling?
                </AppText>
                <AppText variant="mono" colorVariant="muted" style={styles.subtitle}>
                  {getTimeSubtitle()}
                </AppText>
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
            <View style={[styles.step2Header, { borderBottomColor: colors.divider }]}>
              <Pressable
                onPress={() => form.setStep('emotion')}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <AppText
                  style={[styles.backBtn, { color: selectedColor ?? theme.colors.typography }]}
                >
                  ← Back
                </AppText>
              </Pressable>

              <View style={styles.selectedEmotionPill}>
                <View
                  style={[
                    styles.emotionDot,
                    { backgroundColor: selectedColor ?? colors.textMuted },
                  ]}
                />
                <AppText variant="heading" style={styles.selectedEmotionText}>
                  {selectedNode?.label}
                </AppText>
              </View>

              <CloseButton onPress={form.handleClose} />
            </View>

            <ScrollView
              style={styles.flex1}
              contentContainerStyle={styles.contextScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={[styles.emotionBanner, { backgroundColor: bannerBg }]}>
                <AppText
                  variant="mono"
                  style={[styles.emotionBannerPre, { color: hexToRgba(bannerTextColor, 0.7) }]}
                >
                  I'm feeling
                </AppText>
                <AppText
                  variant="heading"
                  style={[styles.emotionBannerText, { color: bannerTextColor }]}
                >
                  {selectedNode?.label}
                </AppText>
              </View>

              <AppText variant="mono" colorVariant="muted" style={styles.inputLabel}>
                What's on your mind?
              </AppText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add a note... (optional)"
                  placeholderTextColor={colors.textMuted}
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

            <View
              style={[
                styles.footer,
                { paddingBottom: Math.max(insets.bottom, 20), borderTopColor: colors.divider },
              ]}
            >
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
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing[3],
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[4],
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.typography,
    letterSpacing: -0.66,
  },
  subtitle: { fontSize: theme.fontSize.sm, marginTop: 4, lineHeight: 22 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing[4],
    shadowColor: theme.colors.typography,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  closeIcon: { fontSize: theme.fontSize.sm },

  // Step 2 Styles
  step2Header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[4],
    borderBottomWidth: 1,
  },
  backBtn: { fontSize: theme.fontSize.md, fontWeight: '500' },
  selectedEmotionPill: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  emotionDot: { width: 8, height: 8, borderRadius: 4 },
  selectedEmotionText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.typography,
    textTransform: 'capitalize',
  },
  contextScroll: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[6],
    paddingBottom: 120,
  },
  emotionBanner: {
    borderRadius: theme.radius.sheet,
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[5],
    marginBottom: theme.spacing[6],
  },
  emotionBannerPre: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  emotionBannerText: {
    fontSize: 36,
    fontWeight: '700',
    textTransform: 'capitalize',
    lineHeight: 40,
    letterSpacing: -1.08,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: theme.spacing[2],
    textTransform: 'uppercase',
  },
  inputContainer: {
    marginBottom: 28,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    minHeight: 80,
    shadowColor: theme.colors.typography,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: {
    fontSize: theme.fontSize.md,
    color: theme.colors.typography,
    minHeight: 56,
    lineHeight: 25,
  },
  footer: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
  },
}));
