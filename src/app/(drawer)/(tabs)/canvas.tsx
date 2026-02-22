import { useHeaderHeight } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { LAYOUT } from '@/src/constants/layout';
import { MonthGrid } from '@/src/features/canvas/components/month-grid';
import { YearView } from '@/src/features/canvas/components/year-view';
import { useCanvasData } from '@/src/features/canvas/hooks/useCanvasData';
import { useCanvasDbData } from '@/src/features/canvas/hooks/useCanvasDbData';
import { getMonthName } from '@/src/features/canvas/utils/date-labels';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Horizontal padding for the top bar */
const TOPBAR_H_PAD = 24;
/** Horizontal padding for the month grid — smaller = bigger tiles */
const GRID_H_PAD = 8;
const TILE_GAP = 4;
const MONTHS_BACK = 36;
/** Height of the peeking adjacent-month strip at top/bottom of each page */
const PEEK_HEIGHT = 80;

type ViewMode = 'month' | 'year';

// ─── Month list: OLDEST-FIRST (index 0 = oldest, last = current month) ───────

type MonthItem = { month: number; year: number };

function buildMonthList(count: number): MonthItem[] {
  const now = new Date();
  // Oldest at index 0 so swipe-DOWN reveals the month above (older)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return { month: d.getMonth(), year: d.getFullYear() };
  });
}

const MONTH_LIST = buildMonthList(MONTHS_BACK);
const INITIAL_INDEX = MONTH_LIST.length - 1; // current month

// ─── PeekGrid ─────────────────────────────────────────────────────────────────

type PeekGridProps = {
  month: number;
  year: number;
  tileSize: number;
  demoMode: boolean;
};

function PeekGrid({ month, year, tileSize, demoMode }: PeekGridProps) {
  const mockData = useCanvasData(month, year);
  const dbData = useCanvasDbData(month, year, !demoMode);
  const data = demoMode ? mockData : dbData;

  return (
    <MonthGrid
      month={month}
      year={year}
      data={data}
      tileSize={tileSize}
      tileGap={TILE_GAP}
      hideEmpty={false}
      showDowHeader={false}
      onDayPress={() => {}}
    />
  );
}

// ─── MonthPage ────────────────────────────────────────────────────────────────

type MonthPageProps = {
  index: number;
  pageHeight: number;
  tileSize: number;
  hideEmpty: boolean;
  demoMode: boolean;
  onDayPress: (date: string) => void;
};

function MonthPage({
  index,
  pageHeight,
  tileSize,
  hideEmpty,
  demoMode,
  onDayPress,
}: MonthPageProps) {
  const { month, year } = MONTH_LIST[index];
  const prevItem = MONTH_LIST[index - 1]; // older month — appears when swiping DOWN
  const nextItem = MONTH_LIST[index + 1]; // newer month — appears when swiping UP

  const { i18n } = useTranslation();
  const { theme } = useUnistyles();
  const bg = theme.colors.background;

  const mockData = useCanvasData(month, year);
  const dbData = useCanvasDbData(month, year, !demoMode);
  const data = demoMode ? mockData : dbData;

  return (
    <View style={{ height: pageHeight }}>
      {/* ── Top peek: older month, bottom rows visible ── */}
      <View style={{ height: PEEK_HEIGHT, overflow: 'hidden' }} pointerEvents="none">
        {prevItem && (
          <>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: GRID_H_PAD,
                right: GRID_H_PAD,
                opacity: 0.45,
              }}
            >
              <PeekGrid
                month={prevItem.month}
                year={prevItem.year}
                tileSize={tileSize}
                demoMode={demoMode}
              />
            </View>
            <LinearGradient
              colors={[bg, `${bg}00`]}
              style={styles.absoluteFill}
              pointerEvents="none"
            />
          </>
        )}
      </View>

      {/* ── Main: month label + current grid ── */}
      <View style={{ flex: 1, paddingHorizontal: GRID_H_PAD, justifyContent: 'center', gap: 10 }}>
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

      {/* ── Bottom peek: newer month, top rows visible ── */}
      <View style={{ height: PEEK_HEIGHT, overflow: 'hidden' }} pointerEvents="none">
        {nextItem && (
          <>
            <View style={{ paddingHorizontal: GRID_H_PAD, opacity: 0.45 }}>
              <PeekGrid
                month={nextItem.month}
                year={nextItem.year}
                tileSize={tileSize}
                demoMode={demoMode}
              />
            </View>
            <LinearGradient
              colors={[`${bg}00`, bg]}
              style={styles.absoluteFill}
              pointerEvents="none"
            />
          </>
        )}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CanvasScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight(); // transparent header height (includes status bar)
  const { width: screenWidth } = useWindowDimensions();

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);

  const flatListRef = useRef<FlatList<MonthItem>>(null);

  // Tile size based on tighter grid padding for larger tiles
  const gridContentWidth = screenWidth - GRID_H_PAD * 2;
  const tileSize = (gridContentWidth - 6 * TILE_GAP) / 7;

  // YearView uses the same tight padding as the month grid for full-width tiles
  const yearContentWidth = screenWidth - GRID_H_PAD * 2;

  // Label only shown in the top bar for year view; month view shows label inside each page
  const headerLabel = viewMode === 'year' ? 'Year View' : '';

  // ── Placeholder day-press handler ──
  const onDayPress = useCallback((date: string) => {
    Alert.alert('Day selected', date);
  }, []);

  // ── Scroll to current month (last item) once height is measured ──
  useEffect(() => {
    if (containerHeight > 0) {
      flatListRef.current?.scrollToOffset({
        offset: containerHeight * INITIAL_INDEX,
        animated: false,
      });
    }
  }, [containerHeight]);

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
          // headerHeight already includes insets.top for the transparent header
          paddingTop: headerHeight,
          paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom,
        },
      ]}
    >
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingHorizontal: TOPBAR_H_PAD }]}>
        <Text style={styles.headerLabel}>{headerLabel}</Text>

        <View style={styles.controls}>
          {/* Demo data toggle */}
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

          {/* Hide-empty toggle */}
          <Pressable
            onPress={() => setHideEmpty((v) => !v)}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel={hideEmpty ? 'Show all days' : 'Hide empty days'}
          >
            <View style={[styles.filterDot, hideEmpty && styles.filterDotActive]} />
          </Pressable>

          {/* Month / Year view toggle */}
          <Pressable
            onPress={toggleViewMode}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel={
              viewMode === 'month' ? 'Switch to year view' : 'Switch to month view'
            }
          >
            <Text style={[styles.toggleLabel, viewMode === 'year' && styles.toggleLabelActive]}>
              {viewMode === 'month' ? 'Year' : 'Month'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── View container ── */}
      <View
        style={styles.fill}
        onLayout={({ nativeEvent }) => setContainerHeight(nativeEvent.layout.height)}
      >
        {/* Month view — vertical paging FlatList, oldest on top, current at bottom */}
        <Animated.View
          pointerEvents={viewMode === 'month' ? 'auto' : 'none'}
          style={[styles.absoluteFill, monthAnimStyle]}
        >
          {containerHeight > 0 && (
            <FlatList
              ref={flatListRef}
              data={MONTH_LIST}
              keyExtractor={(item) => `${item.year}-${item.month}`}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              getItemLayout={(_, index) => ({
                length: containerHeight,
                offset: containerHeight * index,
                index,
              })}
              renderItem={({ index }) => (
                <MonthPage
                  index={index}
                  pageHeight={containerHeight}
                  tileSize={tileSize}
                  hideEmpty={hideEmpty}
                  demoMode={demoMode}
                  onDayPress={onDayPress}
                />
              )}
            />
          )}
        </Animated.View>

        {/* Year view */}
        <Animated.View
          pointerEvents={viewMode === 'year' ? 'auto' : 'none'}
          style={[styles.absoluteFill, yearAnimStyle]}
        >
          <View style={[styles.fill, { paddingHorizontal: GRID_H_PAD }]}>
            <YearView onDayPress={onDayPress} contentWidth={yearContentWidth} demoMode={demoMode} />
          </View>
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
    paddingHorizontal: 10,
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
