import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import {
  dateToKey,
  fetchMoodEntriesForDate,
  insertMoodEntry,
  type MoodEntry,
} from '@/src/db/repos/moodRepo';
import { CheckInSheet } from '@/src/features/check-in/components/check-in-sheet';
import {
  MosaicDisplay,
  type MosaicTileData,
} from '@/src/features/check-in/components/mosaic-display';
import { getCurrentTimeSlot } from '@/src/features/check-in/utils/time-of-day';
import { EMOTIONS_CONTENT } from '@/src/features/emotion-accordion/content';
import { EMOTION_PALETTES } from '@/src/features/emotion-accordion/palettes';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { uuid } from '@/src/lib/uuid';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAX_DAILY = 4;
const TAB_BAR_HEIGHT = 90;

function getMoodDisplayInfo(nodeId: string): { label: string; color: string } | null {
  const node = EMOTIONS_CONTENT.nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const palette =
    EMOTION_PALETTES.default[node.groupId as keyof (typeof EMOTION_PALETTES)['default']];
  const color = palette?.[node.colorIndex];
  if (!color) return null;
  return { label: node.label, color };
}

export default function CheckInScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [todayEntries, setTodayEntries] = useState<MoodEntry[]>([]);

  const currentSlot = getCurrentTimeSlot();
  const isDark = theme.colors.background !== '#ffffff';
  const atLimit = todayEntries.length >= MAX_DAILY;

  const loadTodayEntries = useCallback(async () => {
    const entries = await fetchMoodEntriesForDate(dateToKey());
    setTodayEntries(entries);
  }, []);

  useEffect(() => {
    loadTodayEntries();
  }, [loadTodayEntries]);

  const handleOpenSheet = () => {
    if (atLimit) return;
    hapticLight();
    setSheetVisible(true);
  };

  const handleSave = async (nodeId: string, note?: string) => {
    const now = new Date();
    const newEntry: MoodEntry = {
      id: uuid(),
      dateKey: dateToKey(now),
      primaryMood: nodeId,
      note: note ?? null,
      occurredAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Trigger layout animation synchronously before state update
    LayoutAnimation.configureNext({
      duration: 380,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.75,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.75,
      },
    });

    // Optimistic update — entries stored newest-first
    setTodayEntries((prev) => [newEntry, ...prev]);
    setSheetVisible(false);

    // Persist to DB
    try {
      await insertMoodEntry(newEntry);
    } catch (error) {
      console.error('Failed to persist mood entry', error);
      setTodayEntries((prev) => prev.filter((e) => e.id !== newEntry.id));
      // TODO: surface an error toast/snackbar to the user
    }
  };

  // Build mosaic tiles in chronological order (oldest → newest = top-left → bottom-right)
  const mosaicTiles = useMemo<MosaicTileData[]>(() => {
    return todayEntries
      .slice()
      .reverse() // flip DESC → ASC
      .slice(0, MAX_DAILY)
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

  // Date label: "THURSDAY · FEBRUARY 19"
  const dateLabel = new Date()
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase()
    .replace(',', ' ·');

  const mosaicGold = '#E0C097';
  const mutedText = '#8E8E93';
  const surfaceColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const dividerColor = isDark ? '#3A3A3C' : '#D1D1D6';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={[styles.greeting, { color: theme.colors.typography }]}>
          How are you feeling{'\n'}
          {t(`dashboard.time_of_day.${currentSlot}`)}?
        </Text>

        {/* Date */}
        <Text style={[styles.dateLabel, { color: mutedText }]}>{dateLabel}</Text>

        {/* Mosaic — splits as entries are added */}
        <View style={styles.mosaicWrapper}>
          <MosaicDisplay tiles={mosaicTiles} onPress={handleOpenSheet} />
        </View>

        {/* CTA button */}
        <Pressable
          onPress={handleOpenSheet}
          disabled={atLimit}
          style={({ pressed }) => [
            styles.checkInBtn,
            atLimit ? { backgroundColor: surfaceColor } : { backgroundColor: mosaicGold },
            pressed && !atLimit && { opacity: 0.88, transform: [{ scale: 0.97 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel={atLimit ? 'Daily check-ins complete' : 'Check in now'}
        >
          <Text style={[styles.checkInBtnLabel, { color: atLimit ? mutedText : '#050505' }]}>
            {atLimit ? 'All caught up ✓' : '+ Check in'}
          </Text>
        </Pressable>

        {/* Stats row */}
        <View style={[styles.statsRow, { backgroundColor: surfaceColor }]}>
          <View style={styles.statGroup}>
            <Text style={[styles.statNum, { color: theme.colors.typography }]}>
              {todayEntries.length}
            </Text>
            <Text style={[styles.statLbl, { color: mutedText }]}>
              {todayEntries.length === 1 ? 'check-in today' : 'check-ins today'}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: dividerColor }]} />
          <View style={styles.statGroup}>
            <Text style={[styles.statNum, { color: theme.colors.typography }]}>1</Text>
            <Text style={[styles.statLbl, { color: mutedText }]}>day streak</Text>
          </View>
        </View>
      </ScrollView>

      <CheckInSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  greeting: {
    fontSize: 34,
    fontFamily: 'Fraunces',
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 24,
  },
  mosaicWrapper: {
    marginBottom: 24,
  },
  checkInBtn: {
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkInBtnLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 20,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statNum: {
    fontSize: 17,
    fontWeight: '700',
  },
  statLbl: {
    fontSize: 15,
  },
  statDivider: {
    width: 1,
    height: 16,
    borderRadius: 1,
  },
}));
