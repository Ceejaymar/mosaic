import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { PreferenceSheet } from '@/src/components/preference-sheet';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { useAppStore } from '@/src/store/useApp';
import type { PreferencesState } from '@/src/types/types';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FIRST_DAY_OPTIONS = [
  { label: 'Sunday', value: 'sunday' },
  { label: 'Monday', value: 'monday' },
];

const TIME_FORMAT_OPTIONS = [
  { label: 'Device Default', value: 'device' },
  { label: '12-hour', value: '12h' },
  { label: '24-hour', value: '24h' },
];

const FIRST_DAY_LABELS: Record<PreferencesState['firstDayOfWeek'], string> = {
  sunday: 'Sunday',
  monday: 'Monday',
};

const TIME_FORMAT_LABELS: Record<PreferencesState['timeFormat'], string> = {
  device: 'Device Default',
  '12h': '12-hour',
  '24h': '24-hour',
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PreferencesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();

  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);

  const [activeSheet, setActiveSheet] = useState<'none' | 'firstDay' | 'timeFormat'>('none');

  const handleBackToDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleSetPreference = <K extends keyof PreferencesState>(
    key: K,
    value: PreferencesState[K],
  ) => {
    hapticLight();
    setPreference(key, value);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ─── Header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={handleBackToDrawer}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Open navigation drawer"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.typography} />
          </Pressable>

          <Pressable
            onPress={() => router.navigate('/(tabs)/' as Href)}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Go to home"
          >
            <Ionicons name="home-outline" size={24} color={theme.colors.typography} />
          </Pressable>
        </View>

        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          Preferences
        </AppText>
      </View>

      {/* ─── Content ─── */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Date & Time ── */}
        <AppText colorVariant="muted" style={styles.sectionLabel}>
          Date &amp; Time
        </AppText>

        <View style={[styles.flatCard, { backgroundColor: theme.colors.surface }]}>
          {/* First day of week */}
          <Pressable
            onPress={() => setActiveSheet('firstDay')}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel={`First day of week: ${FIRST_DAY_LABELS[preferences.firstDayOfWeek]}. Tap to change.`}
          >
            <AppText style={styles.rowLabel}>First day of week</AppText>
            <View style={styles.dropdownTrigger}>
              <AppText colorVariant="muted" style={styles.dropdownValue}>
                {FIRST_DAY_LABELS[preferences.firstDayOfWeek]}
              </AppText>
              <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
            </View>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Time format */}
          <Pressable
            onPress={() => setActiveSheet('timeFormat')}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel={`Time format: ${TIME_FORMAT_LABELS[preferences.timeFormat]}. Tap to change.`}
          >
            <AppText style={styles.rowLabel}>Time format</AppText>
            <View style={styles.dropdownTrigger}>
              <AppText colorVariant="muted" style={styles.dropdownValue}>
                {TIME_FORMAT_LABELS[preferences.timeFormat]}
              </AppText>
              <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
            </View>
          </Pressable>
        </View>

        {/* ── Dashboard ── */}
        <AppText colorVariant="muted" style={[styles.sectionLabel, { marginTop: 24 }]}>
          Dashboard
        </AppText>

        <View style={[styles.flatCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText style={styles.rowLabel}>Hide streaks</AppText>
              <AppText colorVariant="muted" style={styles.rowSub}>
                Hide day counters from the dashboard
              </AppText>
            </View>
            <Switch
              value={preferences.hideStreaks}
              onValueChange={(val) => handleSetPreference('hideStreaks', val)}
              trackColor={{ false: colors.divider, true: theme.colors.mosaicGold }}
              thumbColor="#ffffff"
              accessibilityLabel="Hide streaks"
            />
          </View>
        </View>
      </ScrollView>

      {/* ─── Bottom Sheet ─── */}
      <PreferenceSheet
        visible={activeSheet !== 'none'}
        onClose={() => setActiveSheet('none')}
        title={activeSheet === 'firstDay' ? 'First day of week' : 'Time format'}
        options={activeSheet === 'firstDay' ? FIRST_DAY_OPTIONS : TIME_FORMAT_OPTIONS}
        selectedValue={
          activeSheet === 'firstDay' ? preferences.firstDayOfWeek : preferences.timeFormat
        }
        onSelect={(val) => {
          handleSetPreference(
            activeSheet === 'firstDay' ? 'firstDayOfWeek' : 'timeFormat',
            val as PreferencesState['firstDayOfWeek'] & PreferencesState['timeFormat'],
          );
          setActiveSheet('none');
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
  },
  iconBtnPressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: theme.spacing[2],
    marginLeft: 4,
  },
  flatCard: {
    borderRadius: theme.radius.card,
    paddingHorizontal: theme.spacing[4],
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[4],
  },
  rowText: {
    flex: 1,
    paddingRight: 16,
  },
  rowLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: '500',
    color: theme.colors.typography,
  },
  rowSub: {
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.8,
  },
  dropdownValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
}));
