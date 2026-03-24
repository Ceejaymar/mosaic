import { DrawerToggleButton } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Button, ScrollView, Text, View } from 'react-native';
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
import { getOfferings, purchasePackage } from '@/src/services/purchases';
import { useAppStore } from '@/src/store/useApp';
import { LETTER_SPACING } from '@/src/styles/design-tokens';
import { enableAndroidLayoutAnimations } from '@/src/utils/animations';
import { getDayWithSuffix } from '@/src/utils/format-date';

const OBS_GRADIENT = ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.06)'] as const;

function RawPurchaseTest() {
  const [loading, setLoading] = useState(false);

  const handleRawPurchase = async () => {
    setLoading(true);
    try {
      const offerings = await getOfferings();
      const packageToBuy = offerings.current?.availablePackages[0];

      if (!packageToBuy) {
        Alert.alert('Missing Data', 'No packages found! Check the RevenueCat dashboard.');
        setLoading(false);
        return;
      }

      const customerInfo = await purchasePackage(packageToBuy);

      if (typeof customerInfo.entitlements.active['Mosaic Pro'] !== 'undefined') {
        Alert.alert('Success!', 'The Mosaic Pro entitlement was successfully unlocked.');
      }
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        Alert.alert('Purchase Error', err.message ?? 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{ marginTop: 50, padding: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10 }}
    >
      <Text style={{ color: 'white', textAlign: 'center', marginBottom: 10 }}>
        Testing Core SDK
      </Text>
      <Button
        title={loading ? 'Processing...' : 'Buy Monthly Sub (Raw Test)'}
        onPress={handleRawPurchase}
        disabled={loading}
      />
    </View>
  );
}

function DateLabel() {
  const { i18n } = useTranslation();
  const locale = i18n?.language || undefined;
  const now = new Date();
  const weekday = now.toLocaleDateString(locale, { weekday: 'long' }).toUpperCase();
  const month = now.toLocaleDateString(locale, { month: 'long' }).toUpperCase();
  const day = now.getDate();
  const dayStr = String(day);
  const suffix = getDayWithSuffix(day).slice(dayStr.length); // just "ST", "ND", "RD", "TH"

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
      {/* 1. THE TOP FADE — full-width seamless gradient covering the hamburger area */}
      <TopFade height={insets.top + 80} />

      {/* 2. THE FLOATING HAMBURGER MENU */}
      <View style={[styles.floatingMenu, { top: insets.top + 8 }]}>
        <DrawerToggleButton tintColor={theme.colors.typography} />
      </View>

      {/* 3. SCROLL CONTENT */}
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
        <RawPurchaseTest />
        <AppText font="heading" colorVariant="primary" style={styles.greeting}>
          {`How are you feeling\n${t(`dashboard.time_of_day.${currentSlot}`)}?`}
        </AppText>

        <View style={styles.dateLabelRow}>
          <View style={styles.dateLeft}>
            <DateLabel />
            <DemoBadge />
          </View>
          {!hideStreaks && currentStreak > 0 && (
            <AppText font="mono" style={[styles.streakLabel, { color: theme.colors.mosaicGold }]}>
              {currentStreak} DAY STREAK
            </AppText>
          )}
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

        {atLimit && (
          <Surface style={styles.completionBanner}>
            <AppText style={[styles.completionText, { color: theme.colors.mosaicGold }]}>
              {t('completion.all_checkins_complete')}
            </AppText>
          </Surface>
        )}

        {dailyObservation.length > 0 && (
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
        )}
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
    fontSize: theme.fontSize.display,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: LETTER_SPACING.tight,
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
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
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
  observationCard: {
    marginBottom: theme.spacing[3],
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  obsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  obsBullet: {
    width: 7,
    height: 7,
    borderRadius: 2,
    flexShrink: 0,
    opacity: 0.8,
  },
  completionBanner: {
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  completionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  obsText: {
    flex: 1,
  },
}));
