import { useHeaderHeight } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  AppState,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { LAYOUT } from '@/src/constants/layout';
import { MonthGrid } from '@/src/features/canvas/components/month-grid';
import { YearView } from '@/src/features/canvas/components/year-view';
import { prefetchMonth } from '@/src/features/canvas/hooks/useCanvasDbData';
import { useCanvasSource } from '@/src/features/canvas/hooks/useCanvasSource';
import { getMonthName } from '@/src/features/canvas/utils/date-labels';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPBAR_H_PAD = 24;
const GRID_H_PAD = 8;
const TILE_GAP = 4;
const MONTHS_BACK = 36;
/** Peek strip height — how much of the adjacent month shows at top/bottom */
const PEEK_HEIGHT = 80;
/** Gradient height used on side slots (no peek content, just a fade cue) */
const EDGE_FADE_HEIGHT = 48;

/** Stable noop for peek grids — never interactive */
const NOOP_DAY_PRESS = (_date: string) => {};

type ViewMode = 'month' | 'year';

// ─── Month list ────────────────────────────────────────────────────────────────

type MonthItem = { month: number; year: number };

function buildMonthList(count: number): MonthItem[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return { month: d.getMonth(), year: d.getFullYear() };
  });
}

// ─── MonthPage — side slots (prev / next) ────────────────────────────────────
//
// No peek content here intentionally. During a scroll transition both the side
// slot and the center slot are simultaneously visible; if the side slot also
// rendered peek strips, the user would see two overlapping grids for the same
// month. Instead, side slots show only a subtle gradient fade at their edges.

type MonthPageProps = {
  monthItem: MonthItem;
  pageHeight: number;
  tileSize: number;
  hideEmpty: boolean;
  demoMode: boolean;
  onDayPress: (date: string) => void;
};

const MonthPage = memo(function MonthPage({
  monthItem,
  pageHeight,
  tileSize,
  hideEmpty,
  demoMode,
  onDayPress,
}: MonthPageProps) {
  const { month, year } = monthItem;
  const { i18n } = useTranslation();
  const { theme } = useUnistyles();
  const bg = theme.colors.background;
  const { data, loading } = useCanvasSource(month, year, demoMode);

  // Animate the grid opacity: skeleton (0.25) while fetching, full (1) when ready.
  // Driven by `loading` state so it fires reliably on a clean React state transition
  // rather than on mount timing — no flash, no stale frame.
  const gridOpacity = useSharedValue(loading ? 0.25 : 1);
  const gridAnimStyle = useAnimatedStyle(() => ({ opacity: gridOpacity.value }));

  useEffect(() => {
    gridOpacity.value = withTiming(loading ? 0.25 : 1, { duration: 260 });
  }, [loading, gridOpacity]);

  return (
    <View style={{ height: pageHeight }}>
      <View style={{ flex: 1, paddingHorizontal: GRID_H_PAD, justifyContent: 'center', gap: 8 }}>
        <Text style={styles.monthPageLabel}>
          {getMonthName(month, 'long', i18n.language)} {year}
        </Text>
        <Animated.View style={gridAnimStyle}>
          <MonthGrid
            month={month}
            year={year}
            data={data}
            tileSize={tileSize}
            tileGap={TILE_GAP}
            hideEmpty={hideEmpty}
            onDayPress={onDayPress}
          />
        </Animated.View>
      </View>

      {/* Gradient cues that more months exist above/below */}
      <LinearGradient
        colors={[bg, `${bg}00`]}
        style={[styles.edgeFade, { top: 0 }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[`${bg}00`, bg]}
        style={[styles.edgeFade, { bottom: 0 }]}
        pointerEvents="none"
      />
    </View>
  );
});

// ─── CenterMonthPage — center slot (with peek strips) ────────────────────────
//
// The center slot is always at rest from the user's perspective. It renders
// faded peek strips showing the bottom rows of the previous month (top) and
// the top rows of the next month (bottom), with gradient overlays blending them
// into the background.

type CenterMonthPageProps = {
  monthItem: MonthItem;
  prevItem: MonthItem | null;
  nextItem: MonthItem | null;
  pageHeight: number;
  tileSize: number;
  hideEmpty: boolean;
  demoMode: boolean;
  onDayPress: (date: string) => void;
};

const CenterMonthPage = memo(function CenterMonthPage({
  monthItem,
  prevItem,
  nextItem,
  pageHeight,
  tileSize,
  hideEmpty,
  demoMode,
  onDayPress,
}: CenterMonthPageProps) {
  const { month, year } = monthItem;
  const { i18n } = useTranslation();
  const { theme } = useUnistyles();
  const bg = theme.colors.background;

  const { data, loading } = useCanvasSource(month, year, demoMode);
  // Hooks must always be called. When no adjacent item exists (boundary month),
  // fall back to the center item so deps remain stable and no data is wasted.
  const { data: prevData, loading: prevLoading } = useCanvasSource(
    (prevItem ?? monthItem).month,
    (prevItem ?? monthItem).year,
    demoMode,
  );
  const { data: nextData, loading: nextLoading } = useCanvasSource(
    (nextItem ?? monthItem).month,
    (nextItem ?? monthItem).year,
    demoMode,
  );

  const anyLoading = loading || prevLoading || nextLoading;
  const gridOpacity = useSharedValue(anyLoading ? 0.25 : 1);
  const gridAnimStyle = useAnimatedStyle(() => ({ opacity: gridOpacity.value }));

  useEffect(() => {
    gridOpacity.value = withTiming(anyLoading ? 0.25 : 1, { duration: 260 });
  }, [anyLoading, gridOpacity]);

  return (
    <View style={{ height: pageHeight }}>
      {/* ── Top peek: bottom rows of previous month ── */}
      {prevItem ? (
        <View style={{ height: PEEK_HEIGHT, overflow: 'hidden' }} pointerEvents="none">
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: GRID_H_PAD,
              right: GRID_H_PAD,
              opacity: 0.45,
            }}
          >
            <MonthGrid
              month={prevItem.month}
              year={prevItem.year}
              data={prevData}
              tileSize={tileSize}
              tileGap={TILE_GAP}
              hideEmpty={false}
              showDowHeader={false}
              onDayPress={NOOP_DAY_PRESS}
            />
          </View>
          <LinearGradient
            colors={[bg, `${bg}00`]}
            style={styles.absoluteFill}
            pointerEvents="none"
          />
        </View>
      ) : (
        <View style={{ height: PEEK_HEIGHT }} pointerEvents="none" />
      )}

      {/* ── Center: month label + interactive grid ── */}
      <View style={{ flex: 1, paddingHorizontal: GRID_H_PAD, justifyContent: 'center', gap: 8 }}>
        <Text style={styles.monthPageLabel}>
          {getMonthName(month, 'long', i18n.language)} {year}
        </Text>
        <Animated.View style={gridAnimStyle}>
          <MonthGrid
            month={month}
            year={year}
            data={data}
            tileSize={tileSize}
            tileGap={TILE_GAP}
            hideEmpty={hideEmpty}
            onDayPress={onDayPress}
          />
        </Animated.View>
      </View>

      {/* ── Bottom peek: top rows of next month ── */}
      {nextItem ? (
        <View style={{ height: PEEK_HEIGHT, overflow: 'hidden' }} pointerEvents="none">
          <View style={{ paddingHorizontal: GRID_H_PAD, opacity: 0.45 }}>
            <MonthGrid
              month={nextItem.month}
              year={nextItem.year}
              data={nextData}
              tileSize={tileSize}
              tileGap={TILE_GAP}
              hideEmpty={false}
              showDowHeader={false}
              onDayPress={NOOP_DAY_PRESS}
            />
          </View>
          <LinearGradient
            colors={[`${bg}00`, bg]}
            style={styles.absoluteFill}
            pointerEvents="none"
          />
        </View>
      ) : (
        <View style={{ height: PEEK_HEIGHT }} pointerEvents="none" />
      )}
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CanvasScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isYearMounted, setIsYearMounted] = useState(false);

  // ── Month list + pager index ──
  const [monthList, setMonthList] = useState(() => buildMonthList(MONTHS_BACK));
  const [centerMonthIndex, setCenterMonthIndex] = useState(monthList.length - 1);

  // Refs let the AppState callback read the latest values without re-registering the listener
  const monthListRef = useRef(monthList);
  monthListRef.current = monthList;
  const centerMonthIndexRef = useRef(centerMonthIndex);
  centerMonthIndexRef.current = centerMonthIndex;

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      const newList = buildMonthList(MONTHS_BACK);
      const currentItem = monthListRef.current[centerMonthIndexRef.current];
      const newIdx = newList.findIndex(
        (item) => item.month === currentItem.month && item.year === currentItem.year,
      );
      setMonthList(newList);
      setCenterMonthIndex(newIdx >= 0 ? newIdx : newList.length - 1);
    });
    return () => sub.remove();
  }, []);

  // ── 3-slot recycling pager ──
  const monthScrollRef = useRef<ScrollView>(null);

  // Slot data — clamp to list bounds so boundary slots always have valid data
  const prevMonthItem = monthList[Math.max(0, centerMonthIndex - 1)];
  const centerMonthItem = monthList[centerMonthIndex];
  const nextMonthItem = monthList[Math.min(monthList.length - 1, centerMonthIndex + 1)];

  // Peek items: null at list boundaries so CenterMonthPage suppresses that strip
  const centerPrevItem = centerMonthIndex > 0 ? prevMonthItem : null;
  const centerNextItem = centerMonthIndex < monthList.length - 1 ? nextMonthItem : null;

  // Warm the cache for months ±2 around the current center so adjacent slots
  // are likely already loaded by the time the user scrolls to them.
  useEffect(() => {
    if (demoMode) return;
    for (const offset of [-2, -1, 1, 2]) {
      const idx = Math.max(0, Math.min(monthList.length - 1, centerMonthIndex + offset));
      const { month, year } = monthList[idx];
      prefetchMonth(year, month);
    }
  }, [centerMonthIndex, demoMode, monthList]);

  useEffect(() => {
    if (containerHeight > 0) {
      monthScrollRef.current?.scrollTo({ y: containerHeight, animated: false });
    }
  }, [containerHeight]);

  const handleMonthScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const page = Math.round(event.nativeEvent.contentOffset.y / containerHeight);
      if (page === 0) {
        if (centerMonthIndex > 0) setCenterMonthIndex((i) => i - 1);
        monthScrollRef.current?.scrollTo({ y: containerHeight, animated: false });
      } else if (page === 2) {
        if (centerMonthIndex < monthList.length - 1) setCenterMonthIndex((i) => i + 1);
        monthScrollRef.current?.scrollTo({ y: containerHeight, animated: false });
      }
    },
    [centerMonthIndex, containerHeight, monthList.length],
  );

  const gridContentWidth = screenWidth - GRID_H_PAD * 2;
  const tileSize = (gridContentWidth - 6 * TILE_GAP) / 7;
  const yearContentWidth = screenWidth - GRID_H_PAD * 2;
  const headerLabel = viewMode === 'year' ? t('canvas.overview') : '';

  const onDayPress = useCallback((date: string) => {
    Alert.alert('Day selected', date);
  }, []);

  const monthOpacity = useSharedValue(1);
  const yearOpacity = useSharedValue(0);
  const monthAnimStyle = useAnimatedStyle(() => ({ opacity: monthOpacity.value }));
  const yearAnimStyle = useAnimatedStyle(() => ({ opacity: yearOpacity.value }));

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      if (prev === 'month') {
        monthOpacity.value = withTiming(0, { duration: 180 });
        yearOpacity.value = withTiming(1, { duration: 180 });
        setIsYearMounted(true);
        return 'year';
      }
      yearOpacity.value = withTiming(0, { duration: 180 });
      monthOpacity.value = withTiming(1, { duration: 180 });
      return 'month';
    });
  }, [monthOpacity, yearOpacity]);

  return (
    <View
      style={[
        styles.screen,
        {
          // Guard against headerHeight being 0 when the navigator header is hidden —
          // always respect at least the safe-area top inset.
          paddingTop: Math.max(headerHeight, insets.top),
          paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom,
        },
      ]}
    >
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingHorizontal: TOPBAR_H_PAD }]}>
        <Text style={styles.headerLabel}>{headerLabel}</Text>

        <View style={styles.controls}>
          <Pressable
            onPress={() => setDemoMode((v) => !v)}
            style={({ pressed }) => [
              styles.chip,
              demoMode && styles.chipActive,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={demoMode ? 'Switch to live data' : 'Switch to demo data'}
          >
            <Text style={[styles.chipLabel, demoMode && styles.chipLabelActive]}>Demo</Text>
          </Pressable>

          <Pressable
            onPress={() => setHideEmpty((v) => !v)}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel={hideEmpty ? 'Show all days' : 'Hide empty days'}
          >
            <View style={[styles.filterDot, hideEmpty && styles.filterDotActive]} />
          </Pressable>

          <Pressable
            onPress={toggleViewMode}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel={
              viewMode === 'month' ? 'Switch to year view' : 'Switch to month view'
            }
          >
            <Text style={[styles.toggleLabel, viewMode === 'year' && styles.toggleLabelActive]}>
              {viewMode === 'month' ? t('canvas.year') : t('canvas.month')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── View container ── */}
      <View
        style={styles.fill}
        onLayout={({ nativeEvent }) => setContainerHeight(nativeEvent.layout.height)}
      >
        {/* Month view — 3-slot recycling pager */}
        <Animated.View
          pointerEvents={viewMode === 'month' ? 'auto' : 'none'}
          style={[styles.absoluteFill, monthAnimStyle]}
        >
          {containerHeight > 0 && (
            <ScrollView
              ref={monthScrollRef}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleMonthScrollEnd}
            >
              {/* Slot 0 — previous month (no peeks: clean during transition) */}
              <MonthPage
                key="prev"
                monthItem={prevMonthItem}
                pageHeight={containerHeight}
                tileSize={tileSize}
                hideEmpty={hideEmpty}
                demoMode={demoMode}
                onDayPress={onDayPress}
              />
              {/* Slot 1 — current month (peek strips visible at rest) */}
              <CenterMonthPage
                key="center"
                monthItem={centerMonthItem}
                prevItem={centerPrevItem}
                nextItem={centerNextItem}
                pageHeight={containerHeight}
                tileSize={tileSize}
                hideEmpty={hideEmpty}
                demoMode={demoMode}
                onDayPress={onDayPress}
              />
              {/* Slot 2 — next month (no peeks: clean during transition) */}
              <MonthPage
                key="next"
                monthItem={nextMonthItem}
                pageHeight={containerHeight}
                tileSize={tileSize}
                hideEmpty={hideEmpty}
                demoMode={demoMode}
                onDayPress={onDayPress}
              />
            </ScrollView>
          )}
        </Animated.View>

        {/* Year view — lazy-mounted on first open */}
        <Animated.View
          pointerEvents={viewMode === 'year' ? 'auto' : 'none'}
          style={[styles.absoluteFill, yearAnimStyle]}
        >
          {isYearMounted && (
            <View style={[styles.fill, { paddingHorizontal: GRID_H_PAD }]}>
              <YearView
                onDayPress={onDayPress}
                contentWidth={yearContentWidth}
                demoMode={demoMode}
              />
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLabel: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    letterSpacing: -0.4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chip: {
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: theme.colors.mosaicGold,
    borderColor: theme.colors.mosaicGold,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    fontFamily: 'SpaceMono',
  },
  chipLabelActive: {
    color: theme.colors.onAccent,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.divider,
  },
  filterDotActive: {
    backgroundColor: theme.colors.mosaicGold,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
    fontFamily: 'SpaceMono',
  },
  toggleLabelActive: {
    color: theme.colors.mosaicGold,
  },
  fill: {
    flex: 1,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  monthPageLabel: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    letterSpacing: -0.4,
  },
  edgeFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: EDGE_FADE_HEIGHT,
  },
}));
