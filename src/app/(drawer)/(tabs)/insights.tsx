import { type Href, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { LAYOUT } from '@/src/constants/layout';
import { ContextMatrix } from '@/src/features/insights/components/context-matrix';
import { EmotionalFootprint } from '@/src/features/insights/components/emotional-footprint';
import { MicroGrid } from '@/src/features/insights/components/micro-grid';
import { RhythmBar } from '@/src/features/insights/components/rhythm-bar';
import { useInsightsData } from '@/src/features/insights/hooks/useInsightsMockData';
import type { TimeFrame } from '@/src/features/insights/types';
import { generateObservations } from '@/src/features/insights/utils/observations';
import { hapticSelection } from '@/src/lib/haptics/haptics';

// ─── Utility: Date Formatter ──────────────────────────────────────────────────

function getFormattedDateRange(timeFrame: TimeFrame, offset: number): string {
  const now = new Date();

  if (timeFrame === 'week') {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() + offset * 7,
    );
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`;
  }

  if (timeFrame === 'month') {
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return target.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  if (timeFrame === 'year') {
    return (now.getFullYear() + offset).toString();
  }

  return '';
}

// ─── 1. Minimal Dropdown (Top Right) ──────────────────────────────────────────

const TIMEFRAMES: TimeFrame[] = ['week', 'month', 'year'];

function TimeFrameDropdown({
  value,
  onChange,
}: {
  value: TimeFrame;
  onChange: (tf: TimeFrame) => void;
}) {
  const { theme } = useUnistyles();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={{ zIndex: 100 }}>
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={({ pressed }) => [styles.dropdownTrigger, pressed && { opacity: 0.5 }]}
      >
        <Text style={[styles.dropdownTriggerText, { color: theme.colors.mosaicGold }]}>
          {value.charAt(0).toUpperCase() + value.slice(1)} ▾
        </Text>
      </Pressable>

      {isOpen && (
        <View
          style={[
            styles.dropdownMenu,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.divider },
          ]}
        >
          {TIMEFRAMES.map((tf) => (
            <Pressable
              key={tf}
              onPress={() => {
                hapticSelection();
                onChange(tf);
                setIsOpen(false);
              }}
              style={styles.dropdownItem}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  { color: value === tf ? theme.colors.mosaicGold : theme.colors.typography },
                ]}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── 2. Horizontal Date Snapper ───────────────────────────────────────────────

const ITEM_WIDTH = 180;

function DateSnapperItem({
  offset,
  index,
  timeFrame,
  scrollX,
}: {
  offset: number;
  index: number;
  timeFrame: TimeFrame;
  scrollX: SharedValue<number>;
}) {
  const { theme } = useUnistyles();
  const label = getFormattedDateRange(timeFrame, offset);

  const animStyle = useAnimatedStyle(() => {
    const centerPosition = index * ITEM_WIDTH;
    const distance = Math.abs(scrollX.value - centerPosition);
    const scale = interpolate(distance, [0, ITEM_WIDTH], [1, 0.85], Extrapolation.CLAMP);
    const opacity = interpolate(distance, [0, ITEM_WIDTH], [1, 0.35], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View style={[styles.snapperItem, animStyle]}>
      <Text style={[styles.snapperText, { color: theme.colors.typography }]}>{label}</Text>
    </Animated.View>
  );
}

function DateSnapper({
  timeFrame,
  currentOffset,
  onChange,
}: {
  timeFrame: TimeFrame;
  currentOffset: number;
  onChange: (offset: number) => void;
}) {
  const { width } = useWindowDimensions();
  const horizontalPadding = (width - ITEM_WIDTH) / 2;
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  // Generate an array of the past 52 offsets (e.g. 52 weeks back, 52 months back)
  // Index 0 = offset 0 (Current). Index 51 = offset -51.
  const offsets = useMemo(() => Array.from({ length: 52 }, (_, i) => -i), []);

  // Reset scroll position instantly when the timeframe changes (e.g. Week -> Month)
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally syncing scroll when timeFrame prop changes
  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [timeFrame]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / ITEM_WIDTH);
    if (offsets[index] !== undefined && offsets[index] !== currentOffset) {
      hapticSelection();
      onChange(offsets[index]);
    }
  };

  return (
    <View style={styles.snapperContainer}>
      <Animated.FlatList
        ref={flatListRef as never} // Reanimated cast
        inverted
        data={offsets}
        keyExtractor={(item) => item.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item, index }) => (
          <DateSnapperItem offset={item} index={index} timeFrame={timeFrame} scrollX={scrollX} />
        )}
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');
  const [offset, setOffset] = useState(0);

  const handleTimeFrameChange = useCallback((tf: TimeFrame) => {
    setTimeFrame(tf);
    setOffset(0);
  }, []);

  const entries = useInsightsData(timeFrame, offset);
  const observations = useMemo(() => generateObservations(entries), [entries]);
  const hasEnoughData = entries.length >= 3;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom,
        },
      ]}
    >
      {/* Top Bar with Minimal Dropdown */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Insights</Text>
        <TimeFrameDropdown value={timeFrame} onChange={handleTimeFrameChange} />
      </View>

      {/* The Horizontal Date Snapper */}
      <DateSnapper timeFrame={timeFrame} currentOffset={offset} onChange={setOffset} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {hasEnoughData ? (
          <>
            {observations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Observations</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselContent}
                >
                  {observations.map((obs) => (
                    <Pressable
                      key={obs.id}
                      onPress={() => router.push(`/insights/observation/${obs.id}` as Href)}
                      style={({ pressed }) => [
                        styles.observationCard,
                        {
                          backgroundColor: theme.colors.tileBackground,
                          shadowColor: theme.colors.tileShadowColor,
                        },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <View
                        style={[
                          styles.colorAccent,
                          { backgroundColor: obs.highlightColor ?? theme.colors.mosaicGold },
                        ]}
                      />
                      <Text style={[styles.observationText, { color: theme.colors.typography }]}>
                        {obs.text}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <EmotionalFootprint entries={entries} />
            <RhythmBar entries={entries} />
            <ContextMatrix entries={entries} category="people" title="Who you were with" />
            <ContextMatrix entries={entries} category="activities" title="What you were doing" />
            <ContextMatrix entries={entries} category="places" title="Where you were" />

            {timeFrame === 'week' && <MicroGrid entries={entries} />}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.colors.typography }]}>
              Not enough data yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Log at least 3 check-ins this {timeFrame} to unlock your emotional patterns.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
    zIndex: 10, // Ensures dropdown overlaps scroll content
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Fraunces',
    fontWeight: '700',
    color: theme.colors.typography,
    letterSpacing: -0.4,
  },
  dropdownTrigger: { paddingVertical: 8, paddingLeft: 16 },
  dropdownTriggerText: { fontSize: 15, fontWeight: '600', fontFamily: 'SpaceMono' },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    minWidth: 120,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  dropdownItemText: { fontSize: 14, fontWeight: '600', fontFamily: 'SpaceMono' },
  snapperContainer: { height: 44, justifyContent: 'center', marginBottom: 12 },
  snapperItem: { width: ITEM_WIDTH, alignItems: 'center', justifyContent: 'center' },
  snapperText: { fontSize: 15, fontWeight: '700', fontFamily: 'SpaceMono' },
  scrollContent: { paddingBottom: 40 },
  section: { marginTop: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    paddingHorizontal: 24,
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  carouselContent: { paddingHorizontal: 24, gap: 12 },
  observationCard: {
    width: 240,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  colorAccent: { width: 12, height: 12, borderRadius: 6, marginBottom: 12 },
  observationText: { fontSize: 16, lineHeight: 22, fontFamily: 'Fraunces', fontWeight: '500' },
  emptyState: { paddingHorizontal: 24, paddingVertical: 64, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontFamily: 'Fraunces', fontWeight: '600', marginBottom: 8 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
}));
