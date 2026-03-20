import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
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
import {
  type CheckInFormInitialData,
  useCheckInForm,
} from '@/src/features/check-in/hooks/useCheckInForm';
import { getTimeSubtitle } from '@/src/features/check-in/utils/time-of-day';
import { EmotionSelector } from '@/src/features/emotion-accordion/components/emotion-selector';
import {
  getEmotionColor,
  getEmotionNode,
} from '@/src/features/emotion-accordion/utils/emotion-utils';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { hexToRgba, isLightColor } from '@/src/utils/color-ui';
import { getDayWithSuffix } from '@/src/utils/format-date';

function formatHistoricalDate(dateKey: string, locale = 'en-US'): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const month = date.toLocaleDateString(locale, { month: 'long' });
  return `${month} ${getDayWithSuffix(d)}`;
}

const TODAY_KEY = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

export type CheckInFormUIProps = {
  initialData?: CheckInFormInitialData;
  onSave: (nodeId: string, note?: string, tags?: string[]) => void;
  onClose: () => void;
  onViewFullDay?: () => void;
  showDelete?: boolean;
  onDelete?: () => void;
  showHandleBar?: boolean;
  isModal?: boolean;
  onBack?: () => void;
  onHome?: () => void;
};

function CloseButton({ onPress }: { onPress: () => void }) {
  const colors = useAccessibleColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
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

function HomeButton({ onPress }: { onPress?: () => void }) {
  const { theme } = useUnistyles();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.5 }]}
      accessibilityRole="button"
      accessibilityLabel="Go home"
    >
      <Ionicons name="home-outline" size={20} color={theme.colors.textMuted} />
    </Pressable>
  );
}

export const CheckInFormUI = memo(function CheckInFormUI({
  initialData,
  onSave,
  onClose,
  onViewFullDay,
  showDelete,
  onDelete,
  showHandleBar,
  isModal = false,
  onBack,
  onHome,
}: CheckInFormUIProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();
  const { i18n } = useTranslation();

  const form = useCheckInForm(onSave, onClose, initialData);

  const selectedNode = useMemo(() => getEmotionNode(form.selectedNodeId), [form.selectedNodeId]);
  const selectedColor = useMemo(() => getEmotionColor(selectedNode), [selectedNode]);

  const isHistorical = !!form.targetDate && form.targetDate !== TODAY_KEY;
  const headerTitle = form.isEditing
    ? 'Edit Check-in'
    : isHistorical && form.targetDate
      ? `How were you feeling on ${formatHistoricalDate(form.targetDate, i18n.language)}?`
      : 'What are you feeling?';
  const headerSubtitle =
    form.isEditing && form.targetDate
      ? formatHistoricalDate(form.targetDate, i18n.language)
      : isHistorical
        ? null
        : getTimeSubtitle();

  const bannerBg = selectedColor ?? colors.divider;
  const bannerTextColor = isLightColor(bannerBg) ? theme.colors.onAccent : '#ffffff';

  const [isNoteModalVisible, setNoteModalVisible] = useState(false);
  const [draftNote, setDraftNote] = useState('');
  const handleOpenNote = () => {
    setDraftNote(form.note || '');
    setNoteModalVisible(true);
  };
  const handleSaveNote = () => {
    form.setNote(draftNote.trim());
    setNoteModalVisible(false);
  };
  const handleCancelNote = () => {
    setNoteModalVisible(false);
  };

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const headerPillAnimStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [50, 90], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [50, 90], [8, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <>
      {form.step === 'emotion' ? (
        <>
          {showHandleBar && (
            <View style={[styles.handleBar, { backgroundColor: colors.divider }]} />
          )}

          <View style={styles.header}>
            <View style={styles.flex1}>
              {!isModal && (
                <Pressable
                  onPress={() => form.setStep('context')}
                  style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.6 }]}
                >
                  <AppText font="mono" colorVariant="muted" style={styles.cancelText}>
                    ← Cancel
                  </AppText>
                </Pressable>
              )}
              <AppText font="heading" style={styles.title}>
                {headerTitle}
              </AppText>
              {headerSubtitle && (
                <AppText font="mono" colorVariant="muted" style={styles.subtitle}>
                  {headerSubtitle}
                </AppText>
              )}
              {form.isEditing && onViewFullDay && (
                <Pressable
                  onPress={onViewFullDay}
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                >
                  <AppText font="mono" colorVariant="muted" style={styles.viewFullDay}>
                    View Full Day →
                  </AppText>
                </Pressable>
              )}
            </View>
            {isModal ? <CloseButton onPress={form.handleClose} /> : <HomeButton onPress={onHome} />}
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
              onPress={() => (isModal ? form.setStep('emotion') : onBack?.())}
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <AppText
                style={[styles.backBtn, { color: selectedColor ?? theme.colors.typography }]}
              >
                ← Back
              </AppText>
            </Pressable>

            <Animated.View style={[styles.selectedEmotionPill, headerPillAnimStyle]}>
              <View
                style={[styles.emotionDot, { backgroundColor: selectedColor ?? colors.textMuted }]}
              />
              <AppText font="heading" style={styles.selectedEmotionText}>
                {selectedNode?.label}
              </AppText>
            </Animated.View>

            {isModal ? <CloseButton onPress={form.handleClose} /> : <HomeButton onPress={onHome} />}
          </View>

          <Animated.ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.contextScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          >
            <Pressable
              onPress={() => form.setStep('emotion')}
              style={({ pressed }) => [
                styles.emotionBanner,
                { backgroundColor: bannerBg },
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Change emotion"
            >
              <AppText
                font="mono"
                style={[styles.emotionBannerPre, { color: hexToRgba(bannerTextColor, 0.7) }]}
              >
                I'm feeling
              </AppText>
              <AppText
                font="heading"
                style={[styles.emotionBannerText, { color: bannerTextColor }]}
              >
                {selectedNode?.label}
              </AppText>
              <View style={styles.emotionBannerEdit}>
                <Ionicons name="pencil-outline" size={14} color={bannerTextColor} />
              </View>
            </Pressable>

            <AppText font="mono" colorVariant="muted" style={styles.inputLabel}>
              What's on your mind?
            </AppText>
            <Pressable
              onPress={handleOpenNote}
              style={({ pressed }) => [styles.inputContainer, pressed && { opacity: 0.7 }]}
            >
              {form.note ? (
                <AppText style={styles.notePreviewText} numberOfLines={5}>
                  {form.note}
                </AppText>
              ) : (
                <AppText style={styles.notePlaceholder}>Add a note... (optional)</AppText>
              )}
            </Pressable>

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

            {showDelete && onDelete && (
              <Pressable
                onPress={onDelete}
                style={({ pressed }) => [styles.deleteAction, pressed && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Delete this check-in"
              >
                <AppText style={styles.deleteActionText}>Delete check-in</AppText>
              </Pressable>
            )}
          </Animated.ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 20), borderTopColor: colors.divider },
            ]}
          >
            <PillButton
              label={form.isEditing ? 'Save changes' : 'Save check-in'}
              onPress={form.handleSave}
              disabled={form.isSaving}
              elevated
            />
          </View>

          <Modal
            visible={isNoteModalVisible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
            onRequestClose={handleCancelNote}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[styles.noteModal, { backgroundColor: theme.colors.background }]}
            >
              <View
                style={[
                  styles.noteModalHeader,
                  {
                    borderBottomColor: colors.divider,
                    paddingTop: Math.max(insets.top, theme.spacing[4]),
                  },
                ]}
              >
                <Pressable
                  onPress={handleCancelNote}
                  hitSlop={8}
                  style={({ pressed }) => pressed && { opacity: 0.5 }}
                >
                  <AppText font="mono" colorVariant="muted" style={styles.noteModalCancel}>
                    Cancel
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={handleSaveNote}
                  hitSlop={8}
                  style={({ pressed }) => pressed && { opacity: 0.5 }}
                >
                  <AppText style={[styles.noteModalSave, { color: theme.colors.mosaicGold }]}>
                    Save
                  </AppText>
                </Pressable>
              </View>
              <TextInput
                style={[styles.noteModalInput, { color: theme.colors.typography }]}
                multiline
                autoFocus
                value={draftNote}
                onChangeText={setDraftNote}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.textMuted}
                textAlignVertical="top"
              />
            </KeyboardAvoidingView>
          </Modal>
        </>
      )}
    </>
  );
});

const styles = StyleSheet.create((theme) => ({
  flex1: { flex: 1 },
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
  cancelBtn: {
    marginBottom: theme.spacing[2],
  },
  cancelText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.typography,
    letterSpacing: -0.66,
  },
  subtitle: { fontSize: theme.fontSize.sm, marginTop: 4, lineHeight: 22 },
  viewFullDay: { fontSize: theme.fontSize.xs, marginTop: theme.spacing[2] },
  iconBtn: {
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
  homeBtn: {
    padding: theme.spacing[2],
    marginLeft: theme.spacing[2],
  },

  // Step 2 Styles
  step2Header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[4],
    borderBottomWidth: 0.5,
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
    paddingBottom: theme.spacing[8],
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
  emotionBannerEdit: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.6,
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
  notePreviewText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.typography,
    lineHeight: 24,
  },
  notePlaceholder: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  noteModal: { flex: 1 },
  noteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 0.5,
  },
  noteModalCancel: { fontSize: theme.fontSize.md },
  noteModalSave: { fontSize: theme.fontSize.md, fontWeight: '700' },
  noteModalInput: {
    flex: 1,
    padding: theme.spacing[5],
    fontSize: 18,
    lineHeight: 28,
  },
  footer: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
    borderTopWidth: 0.5,
  },
  deleteAction: {
    alignItems: 'center',
    paddingVertical: theme.spacing[5],
    marginTop: theme.spacing[4],
  },
  deleteActionText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.destructive,
  },
}));
