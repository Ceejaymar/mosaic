import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { addDays, differenceInDays, format, isSameDay, parseISO, subDays } from 'date-fns';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
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
import { DEMO_EPOCH, MAX_BACKDATE_DAYS, PROD_EPOCH } from '@/src/constants/config';
import {
  fetchMoodEntriesForDate,
  insertMoodEntry,
  type MoodEntry,
  type NewMoodEntry,
} from '@/src/db/repos/moodRepo';
import { invalidateMonthCache } from '@/src/features/canvas/hooks/useCanvasDbData';
import { isPastBackdateLimit } from '@/src/features/canvas/utils/date-utils';
import { CheckInSheet } from '@/src/features/check-in/components/check-in-sheet';
import {
  MosaicDisplay,
  type MosaicTileData,
} from '@/src/features/check-in/components/mosaic-display';
import { getMoodDisplayInfo } from '@/src/features/emotion-accordion/utils/mood-display';
import { uuid } from '@/src/lib/uuid';
import { useAppStore } from '@/src/store/useApp';

const MAX_ENTRIES = 4;

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
  const reduceMotion = useAppStore((s) => s.accessibility.reduceMotion);
  const isDemoMode = useAppStore((s) => s.isDemoMode);

  // Validate the param before deriving anything from it
  const parsedDate = date ? parseISO(date) : null;
  const isValidDate = parsedDate !== null && !Number.isNaN(parsedDate.getTime());
  const currentDate = isValidDate ? parsedDate : new Date();

  const today = new Date();
  const isToday = isSameDay(currentDate, today);
  const daysDiff = differenceInDays(today, currentDate);
  const isTooOld = daysDiff > MAX_BACKDATE_DAYS;

  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [canGoPrev, setCanGoPrev] = useState(true);

  // Animation values
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedContentStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  // Guard against stale fetch results when date changes rapidly
  const requestIdRef = useRef(0);

  const loadEntries = useCallback(async () => {
    const myId = ++requestIdRef.current;
    setIsLoading(true);
    try {
      const result = await fetchMoodEntriesForDate(date);
      if (requestIdRef.current !== myId) return;
      setEntries(result);
    } catch (err) {
      if (requestIdRef.current !== myId) return;
      console.error('Failed to load day entries', err);
    } finally {
      if (requestIdRef.current === myId) setIsLoading(false);
    }
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      if (!isValidDate) return;
      loadEntries();
      return () => {
        // Cancel any in-flight query by advancing the request counter
        requestIdRef.current++;
      };
    }, [isValidDate, loadEntries]),
  );

  useEffect(() => {
    if (!isValidDate) return;
    let isMounted = true;

    const checkPrev = async () => {
      const current = parseISO(date);
      const prev = subDays(current, 1);
      const prevStr = format(prev, 'yyyy-MM-dd');
      const epochStr = isDemoMode ? DEMO_EPOCH : PROD_EPOCH;

      if (prevStr < epochStr) {
        if (isMounted) setCanGoPrev(false);
        return;
      }

      if (isPastBackdateLimit(prevStr)) {
        try {
          const prevEntries = await fetchMoodEntriesForDate(prevStr);
          if (isMounted) setCanGoPrev(prevEntries.length > 0);
        } catch (err) {
          console.error('Failed to check previous day entries', err);
          if (isMounted) setCanGoPrev(false);
        }
        return;
      }

      if (isMounted) setCanGoPrev(true);
    };

    checkPrev();
    return () => {
      isMounted = false;
    };
  }, [date, isValidDate, isDemoMode]);

  const updateDateParam = useCallback(
    (newDateStr: string) => {
      router.setParams({ date: newDateStr });
    },
    [router],
  );

  const navigateToDate = useCallback(
    (newDateObj: Date, direction: 'left' | 'right') => {
      const newDateStr = format(newDateObj, 'yyyy-MM-dd');

      if (reduceMotion) {
        updateDateParam(newDateStr);
        return;
      }

      const exitOffset = direction === 'left' ? -width : width;
      const enterOffset = direction === 'left' ? width : -width;

      opacity.value = withTiming(0, { duration: 150 });
      translateX.value = withTiming(exitOffset, { duration: 150 }, () => {
        runOnJS(updateDateParam)(newDateStr);
        translateX.value = enterOffset;
        opacity.value = withTiming(1, { duration: 250 });
        translateX.value = withTiming(0, { duration: 250 });
      });
    },
    [width, translateX, opacity, updateDateParam, reduceMotion],
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
      if (isTooOld) return;
      const now = new Date();
      const targetDate = parseISO(date);
      targetDate.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds(),
      );
      const newEntry: NewMoodEntry = {
        id: uuid(),
        dateKey: date,
        primaryMood: nodeId,
        note: note ?? null,
        tags: tags && tags.length > 0 ? JSON.stringify(tags) : null,
        occurredAt: targetDate.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      await insertMoodEntry(newEntry);
      const [yearStr, monthStr] = date.split('-');
      invalidateMonthCache(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1);
      setSheetVisible(false);
      await loadEntries();
    },
    [date, isTooOld, loadEntries],
  );

  const handleEntryPress = useCallback(
    (id: string) => {
      // biome-ignore lint/suspicious/noExplicitAny: expo-router typed routes
      router.push(`/check-in/${id}` as any);
    },
    [router],
  );

  const handleSwipeEnd = useCallback(
    (translationX: number) => {
      if (translationX < -50) handleNextDay();
      else if (translationX > 50) handlePrevDay();
    },
    [handleNextDay, handlePrevDay],
  );

  // Pan gesture for swipe navigation — thresholds prevent accidental triggers on child taps
  // Reanimated 4: non-worklet functions called from worklet context are auto-dispatched to JS thread
  const swipes = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .failOffsetY([-30, 30])
    .onEnd((e) => {
      runOnJS(handleSwipeEnd)(e.translationX);
    });

  // Invalid date param — show minimal fallback rather than crashing
  if (!isValidDate) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.typography} />
            <AppText colorVariant="primary" style={styles.backLabel}>
              Back
            </AppText>
          </Pressable>
        </View>
        <View style={styles.centered}>
          <AppText colorVariant="muted">Invalid date.</AppText>
        </View>
      </View>
    );
  }

  const atLimit = entries.length >= MAX_ENTRIES;
  // DB returns DESC (newest first). Reverse so oldest→newest maps top-left→bottom-right.
  const tiles = entries.slice().reverse().map(entryToTile);
  const formattedDate = format(currentDate, 'MMM do');

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
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.typography} />
              <AppText colorVariant="primary" style={styles.backLabel}>
                Back
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => router.navigate('/(tabs)/' as Href)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Home"
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
              disabled={!canGoPrev}
              accessibilityRole="button"
              accessibilityLabel="Previous day"
              style={({ pressed }) => [!canGoPrev ? { opacity: 0 } : pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.textMuted} />
            </Pressable>

            <AppText font="heading" style={[styles.dateLabel, { color: theme.colors.typography }]}>
              {format(currentDate, 'EEEE, MMMM do')}
            </AppText>

            <Pressable
              onPress={handleNextDay}
              hitSlop={16}
              disabled={isToday}
              accessibilityRole="button"
              accessibilityLabel="Next day"
              accessibilityState={{ disabled: isToday }}
              style={({ pressed }) => [isToday ? { opacity: 0 } : pressed && { opacity: 0.6 }]}
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
                  disableAdd={isTooOld}
                  onAddPress={() => setSheetVisible(true)}
                  onTilePress={(tile) => handleEntryPress(tile.id)}
                />
              </View>

              {/* Add button — always visible unless isTooOld, disabled at limit */}
              {!isTooOld && (
                <Pressable
                  onPress={atLimit ? undefined : () => setSheetVisible(true)}
                  disabled={atLimit}
                  accessibilityRole="button"
                  accessibilityLabel={
                    atLimit ? 'Daily limit reached' : `Add entry to ${formattedDate}`
                  }
                  accessibilityState={{ disabled: atLimit }}
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
                <View
                  style={[
                    styles.entriesSection,
                    { borderTopColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                  ]}
                >
                  <AppText font="heading" colorVariant="muted" style={styles.entriesHeading}>
                    Check-ins
                  </AppText>
                  {entries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} onPress={handleEntryPress} />
                  ))}
                </View>
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
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    letterSpacing: -0.5,
    flexShrink: 1,
    textAlign: 'center',
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
    paddingTop: theme.spacing[4],
  },
  mosaicWrapper: {
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
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
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  entriesSection: {
    marginTop: theme.spacing[3],
    borderTopWidth: 0.5,
    paddingTop: theme.spacing[4],
  },
  entriesHeading: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
  },
}));
