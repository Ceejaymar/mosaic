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
import { useCanvasSource } from '@/src/features/canvas/hooks/useCanvasSource';
import { getMonthName } from '@/src/features/canvas/utils/date-labels';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Horizontal padding for the top bar */
const TOPBAR_H_PAD = 24;
/** Horizontal padding for the month grid — smaller = bigger tiles */
const GRID_H_PAD = 8;
const TILE_GAP = 4;
const MONTHS_BACK = 36;
/** Height of the gradient fade at the top/bottom edges of each month page */
const EDGE_FADE_HEIGHT = 48;

type ViewMode = 'month' | 'year';

// ─── Month list: OLDEST-FIRST (index 0 = oldest, last = current month) ───────

type MonthItem = { month: number; year: number };

function buildMonthList(count: number): MonthItem[] {
  const now = new Date();
  // Oldest at index 0 so swiping UP reveals the older month
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return { month: d.getMonth(), year: d.getFullYear() };
  });
}

// ─── MonthPage ────────────────────────────────────────────────────────────────

type MonthPageProps = {
  monthItem: MonthItem;
  pageHeight: number;
  tileSize: number;
  hideEmpty: boolean;
  demoMode: boolean;
  onDayPress: (date: string) => void;
};

/**
 * Renders a single month's label + tile grid, centered vertically within
 * pageHeight. Gradient fades at the top and bottom edges signal that adjacent
 * months exist without rendering any cross-month content (avoids the overlap
 * artifacts that the peek-grid approach produced during transitions).
 */
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
  const data = useCanvasSource(month, year, demoMode);

  return (
    <View style={{ height: pageHeight }}>
      {/* Month label + tile grid, vertically centered */}
      <View style={{ flex: 1, paddingHorizontal: GRID_H_PAD, justifyContent: 'center', gap: 8 }}>
        <Text style={styles.monthPageLabel}>
          {getMonthName(month, 'long', i18n.language)} {year}
        </Text>
        <MonthGrid
          month={month}
          year={year}
          data={data}
          tileSize={tileSize}
          tileGap={TILE_GAP}
          hideEmpty={hideEmpty}
          onDayPress={onDayPress}
        />
      </View>

      {/* Top edge fade — "more months above" cue, no cross-month content */}
      <LinearGradient
        colors={[bg, `${bg}00`]}
        style={[styles.edgeFade, { top: 0 }]}
        pointerEvents="none"
      />
      {/* Bottom edge fade — "more months below" cue */}
      <LinearGradient
        colors={[`${bg}00`, bg]}
        style={[styles.edgeFade, { bottom: 0 }]}
        pointerEvents="none"
      />
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

  // ── Month list: recomputed on app-foreground resume to handle month boundaries ──
  const [monthList, setMonthList] = useState(() => buildMonthList(MONTHS_BACK));

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') setMonthList(buildMonthList(MONTHS_BACK));
    });
    return () => sub.remove();
  }, []);

  // ── 3-slot recycling pager ──
  // centerMonthIndex points to the month in monthList that occupies slot 1 (center).
  // Slots 0 (prev) and 2 (next) hold adjacent months. After each scroll settle,
  // we update centerMonthIndex and snap the ScrollView back to slot 1 — the user
  // sees only one month at a time, and the same 3 component instances are reused.
  const [centerMonthIndex, setCenterMonthIndex] = useState(monthList.length - 1);
  const monthScrollRef = useRef<ScrollView>(null);

  const prevMonthItem = monthList[Math.max(0, centerMonthIndex - 1)];
  const centerMonthItem = monthList[centerMonthIndex];
  const nextMonthItem = monthList[Math.min(monthList.length - 1, centerMonthIndex + 1)];

  // Scroll to center slot once the container is measured
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

  // Tile size based on tight grid padding for larger tiles
  const gridContentWidth = screenWidth - GRID_H_PAD * 2;
  const tileSize = (gridContentWidth - 6 * TILE_GAP) / 7;

  const yearContentWidth = screenWidth - GRID_H_PAD * 2;
  const headerLabel = viewMode === 'year' ? t('canvas.overview') : '';

  const onDayPress = useCallback((date: string) => {
    Alert.alert('Day selected', date);
  }, []);

  // ── View mode cross-fade ──
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
          paddingTop: headerHeight,
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
              {/* Slot 0 — previous month */}
              <MonthPage
                key="prev"
                monthItem={prevMonthItem}
                pageHeight={containerHeight}
                tileSize={tileSize}
                hideEmpty={hideEmpty}
                demoMode={demoMode}
                onDayPress={onDayPress}
              />
              {/* Slot 1 — current month (always starts here) */}
              <MonthPage
                key="center"
                monthItem={centerMonthItem}
                pageHeight={containerHeight}
                tileSize={tileSize}
                hideEmpty={hideEmpty}
                demoMode={demoMode}
                onDayPress={onDayPress}
              />
              {/* Slot 2 — next month */}
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
