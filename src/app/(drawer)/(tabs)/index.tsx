import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

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

  useEffect(() => {
    enableAndroidLayoutAnimations();
  }, []);

  const [sheetVisible, setSheetVisible] = useState(false);
  const { todayEntries, saveEntry } = useTodayCheckIns();

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
      await saveEntry(nodeId, note);
      setSheetVisible(false);
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
          <MosaicDisplay tiles={mosaicTiles} onPress={handleOpenSheet} />
        </View>

        <Pressable
          onPress={handleOpenSheet}
          disabled={atLimit}
          style={({ pressed }) => [
            styles.checkInBtn(atLimit),
            pressed && !atLimit && { opacity: 0.88, transform: [{ scale: 0.97 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel={atLimit ? 'Daily check-ins complete' : 'Check in now'}
        >
          <Text style={styles.checkInBtnLabel(atLimit)}>
            {atLimit ? 'Daily check-ins complete ✓' : '+ Check in'}
          </Text>
        </Pressable>

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
  checkInBtn: (atLimit: boolean) => ({
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: atLimit ? theme.colors.surface : theme.colors.mosaicGold,
  }),
  checkInBtnLabel: (atLimit: boolean) => ({
    fontSize: 17,
    fontWeight: '600',
    color: atLimit ? theme.colors.textMuted : theme.colors.onAccent,
  }),
}));
