import Ionicons from '@expo/vector-icons/Ionicons';
import { addDays, differenceInDays, format, isSameDay, parseISO, subDays } from 'date-fns';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { EntryCard } from '@/src/components/entry-card';
import {
  fetchMoodEntriesForDate,
  insertMoodEntry,
  type MoodEntry,
  type NewMoodEntry,
} from '@/src/db/repos/moodRepo';
import { invalidateMonthCache } from '@/src/features/canvas/hooks/useCanvasDbData';
import { CheckInSheet } from '@/src/features/check-in/components/check-in-sheet';
import {
  MosaicDisplay,
  type MosaicTileData,
} from '@/src/features/check-in/components/mosaic-display';
import { getMoodDisplayInfo } from '@/src/features/emotion-accordion/utils/mood-display';
import { uuid } from '@/src/lib/uuid';

const MAX_ENTRIES = 4;
const MAX_BACKDATE_DAYS = 90;

function entryToTile(entry: MoodEntry): MosaicTileData {
  const info = getMoodDisplayInfo(entry.primaryMood);
  return {
    id: entry.id,
    color: info?.color ?? '#888888',
    label: info?.label ?? entry.primaryMood,
    occurredAt: entry.occurredAt,
  };
}

export default function DaySummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { width } = useWindowDimensions();
  const { date } = useLocalSearchParams<{ date: string }>();

  const currentDate = parseISO(date);
  const today = new Date();
  const isToday = isSameDay(currentDate, today);
  const daysDiff = differenceInDays(today, currentDate);
  const isTooOld = daysDiff > MAX_BACKDATE_DAYS;

  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Animation values
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedContentStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchMoodEntriesForDate(date);
      setEntries(result);
    } catch (err) {
      console.error('Failed to load day entries', err);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  // Fires on initial mount and whenever date param changes via setParams
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const updateDateParam = useCallback(
    (newDateStr: string) => {
      router.setParams({ date: newDateStr });
    },
    [router],
  );

  const navigateToDate = useCallback(
    (newDateObj: Date, direction: 'left' | 'right') => {
      const newDateStr = format(newDateObj, 'yyyy-MM-dd');
      const exitOffset = direction === 'left' ? -width : width;
      const enterOffset = direction === 'left' ? width : -width;

      // 1. Animate out
      opacity.value = withTiming(0, { duration: 150 });
      translateX.value = withTiming(exitOffset, { duration: 150 }, () => {
        // 2. Update URL param silently — triggers useEffect to reload data
        runOnJS(updateDateParam)(newDateStr);
        // 3. Reset to opposite side
        translateX.value = enterOffset;
        // 4. Animate back in
        opacity.value = withTiming(1, { duration: 250 });
        translateX.value = withTiming(0, { duration: 250 });
      });
    },
    [width, translateX, opacity, updateDateParam],
  );

  const handlePrevDay = useCallback(() => {
    navigateToDate(subDays(currentDate, 1), 'right');
  }, [currentDate, navigateToDate]);

  const handleNextDay = useCallback(() => {
    if (isToday) return;
    navigateToDate(addDays(currentDate, 1), 'left');
  }, [isToday, currentDate, navigateToDate]);

  const handleSave = useCallback(
    async (nodeId: string, note?: string, tags?: string[]) => {
      const now = new Date();
      const newEntry: NewMoodEntry = {
        id: uuid(),
        dateKey: date,
        primaryMood: nodeId,
        note: note ?? null,
        tags: tags && tags.length > 0 ? JSON.stringify(tags) : null,
        occurredAt: `${date}T12:00:00.000Z`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      await insertMoodEntry(newEntry);
      const [yearStr, monthStr] = date.split('-');
      invalidateMonthCache(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1);
      setSheetVisible(false);
      await loadEntries();
    },
    [date, loadEntries],
  );

  const handleEntryPress = useCallback(
    (id: string) => {
      // biome-ignore lint/suspicious/noExplicitAny: expo-router typed routes
      router.push(`/check-in/${id}` as any);
    },
    [router],
  );

  // Fling gestures for swipe navigation
  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(handleNextDay)();
    });
  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(handlePrevDay)();
    });
  const swipes = Gesture.Exclusive(flingLeft, flingRight);

  const atLimit = entries.length >= MAX_ENTRIES;
  const tiles = entries.map(entryToTile);
  const formattedDate = format(currentDate, 'MMM d');

  return (
    <GestureDetector gesture={swipes}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* ─── Header (pinned, not animated) ─── */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
          {/* Back / Home row — top */}
          <View style={styles.navRow}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.typography} />
              <AppText style={[styles.backLabel, { color: theme.colors.typography }]}>Back</AppText>
            </Pressable>
            <Pressable
              onPress={() => router.navigate('/(tabs)/' as Href)}
              hitSlop={12}
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="home-outline" size={24} color={theme.colors.typography} />
            </Pressable>
          </View>

          {/* Date slider — below nav */}
          <View style={styles.dateSlider}>
            <Pressable
              onPress={handlePrevDay}
              hitSlop={16}
              style={({ pressed }) => pressed && { opacity: 0.6 }}
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.textMuted} />
            </Pressable>

            <AppText font="heading" style={[styles.dateLabel, { color: theme.colors.typography }]}>
              {format(currentDate, 'MMM d, yyyy')}
            </AppText>

            <Pressable
              onPress={handleNextDay}
              hitSlop={16}
              disabled={isToday}
              style={({ pressed }) => pressed && !isToday && { opacity: 0.6 }}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* ─── Animated Content ─── */}
        <Animated.View style={animatedContentStyle}>
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={theme.colors.mosaicGold} />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
              showsVerticalScrollIndicator={false}
            >
              {/* Mosaic */}
              <View style={styles.mosaicWrapper}>
                <MosaicDisplay
                  tiles={tiles}
                  onAddPress={() => setSheetVisible(true)}
                  onTilePress={(tile) => handleEntryPress(tile.id)}
                />
              </View>

              {/* Add button — always visible unless isTooOld, disabled at limit */}
              {!isTooOld && (
                <Pressable
                  onPress={atLimit ? undefined : () => setSheetVisible(true)}
                  disabled={atLimit}
                  style={({ pressed }) => [
                    styles.addButton,
                    atLimit
                      ? styles.addButtonDisabled
                      : {
                          backgroundColor: theme.colors.mosaicGold,
                          opacity: pressed ? 0.75 : 1,
                        },
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={atLimit ? theme.colors.textMuted : '#fff'}
                  />
                  <AppText style={[styles.addButtonText, atLimit && styles.addButtonTextDisabled]}>
                    {atLimit ? 'Daily limit reached' : `Add to ${formattedDate}`}
                  </AppText>
                </Pressable>
              )}

              {/* Entry cards */}
              {entries.length === 0 ? (
                <View style={styles.emptyState}>
                  <AppText font="heading" colorVariant="primary" style={styles.emptyTitle}>
                    No entries yet
                  </AppText>
                  <AppText colorVariant="muted" style={styles.emptySubtitle}>
                    {isTooOld
                      ? 'This day is too far in the past to add entries.'
                      : 'Tap the button above to log how you felt.'}
                  </AppText>
                </View>
              ) : (
                entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onPress={handleEntryPress} />
                ))
              )}
            </ScrollView>
          )}
        </Animated.View>

        <CheckInSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          onSave={handleSave}
          initialData={{ targetDate: date }}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },
  headerContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    gap: theme.spacing[2],
  },
  dateSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[1],
  },
  dateLabel: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
    marginRight: -8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    marginLeft: -8,
  },
  backLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: theme.spacing[2],
  },
  mosaicWrapper: {
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.radius.card,
  },
  addButtonDisabled: {
    backgroundColor: theme.colors.surface,
    opacity: 1,
  },
  addButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: '#fff',
  },
  addButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  emptyState: {
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[6],
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}));
