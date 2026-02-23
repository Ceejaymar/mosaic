import { useHeaderHeight } from '@react-navigation/elements';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Text, useWindowDimensions, View } from 'react-native';
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
import { useCanvasSource } from '@/src/features/canvas/hooks/useCanvasSource';
import { getDowLabels, getMonthName } from '@/src/features/canvas/utils/date-labels';

const TOPBAR_H_PAD = 24;
const GRID_H_PAD = 8;
const TILE_GAP = 4;
const MONTHS_BACK = 36;
const GRID_ROWS = 6;

type MonthItem = { month: number; year: number; id: string };

function buildMonthList(count: number): MonthItem[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return { month: d.getMonth(), year: d.getFullYear(), id: `${d.getFullYear()}-${d.getMonth()}` };
  });
}

// ─── AnimatedMonth ────────────────────────────────────────────────────────────

const AnimatedMonth = memo(function AnimatedMonth({
  item,
  index,
  scrollY,
  itemHeight,
  tileSize,
  hideEmpty,
  demoMode,
  onDayPress,
}: {
  item: MonthItem;
  index: number;
  scrollY: SharedValue<number>;
  itemHeight: number;
  tileSize: number;
  hideEmpty: boolean;
  demoMode: boolean;
  onDayPress: (date: string) => void;
}) {
  const { i18n } = useTranslation();
  const { data } = useCanvasSource(item.month, item.year, demoMode);
  const dowLabels = getDowLabels(i18n.language);

  // 1. GRID FADE: Fades to 0.15 smoothly across the whole height
  const gridAnimStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollY.value - index * itemHeight);
    const opacity = interpolate(distance, [0, itemHeight], [1, 0.15], Extrapolation.CLAMP);
    return { opacity };
  });

  // 2. TEXT FADE: Fades to ZERO twice as fast, vanishing before overlapping the next month
  const textAnimStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollY.value - index * itemHeight);
    const opacity = interpolate(distance, [0, itemHeight * 0.4], [1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <View style={{ height: itemHeight, paddingHorizontal: GRID_H_PAD, justifyContent: 'center' }}>
      {/* Header Block: Month Label + Day Letters */}
      <Animated.View style={[{ marginBottom: 12 }, textAnimStyle]}>
        <Text style={styles.monthPageLabel}>
          {getMonthName(item.month, 'long', i18n.language)} {item.year}
        </Text>
        <View style={[styles.row, { gap: TILE_GAP, marginTop: 12 }]}>
          {dowLabels.map(({ key, label }) => (
            <Text key={key} style={[styles.dowLabel, { width: tileSize }]}>
              {label}
            </Text>
          ))}
        </View>
      </Animated.View>

      {/* Grid Block */}
      <Animated.View style={gridAnimStyle}>
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
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CanvasScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isYearMounted, setIsYearMounted] = useState(false);
  const [overviewYear, setOverviewYear] = useState(new Date().getFullYear());

  // Use useMemo here to avoid an unused state setter warning
  const monthList = useMemo(() => buildMonthList(MONTHS_BACK), []);

  const gridContentWidth = screenWidth - GRID_H_PAD * 2;
  const tileSize = (gridContentWidth - 6 * TILE_GAP) / 7;

  // The Header block roughly takes up ~66px (Label + Gaps + DoW Letters)
  const gridH = GRID_ROWS * tileSize + (GRID_ROWS - 1) * TILE_GAP;
  const itemHeight = 66 + gridH;

  const verticalPadding = containerHeight > 0 ? Math.max(0, (containerHeight - itemHeight) / 2) : 0;

  // Compute the Future Month for the footer peek safely (avoids December rollover bug)
  const futureDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }, []);
  const futureMonth = { month: futureDate.getMonth(), year: futureDate.getFullYear() };

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: itemHeight,
      offset: verticalPadding + index * itemHeight,
      index,
    }),
    [itemHeight, verticalPadding],
  );

  const monthOpacity = useSharedValue(1);
  const yearOpacity = useSharedValue(0);
  const monthAnimStyle = useAnimatedStyle(() => ({ opacity: monthOpacity.value }));
  const yearAnimStyle = useAnimatedStyle(() => ({ opacity: yearOpacity.value }));

  const toggleViewMode = useCallback(() => {
    // Lazy-mount on first open; keep mounted while on this screen so re-opening
    // is instant. The component unmounts automatically when navigating away.
    setIsYearMounted(true);
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
          paddingTop: Math.max(headerHeight, insets.top),
          paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom,
        },
      ]}
    >
      <View style={[styles.topBar, { paddingHorizontal: TOPBAR_H_PAD }]}>
        <Text style={styles.headerLabel}>{viewMode === 'year' ? overviewYear.toString() : ''}</Text>
        <View style={styles.controls}>
          <Pressable
            onPress={() => setDemoMode((v) => !v)}
            style={({ pressed }) => [
              styles.chip,
              demoMode && styles.chipActive,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              demoMode ? t('canvas.demo.accessibilityLive') : t('canvas.demo.accessibilityDemo')
            }
          >
            <Text style={[styles.chipLabel, demoMode && styles.chipLabelActive]}>
              {t('canvas.demo.label')}
            </Text>
          </Pressable>
          <Pressable
            onPress={toggleViewMode}
            style={({ pressed }) => [styles.toggleBtn, pressed && { opacity: 0.5 }]}
          >
            <Text style={[styles.toggleLabel]}>
              {viewMode === 'month' ? t('canvas.year') : t('canvas.month')}
            </Text>
          </Pressable>
        </View>
      </View>

      <View
        style={styles.fill}
        onLayout={({ nativeEvent }) => setContainerHeight(nativeEvent.layout.height)}
      >
        <Animated.View
          pointerEvents={viewMode === 'month' ? 'auto' : 'none'}
          style={[styles.absoluteFill, monthAnimStyle]}
        >
          {containerHeight > 0 && (
            <Animated.FlatList
              data={monthList}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <AnimatedMonth
                  item={item}
                  index={index}
                  scrollY={scrollY}
                  itemHeight={itemHeight}
                  tileSize={tileSize}
                  hideEmpty={hideEmpty}
                  demoMode={demoMode}
                  onDayPress={(d) => Alert.alert('Day', d)}
                />
              )}
              getItemLayout={getItemLayout}
              initialScrollIndex={monthList.length - 1}
              contentContainerStyle={{ paddingTop: verticalPadding, paddingBottom: 0 }}
              snapToInterval={itemHeight}
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              bounces={true}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              ListFooterComponent={
                <View style={{ height: verticalPadding, overflow: 'hidden' }}>
                  <View style={{ paddingHorizontal: GRID_H_PAD, opacity: 0.15, marginTop: 16 }}>
                    <MonthGrid
                      month={futureMonth.month}
                      year={futureMonth.year}
                      data={[]}
                      tileSize={tileSize}
                      tileGap={TILE_GAP}
                      hideEmpty={hideEmpty}
                      onDayPress={() => {}}
                    />
                  </View>
                </View>
              }
            />
          )}
        </Animated.View>

        <Animated.View
          pointerEvents={viewMode === 'year' ? 'auto' : 'none'}
          style={[styles.absoluteFill, yearAnimStyle]}
        >
          {isYearMounted && containerHeight > 0 && (
            <View style={styles.fill}>
              <YearView
                onDayPress={(d) => Alert.alert('Day', d)}
                contentWidth={screenWidth}
                demoMode={demoMode}
                onYearChange={setOverviewYear}
                viewportHeight={containerHeight}
              />
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
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
  controls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chip: {
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: theme.colors.mosaicGold, borderColor: theme.colors.mosaicGold },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    fontFamily: 'SpaceMono',
  },
  chipLabelActive: { color: theme.colors.onAccent },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  toggleBtn: { height: 36, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
    fontFamily: 'SpaceMono',
  },
  fill: { flex: 1 },
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  monthPageLabel: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    letterSpacing: -0.4,
  },
  row: { flexDirection: 'row' },
  dowLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', color: theme.colors.textMuted },
}));
