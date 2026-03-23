import { LinearGradient } from 'expo-linear-gradient';
// import { type Href, router } from 'expo-router'; // restore when Observations section is re-enabled
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
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

import { AppText } from '@/src/components/app-text';
import { DemoBadge } from '@/src/components/demo-badge';
// import { Surface } from '@/src/components/surface'; // restore with Observations section
import { LAYOUT } from '@/src/constants/layout';
import { ContextMatrix } from '@/src/features/insights/components/context-matrix';
import { HeroMosaic } from '@/src/features/insights/components/hero-mosaic';
import { MicroGrid } from '@/src/features/insights/components/micro-grid';
import { RhythmBar } from '@/src/features/insights/components/rhythm-bar';
import { TopFeelings } from '@/src/features/insights/components/top-feelings';
import { useInsightsData } from '@/src/features/insights/hooks/useInsightsData';
import type { InsightEntry, TimeFrame } from '@/src/features/insights/types';
// import { generateObservations } from '@/src/features/insights/utils/observations'; // restore with Observations section
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { useRefreshOnFocus } from '@/src/hooks/useRefreshOnFocus';
import { hapticSelection } from '@/src/lib/haptics/haptics';
import { useAppStore } from '@/src/store/useApp';
import { getDayWithSuffix } from '@/src/utils/format-date';

// ─── Utility: Dynamic Snapper Width ───────────────────────────────────────────

function getSnapperItemWidth(timeFrame: TimeFrame): number {
  switch (timeFrame) {
    case 'week':
      return 210; // Extra space for suffixes (e.g., "Feb 15th - Feb 21st")
    case 'month':
      return 160; // "September 2026"
    case 'year':
      return 100; // "2026"
    default:
      return 180;
  }
}

// ─── Utility: Date Formatter ──────────────────────────────────────────────────

function getFormattedDateRange(
  timeFrame: TimeFrame,
  offset: number,
  firstDayOfWeek: 'sunday' | 'monday',
): string {
  const now = new Date();

  if (timeFrame === 'week') {
    const jsDow = now.getDay();
    const diff = firstDayOfWeek === 'monday' ? (jsDow + 6) % 7 : jsDow;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff + offset * 7);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);

    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = getDayWithSuffix(start.getDate());

    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const endDay = getDayWithSuffix(end.getDate());

    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
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

const TIMEFRAMES: TimeFrame[] = ['week', 'month' /*, 'year'*/];

function TimeFrameDropdown({
  value,
  onChange,
}: {
  value: TimeFrame;
  onChange: (tf: TimeFrame) => void;
}) {
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && <Pressable style={styles.dropdownBackdrop} onPress={() => setIsOpen(false)} />}
      <View style={{ zIndex: 100 }}>
        <Pressable
          onPress={() => setIsOpen(!isOpen)}
          style={({ pressed }) => [styles.dropdownTrigger, pressed && { opacity: 0.5 }]}
        >
          <AppText
            font="mono"
            variant="md"
            style={[styles.dropdownTriggerText, { color: theme.colors.mosaicGold }]}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)} ▾
          </AppText>
        </Pressable>

        {isOpen && (
          <View
            style={[
              styles.dropdownMenu,
              { backgroundColor: theme.colors.surface, borderColor: colors.divider },
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
                <AppText
                  font="mono"
                  style={[
                    styles.dropdownItemText,
                    { color: value === tf ? theme.colors.mosaicGold : theme.colors.typography },
                  ]}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </AppText>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </>
  );
}

// ─── 2. Horizontal Date Snapper ───────────────────────────────────────────────

const DateSnapperItem = memo(function DateSnapperItem({
  offset,
  index,
  timeFrame,
  scrollX,
  itemWidth,
  firstDayOfWeek,
}: {
  offset: number;
  index: number;
  timeFrame: TimeFrame;
  scrollX: SharedValue<number>;
  itemWidth: number;
  firstDayOfWeek: 'sunday' | 'monday';
}) {
  const label = getFormattedDateRange(timeFrame, offset, firstDayOfWeek);

  const animStyle = useAnimatedStyle(() => {
    const centerPosition = index * itemWidth;
    const distance = Math.abs(scrollX.value - centerPosition);
    const scale = interpolate(distance, [0, itemWidth], [1, 0.85], Extrapolation.CLAMP);
    const opacity = interpolate(distance, [0, itemWidth], [1, 0.35], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View style={[styles.snapperItem, animStyle, { width: itemWidth }]}>
      <AppText font="mono" variant="md" colorVariant="primary" style={styles.snapperText}>
        {label}
      </AppText>
    </Animated.View>
  );
});

function DateSnapper({
  timeFrame,
  currentOffset,
  onChange,
  firstDayOfWeek,
}: {
  timeFrame: TimeFrame;
  currentOffset: number;
  onChange: (offset: number) => void;
  firstDayOfWeek: 'sunday' | 'monday';
}) {
  const { width } = useWindowDimensions();
  const itemWidth = getSnapperItemWidth(timeFrame);
  const horizontalPadding = (width - itemWidth) / 2;
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    void timeFrame; // re-run when tab changes to reset scroll
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [timeFrame]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const offsets = useMemo(() => Array.from({ length: 52 }, (_, i) => -i), []);

  const contentStyle = useMemo(
    () => ({ paddingHorizontal: horizontalPadding }),
    [horizontalPadding],
  );

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / itemWidth);

      if (offsets[index] !== undefined && offsets[index] !== currentOffset) {
        hapticSelection();
        onChange(offsets[index]);
      }
    },
    [itemWidth, offsets, currentOffset, onChange],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => (
      <DateSnapperItem
        offset={item}
        index={index}
        timeFrame={timeFrame}
        scrollX={scrollX}
        itemWidth={itemWidth}
        firstDayOfWeek={firstDayOfWeek}
      />
    ),
    [timeFrame, scrollX, itemWidth, firstDayOfWeek],
  );

  return (
    <View style={styles.snapperContainer}>
      <Animated.FlatList
        ref={flatListRef as never}
        inverted
        data={offsets}
        keyExtractor={(item) => item.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        contentContainerStyle={contentStyle}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={renderItem}
      />
    </View>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────

function StatCards({
  entries,
  timeFrame,
  monthlyLongestStreak,
}: {
  entries: InsightEntry[];
  timeFrame: TimeFrame;
  monthlyLongestStreak: number;
}) {
  const { theme } = useUnistyles();
  const daysLogged = useMemo(() => new Set(entries.map((e) => e.date)).size, [entries]);
  const contextualValue = timeFrame === 'month' ? monthlyLongestStreak : daysLogged;
  const contextualLabel = timeFrame === 'month' ? 'Longest streak' : 'Days logged';

  const goldStart = theme.isDark ? 'rgba(192,144,64,0.18)' : 'rgba(206,143,36,0.12)';
  const goldEnd = theme.isDark ? 'rgba(28,28,30,0.6)' : 'rgba(242,242,247,0.8)';
  const borderColor = theme.isDark ? 'rgba(192,144,64,0.2)' : 'rgba(206,143,36,0.15)';

  return (
    <View style={styles.statsRow}>
      <LinearGradient
        colors={[goldStart, goldEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.statCard, { borderColor }]}
      >
        <AppText font="heading" style={styles.statNumber}>
          {entries.length}
        </AppText>
        <AppText style={styles.statLabel}>Total check-ins</AppText>
      </LinearGradient>
      <LinearGradient
        colors={[goldStart, goldEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.statCard, { borderColor }]}
      >
        <AppText font="heading" style={styles.statNumber}>
          {contextualValue}
        </AppText>
        <AppText style={styles.statLabel}>{contextualLabel}</AppText>
      </LinearGradient>
    </View>
  );
}

// ─── Section Divider ──────────────────────────────────────────────────────────

function SectionDivider() {
  return <View style={styles.sectionDivider} />;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');
  const [offset, setOffset] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const firstDayOfWeek = useAppStore((s) => s.preferences.firstDayOfWeek);

  useRefreshOnFocus(useCallback(() => setRefreshKey((k) => k + 1), []));

  const handleTimeFrameChange = useCallback((tf: TimeFrame) => {
    setTimeFrame(tf);
    setOffset(0);
  }, []);

  const { entries, monthlyLongestStreak } = useInsightsData(timeFrame, offset, refreshKey);
  // const observations = useMemo(() => generateObservations(entries), [entries]); // restore with Observations section
  const hasEnoughData = entries.length >= 3;

  const ambientColors = theme.isDark
    ? (['rgba(192,144,64,0.09)', 'transparent'] as const)
    : (['rgba(206,143,36,0.06)', 'transparent'] as const);

  const headerFadeColors = theme.isDark
    ? ([theme.colors.background, 'rgba(0,0,0,0)'] as const)
    : ([theme.colors.background, 'rgba(255,255,255,0)'] as const);

  return (
    <View style={styles.container}>
      {/* AMBIENT WARM GLOW — sits behind everything */}
      <LinearGradient colors={ambientColors} style={styles.ambientGlow} pointerEvents="none" />

      {/* THE UNIFIED HEADER */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText font="heading" variant="2xl" colorVariant="primary" style={styles.pageTitle}>
              Insights
            </AppText>
            <DemoBadge />
          </View>
          <TimeFrameDropdown value={timeFrame} onChange={handleTimeFrameChange} />
        </View>

        <DateSnapper
          timeFrame={timeFrame}
          currentOffset={offset}
          onChange={setOffset}
          firstDayOfWeek={firstDayOfWeek}
        />

        {/* HEADER BOTTOM FADE */}
        <View style={styles.shortFadeContainer} pointerEvents="none">
          <LinearGradient colors={headerFadeColors} style={StyleSheet.absoluteFill} />
        </View>
      </View>

      {/* SCROLLING CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 130,
            paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom + 40,
          },
        ]}
      >
        {hasEnoughData ? (
          <>
            <HeroMosaic entries={entries} />
            <StatCards
              entries={entries}
              timeFrame={timeFrame}
              monthlyLongestStreak={monthlyLongestStreak}
            />
            <SectionDivider />
            <TopFeelings entries={entries} timeFrame={timeFrame} />
            <SectionDivider />
            <RhythmBar entries={entries} />
            {timeFrame === 'week' && <MicroGrid entries={entries} offset={offset} />}
            <SectionDivider />
            <ContextMatrix entries={entries} category="people" title="Who you were with" />
            <ContextMatrix entries={entries} category="activities" title="What you were doing" />
            <ContextMatrix entries={entries} category="places" title="Where you were" />

            {/* Observations — temporarily hidden, keep for future use
            {observations.length > 0 && (
              <View style={styles.section}>
                <AppText
                  font="heading"
                  variant="xl"
                  colorVariant="primary"
                  style={styles.sectionTitle}
                >
                  Observations
                </AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselContent}
                >
                  {observations.map((obs) => (
                    <Pressable
                      key={obs.id}
                      onPress={() => router.push(`/insights/observation/${obs.id}` as Href)}
                      style={({ pressed }) => pressed && { opacity: 0.8 }}
                    >
                      <Surface variant="card" style={styles.observationCard}>
                        <View
                          style={[
                            styles.colorAccent,
                            { backgroundColor: obs.highlightColor ?? theme.colors.mosaicGold },
                          ]}
                        />
                        <AppText
                          font="heading"
                          colorVariant="primary"
                          style={styles.observationText}
                        >
                          {obs.text}
                        </AppText>
                      </Surface>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
            */}
          </>
        ) : (
          <View style={styles.emptyState}>
            <AppText font="heading" colorVariant="primary" style={styles.emptyTitle}>
              Not enough data yet
            </AppText>
            <AppText colorVariant="muted" style={styles.emptyText}>
              Log at least 3 check-ins this {timeFrame} to unlock your emotional patterns.
            </AppText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Warm ambient glow radiating from the top — subtle gold warmth
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    zIndex: 0,
  },

  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: theme.colors.background,
  },
  shortFadeContainer: {
    position: 'absolute',
    bottom: -15,
    left: 0,
    right: 0,
    height: 15,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[1],
    zIndex: 10,
  },
  pageTitle: { fontWeight: '700' },
  dropdownTrigger: { paddingVertical: theme.spacing[2], paddingLeft: theme.spacing[4] },
  dropdownTriggerText: { fontWeight: '600' },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    padding: theme.spacing[1],
    minWidth: 120,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: theme.spacing[4], borderRadius: 8 },
  dropdownItemText: { fontSize: 14, fontWeight: '600' },
  snapperContainer: { height: 44, justifyContent: 'center', marginBottom: 0 },
  snapperItem: { alignItems: 'center', justifyContent: 'center' },
  snapperText: { fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  section: { marginTop: theme.spacing[4], marginBottom: theme.spacing[6] },
  sectionTitle: {
    fontWeight: '700',
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  carouselContent: { paddingHorizontal: theme.spacing[6], gap: theme.spacing[3] },
  observationCard: { width: 240, padding: theme.spacing[4] },
  colorAccent: { width: 12, height: 12, borderRadius: 6, marginBottom: theme.spacing[3] },
  observationText: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  emptyState: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[16],
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: theme.spacing[2] },
  emptyText: { fontSize: theme.fontSize.md, textAlign: 'center', lineHeight: 22 },

  // Stat cards with gradient glass surface + hairline gold border
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[6],
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  statCard: {
    flex: 1,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statNumber: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
    color: theme.colors.typography,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing[1],
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: 'SpaceMono',
  },

  // Full-screen backdrop to dismiss the dropdown
  dropdownBackdrop: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    right: -9999,
    bottom: -9999,
    zIndex: 99,
  },

  // Thin gold gossamer thread between content sections
  sectionDivider: {
    height: 1,
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[8],
    backgroundColor: theme.isDark ? 'rgba(192,144,64,0.14)' : 'rgba(206,143,36,0.12)',
  },
}));
