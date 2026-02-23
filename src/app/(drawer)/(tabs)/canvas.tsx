import { useHeaderHeight } from '@react-navigation/elements';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AppState, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

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
const GRID_ROWS = 6; // forced by 42-cell MonthGrid

// Fixed-height components inside each item — used to compute itemHeight
// deterministically so getItemLayout and snapToInterval are always exact.
const ITEM_PAD_V = 16; // top + bottom padding inside each item (each side)
const MONTH_LABEL_H = 24; // fontSize 20 → ~24px natural line height
const LABEL_GRID_GAP = 12; // gap between month label and MonthGrid
const DOW_HEADER_H = 18; // fontSize 11 text (~14px) + marginBottom TILE_GAP (4px)

type ViewMode = 'month' | 'year';

// ─── Month list ───────────────────────────────────────────────────────────────

type MonthItem = { month: number; year: number; id: string };

function buildMonthList(count: number): MonthItem[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return { month: d.getMonth(), year: d.getFullYear(), id: `${d.getFullYear()}-${d.getMonth()}` };
  });
}

// ─── AnimatedMonth ────────────────────────────────────────────────────────────
//
// Each item has an explicit fixed height (itemHeight) so snapToInterval +
// getItemLayout are always exact. Opacity is driven purely by the scroll
// position on the UI thread — no state updates, no re-renders during scroll.

type AnimatedMonthProps = {
  item: MonthItem;
  index: number;
  scrollY: SharedValue<number>;
  itemHeight: number;
  tileSize: number;
  hideEmpty: boolean;
  demoMode: boolean;
  onDayPress: (date: string) => void;
};

const AnimatedMonth = memo(function AnimatedMonth({
  item,
  index,
  scrollY,
  itemHeight,
  tileSize,
  hideEmpty,
  demoMode,
  onDayPress,
}: AnimatedMonthProps) {
  const { i18n } = useTranslation();
  const { data } = useCanvasSource(item.month, item.year, demoMode);

  // scrollY === index * itemHeight when this item is perfectly centred.
  // Opacity fades from 1.0 (centred) to 0.3 (one full item off-screen).
  const animStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollY.value - index * itemHeight);
    const opacity = interpolate(distance, [0, itemHeight], [1, 0.3], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        {
          height: itemHeight,
          paddingHorizontal: GRID_H_PAD,
          paddingVertical: ITEM_PAD_V,
          justifyContent: 'flex-start',
          gap: LABEL_GRID_GAP,
        },
        animStyle,
      ]}
    >
      <Text style={styles.monthPageLabel}>
        {getMonthName(item.month, 'long', i18n.language)} {item.year}
      </Text>
      <MonthGrid
        month={item.month}
        year={item.year}
        data={data}
        tileSize={tileSize}
        tileGap={TILE_GAP}
        hideEmpty={hideEmpty}
        onDayPress={onDayPress}
      />
    </Animated.View>
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
  const [monthList, setMonthList] = useState(() => buildMonthList(MONTHS_BACK));

  // ── Geometry ──────────────────────────────────────────────────────────────
  const gridContentWidth = screenWidth - GRID_H_PAD * 2;
  const tileSize = (gridContentWidth - 6 * TILE_GAP) / 7;

  // All items share this exact height — required for snapToInterval correctness.
  const gridH = GRID_ROWS * tileSize + (GRID_ROWS - 1) * TILE_GAP;
  const itemHeight = ITEM_PAD_V * 2 + MONTH_LABEL_H + LABEL_GRID_GAP + DOW_HEADER_H + gridH;

  // Equal padding above/below items so the centred item fills the viewport.
  const verticalPadding = containerHeight > 0 ? Math.max(0, (containerHeight - itemHeight) / 2) : 0;

  // ── Refs ──────────────────────────────────────────────────────────────────
  // verticalPaddingRef lets getItemLayout read the current padding at call
  // time without the callback having to be recreated on every layout change.
  const verticalPaddingRef = useRef(verticalPadding);
  verticalPaddingRef.current = verticalPadding;

  const monthListRef = useRef(monthList);
  monthListRef.current = monthList;

  // biome-ignore lint/suspicious/noExplicitAny: ref forwards to underlying FlatList
  const flatListRef = useRef<any>(null);

  // ── AppState: rebuild list at midnight crossover ──────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      const newList = buildMonthList(MONTHS_BACK);
      // Only update if a new month has rolled over
      if (
        newList[newList.length - 1].id !== monthListRef.current[monthListRef.current.length - 1].id
      ) {
        setMonthList(newList);
      }
    });
    return () => sub.remove();
  }, []);

  // ── Scroll to current month after layout or after monthList rebuild ───────
  useEffect(() => {
    if (containerHeight > 0 && itemHeight > 0) {
      flatListRef.current?.scrollToIndex({
        index: monthList.length - 1,
        animated: false,
      });
    }
  }, [containerHeight, itemHeight, monthList]);

  // ── Scroll handler (runs on UI thread, no bridge) ─────────────────────────
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // ── getItemLayout (required for scrollToIndex / initialScrollIndex) ───────
  // Offsets include verticalPadding so the FlatList knows the true content
  // position of each item. Reads from ref so the callback stays stable.
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: itemHeight,
      offset: verticalPaddingRef.current + index * itemHeight,
      index,
    }),
    [itemHeight],
  );

  // ── Prefetch adjacent months on scroll settle ─────────────────────────────
  const handleScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      if (demoMode) return;
      // At rest, scrollY is an exact multiple of itemHeight.
      const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
      for (const offset of [-2, -1, 1, 2]) {
        const idx = Math.max(0, Math.min(monthListRef.current.length - 1, index + offset));
        const { month, year } = monthListRef.current[idx];
        prefetchMonth(year, month);
      }
    },
    [demoMode, itemHeight],
  );

  const yearContentWidth = screenWidth - GRID_H_PAD * 2;
  const headerLabel = viewMode === 'year' ? t('canvas.overview') : '';

  const onDayPress = useCallback((date: string) => {
    Alert.alert('Day selected', date);
  }, []);

  // ── renderItem (memoised to prevent unnecessary FlatList item re-renders) ──
  const renderItem = useCallback(
    ({ item, index }: { item: MonthItem; index: number }) => (
      <AnimatedMonth
        item={item}
        index={index}
        scrollY={scrollY}
        itemHeight={itemHeight}
        tileSize={tileSize}
        hideEmpty={hideEmpty}
        demoMode={demoMode}
        onDayPress={onDayPress}
      />
    ),
    [scrollY, itemHeight, tileSize, hideEmpty, demoMode, onDayPress],
  );

  // ── Month ↔ Year view fade ─────────────────────────────────────────────────
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
        {/* Month view — Animated.FlatList with scroll-driven per-item opacity */}
        <Animated.View
          pointerEvents={viewMode === 'month' ? 'auto' : 'none'}
          style={[styles.absoluteFill, monthAnimStyle]}
        >
          {/*
           * Gate on containerHeight > 0 so that getItemLayout and
           * initialScrollIndex have the correct verticalPadding from the start,
           * avoiding any initial-scroll correction flash.
           */}
          {containerHeight > 0 && (
            <Animated.FlatList
              ref={flatListRef}
              data={monthList}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              getItemLayout={getItemLayout}
              initialScrollIndex={monthList.length - 1}
              contentContainerStyle={{ paddingVertical: verticalPadding }}
              snapToInterval={itemHeight}
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              scrollEventThrottle={16}
              onScroll={scrollHandler}
              onMomentumScrollEnd={handleScrollEnd}
            />
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
}));
