import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { PillButton } from '@/src/components/pill-button';
import { LAYOUT } from '@/src/constants/layout';
import { CheckInSheet } from '@/src/features/check-in/components/check-in-sheet';
import { DailyStatsRow } from '@/src/features/check-in/components/daily-stats';
import {
  MosaicDisplay,
  type MosaicTileData,
} from '@/src/features/check-in/components/mosaic-display';
import { CHECK_IN_CONSTANTS } from '@/src/features/check-in/constants/check-in';
import { useTodayCheckIns } from '@/src/features/check-in/hooks/useCheckIns';
import { getMoodDisplayInfo } from '@/src/features/check-in/utils/mood-helpers';
import { getCurrentTimeSlot } from '@/src/features/check-in/utils/time-of-day';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { enableAndroidLayoutAnimations } from '@/src/utils/animations';
import { getFormattedDateLabel } from '@/src/utils/format-date';

export default function CheckInScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  useEffect(() => {
    enableAndroidLayoutAnimations();
  }, []);

  const [sheetVisible, setSheetVisible] = useState(false);
  const { todayEntries, isLoading, loadError, saveEntry, refresh } = useTodayCheckIns();

  const currentSlot = getCurrentTimeSlot();
  const atLimit = todayEntries.length >= CHECK_IN_CONSTANTS.MAX_DAILY_ENTRIES;

  const handleCloseSheet = useCallback(() => setSheetVisible(false), []);

  const handleOpenSheet = useCallback(() => {
    if (atLimit) return;
    hapticLight();
    setSheetVisible(true);
  }, [atLimit]);

  const handleSave = useCallback(
    async (nodeId: string, note?: string) => {
      setSheetVisible(false);
      await saveEntry(nodeId, note);
    },
    [saveEntry],
  );

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
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom + 20,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>
          How are you feeling{'\n'}
          {t(`dashboard.time_of_day.${currentSlot}`)}?
        </Text>

        <Text style={styles.dateLabel}>{getFormattedDateLabel()}</Text>

        <View style={styles.mosaicWrapper}>
          {isLoading && todayEntries.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.mosaicGold} />
            </View>
          ) : loadError && todayEntries.length === 0 ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Could not load today's check-ins.</Text>
              <PillButton
                label="Try again"
                onPress={refresh}
                size="sm"
                accessibilityLabel="Retry loading check-ins"
              />
            </View>
          ) : (
            <MosaicDisplay tiles={mosaicTiles} onPress={handleOpenSheet} />
          )}
        </View>

        <PillButton
          label={atLimit ? 'Daily check-ins complete ✓' : '+ Check in'}
          onPress={handleOpenSheet}
          disabled={atLimit}
          elevated={!atLimit}
          accessibilityLabel={atLimit ? 'Daily check-ins complete' : 'Check in now'}
          style={styles.checkInBtn}
        />

        {/* TODO: compute real streak from cross-day DB query */}
        <DailyStatsRow entriesCount={todayEntries.length} streakCount={1} />
      </ScrollView>

      <CheckInSheet visible={sheetVisible} onClose={handleCloseSheet} onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
  greeting: {
    fontSize: 34,
    fontFamily: 'Fraunces',
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: -0.5,
    marginBottom: 8,
    color: theme.colors.typography,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 24,
    fontStyle: 'italic',
    color: theme.colors.textMuted,
  },
  mosaicWrapper: { marginBottom: 24 },
  loadingContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
  },
  errorContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
  },
  errorText: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center' },
  checkInBtn: { marginBottom: 20 },
}));
