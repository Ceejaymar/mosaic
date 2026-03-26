import { DrawerToggleButton } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { DemoBadge } from '@/src/components/demo-badge';
import { PillButton } from '@/src/components/pill-button';
import { Surface } from '@/src/components/surface';
import { TopFade } from '@/src/components/top-fade';
import { LAYOUT } from '@/src/constants/layout';
import { onOpenCheckInSheet } from '@/src/features/check-in/check-in-sheet-events';
import { CheckInHistory } from '@/src/features/check-in/components/check-in-history';
import { CheckInSheet } from '@/src/features/check-in/components/check-in-sheet';
import {
  MosaicDisplay,
  type MosaicTileData,
} from '@/src/features/check-in/components/mosaic-display';
import { CHECK_IN_CONSTANTS } from '@/src/features/check-in/constants/check-in';
import { useTodayCheckIns } from '@/src/features/check-in/hooks/useCheckIns';
import { useStats } from '@/src/features/check-in/hooks/useStats';
import { generateDailyObservation } from '@/src/features/check-in/utils/daily-observations';
import { getMoodDisplayInfo } from '@/src/features/check-in/utils/mood-helpers';
import { getCurrentTimeSlot } from '@/src/features/check-in/utils/time-of-day';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { useAppStore } from '@/src/store/useApp';
import { enableAndroidLayoutAnimations } from '@/src/utils/animations';
import { getDayWithSuffix } from '@/src/utils/format-date';

const OBS_GRADIENT = ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.06)'] as const;

function DateLabel() {
  const { i18n } = useTranslation();
  const locale = i18n?.language || undefined;
  const now = new Date();
  const weekday = now.toLocaleDateString(locale, { weekday: 'long' }).toUpperCase();
  const month = now.toLocaleDateString(locale, { month: 'long' }).toUpperCase();
  const day = now.getDate();
  const dayStr = String(day);
  const suffix = getDayWithSuffix(day).slice(dayStr.length);

  return (
    <View style={dateLabelStyles.row}>
      <AppText font="mono" colorVariant="muted" style={dateLabelStyles.text}>
        {`${weekday}, ${month} ${dayStr}`}
      </AppText>
      <AppText font="mono" colorVariant="muted" style={dateLabelStyles.suffix}>
        {suffix}
      </AppText>
    </View>
  );
}

const dateLabelStyles = StyleSheet.create(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
  suffix: {
    fontSize: 7,
    fontWeight: '600',
    letterSpacing: 1,
    fontStyle: 'italic',
    marginTop: 1,
  },
}));

export default function CheckInScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const router = useRouter();
  const posthog = usePostHog();

  useEffect(() => {
    enableAndroidLayoutAnimations();
  }, []);

  const [sheetVisible, setSheetVisible] = useState(false);
  const { todayEntries, isLoading, loadError, saveEntry, refresh } = useTodayCheckIns();
  const { currentStreak, refreshStats } = useStats();
  const hideStreaks = useAppStore((s) => s.preferences.hideStreaks);

  const currentSlot = getCurrentTimeSlot();
  const atLimit = todayEntries.length >= CHECK_IN_CONSTANTS.MAX_DAILY_ENTRIES;
  const prevAtLimit = useRef(false);

  useEffect(() => {
    if (atLimit && !prevAtLimit.current) {
      posthog.capture('daily_limit_reached', { entry_count: todayEntries.length });
    }
    prevAtLimit.current = atLimit;
  }, [atLimit, todayEntries.length, posthog]);

  const handleOpenSheet = useCallback(() => {
    if (atLimit) return;
    hapticLight();
    posthog.capture('check_in_sheet_opened', { time_slot: currentSlot, streak: currentStreak });
    setSheetVisible(true);
  }, [atLimit, currentSlot, currentStreak, posthog]);

  const handleCloseSheet = useCallback(() => setSheetVisible(false), []);

  const handleSave = useCallback(
    async (nodeId: string, note?: string, tags?: string[]) => {
      setSheetVisible(false);
      await saveEntry(nodeId, note, tags);
      refreshStats();
    },
    [saveEntry, refreshStats],
  );

  const handleTilePress = useCallback(
    (tile: MosaicTileData) => {
      router.push(`/check-in/${tile.id}`);
    },
    [router],
  );

  const handleEntryPress = useCallback((id: string) => router.push(`/check-in/${id}`), [router]);

  useEffect(() => {
    return onOpenCheckInSheet(handleOpenSheet);
  }, [handleOpenSheet]);

  const dailyObservation = useMemo(() => generateDailyObservation(todayEntries), [todayEntries]);

  const mosaicTiles = useMemo<MosaicTileData[]>(() => {
    return todayEntries
      .slice()
      .reverse()
      .slice(0, CHECK_IN_CONSTANTS.MAX_DAILY_ENTRIES)
      .flatMap((entry) => {
        const display = getMoodDisplayInfo(entry.primaryMood);
        if (!display) return [];
        return [
          {
            id: entry.id,
            color: display.color,
            label: display.label,
            occurredAt: entry.occurredAt,
          },
        ];
      });
  }, [todayEntries]);

  return (
    <View style={styles.container}>
      {/* Ambient gold gradient — bleeds from top-left, same DNA as the onboarding */}
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.11)', 'rgba(197, 160, 89, 0.04)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 0.52 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Floating top fade + hamburger */}
      <TopFade height={insets.top + 80} />
      <View style={[styles.floatingMenu, { top: insets.top + 8 }]}>
        <DrawerToggleButton tintColor={theme.colors.typography} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 72,
            paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom + 60,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AppText font="heading" colorVariant="primary" style={styles.greeting}>
          {`How are you feeling\n${t(`dashboard.time_of_day.${currentSlot}`)}?`}
        </AppText>

        <View style={styles.dateLabelRow}>
          <View style={styles.dateLeft}>
            <DateLabel />
            <DemoBadge />
          </View>

          {/* Streak — gold diamond pill badge */}
          {!hideStreaks && currentStreak > 0 ? (
            <View style={styles.streakBadge}>
              <View style={[styles.streakDiamond, { backgroundColor: theme.colors.mosaicGold }]} />
              <AppText font="mono" style={[styles.streakLabel, { color: theme.colors.mosaicGold }]}>
                {currentStreak} DAY STREAK
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.mosaicWrapper}>
          {isLoading && todayEntries.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.mosaicGold} />
            </View>
          ) : loadError && todayEntries.length === 0 ? (
            <View style={styles.errorContainer}>
              <AppText colorVariant="muted" style={styles.errorText}>
                Could not load today's check-ins.
              </AppText>
              <PillButton
                label="Try again"
                onPress={refresh}
                size="sm"
                accessibilityLabel="Retry loading check-ins"
              />
            </View>
          ) : (
            <MosaicDisplay
              tiles={mosaicTiles}
              onAddPress={handleOpenSheet}
              onTilePress={handleTilePress}
            />
          )}
        </View>

        {atLimit ? (
          <Surface style={styles.completionBanner}>
            <AppText style={[styles.completionText, { color: theme.colors.mosaicGold }]}>
              {t('completion.all_checkins_complete')}
            </AppText>
          </Surface>
        ) : null}

        {dailyObservation.length > 0 ? (
          <Surface
            variant="card"
            surfaceGradientColors={OBS_GRADIENT}
            style={styles.observationCard}
          >
            {dailyObservation.map((obs) => (
              <View key={obs} style={styles.obsRow}>
                <View style={[styles.obsBullet, { backgroundColor: theme.colors.mosaicGold }]} />
                <AppText variant="md" colorVariant="muted" style={styles.obsText}>
                  {obs}
                </AppText>
              </View>
            ))}
          </Surface>
        ) : null}

        <CheckInHistory entries={todayEntries} onEntryPress={handleEntryPress} />
      </ScrollView>

      <CheckInSheet visible={sheetVisible} onClose={handleCloseSheet} onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
  floatingMenu: {
    position: 'absolute',
    left: theme.spacing[2],
    zIndex: 100,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
  },
  greeting: {
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 46,
    letterSpacing: -0.9,
    marginBottom: theme.spacing[2],
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[6],
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  // Streak pill badge — echoes the onboarding plan card badge
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.28)',
    backgroundColor: 'rgba(197, 160, 89, 0.08)',
  },
  streakDiamond: {
    width: 5,
    height: 5,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
    opacity: 0.85,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  mosaicWrapper: { marginBottom: theme.spacing[6] },
  loadingContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sheet,
  },
  errorContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[4],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sheet,
  },
  errorText: { fontSize: 14, textAlign: 'center' },
  // Observation card — gold glass treatment
  observationCard: {
    marginBottom: theme.spacing[3],
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.14)',
  },
  obsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  // Observation bullet — rotated diamond, echoing the brand motif
  obsBullet: {
    width: 6,
    height: 6,
    borderRadius: 1,
    flexShrink: 0,
    opacity: 0.75,
    transform: [{ rotate: '45deg' }],
  },
  obsText: {
    flex: 1,
  },
  // Completion banner — gold glass border
  completionBanner: {
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
    marginBottom: theme.spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.22)',
    backgroundColor: 'rgba(197, 160, 89, 0.06)',
  },
  completionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
}));
