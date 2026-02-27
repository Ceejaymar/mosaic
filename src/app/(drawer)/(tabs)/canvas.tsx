import Ionicons from '@expo/vector-icons/Ionicons';
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
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { DemoBadge } from '@/src/components/demo-badge';
import { TopFade } from '@/src/components/top-fade';
import { LAYOUT } from '@/src/constants/layout';
import { MonthGrid } from '@/src/features/canvas/components/month-grid';
import { YearView } from '@/src/features/canvas/components/year-view';
import { useCanvasDbData } from '@/src/features/canvas/hooks/useCanvasDbData';
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

const AnimatedMonth = memo(function AnimatedMonth({
  item,
  index,
  scrollY,
  itemHeight,
  tileSize,
  onDayPress,
}: {
  item: MonthItem;
  index: number;
  scrollY: SharedValue<number>;
  itemHeight: number;
  tileSize: number;
  onDayPress: (date: string) => void;
}) {
  const { i18n } = useTranslation();
  const { days: data } = useCanvasDbData(item.month, item.year);
  const dowLabels = getDowLabels(i18n.language);

  const gridAnimStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollY.value - index * itemHeight);
    const opacity = interpolate(distance, [0, itemHeight], [1, 0.15], Extrapolation.CLAMP);
    return { opacity };
  });

  const textAnimStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollY.value - index * itemHeight);
    const opacity = interpolate(distance, [0, itemHeight * 0.4], [1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <View style={{ height: itemHeight, paddingHorizontal: GRID_H_PAD, justifyContent: 'center' }}>
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

      <Animated.View style={gridAnimStyle}>
        <MonthGrid
          month={item.month}
          year={item.year}
          data={data}
          tileSize={tileSize}
          tileGap={TILE_GAP}
          onDayPress={onDayPress}
        />
      </Animated.View>
    </View>
  );
});

export default function CanvasScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [isCompact, setIsCompact] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isYearMounted, setIsYearMounted] = useState(false);
  const [overviewYear, setOverviewYear] = useState(new Date().getFullYear());

  const monthList = useMemo(() => buildMonthList(MONTHS_BACK), []);

  const gridContentWidth = screenWidth - GRID_H_PAD * 2;
  const tileSize = (gridContentWidth - 6 * TILE_GAP) / 7;

  const gridH = GRID_ROWS * tileSize + (GRID_ROWS - 1) * TILE_GAP;
  const itemHeight = 66 + gridH;

  const verticalPadding = containerHeight > 0 ? Math.max(0, (containerHeight - itemHeight) / 2) : 0;

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
      offset: verticalPadding + 40 + index * itemHeight,
      index,
    }),
    [itemHeight, verticalPadding],
  );

  const monthOpacity = useSharedValue(1);
  const yearOpacity = useSharedValue(0);
  const monthAnimStyle = useAnimatedStyle(() => ({ opacity: monthOpacity.value }));
  const yearAnimStyle = useAnimatedStyle(() => ({ opacity: yearOpacity.value }));

  const handleDayPress = useCallback((d: string) => {
    Alert.alert('Day', d);
  }, []);

  const toggleViewMode = useCallback(() => {
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
    <View style={styles.screen}>
      <TopFade height={insets.top + 60} />

      <View style={[styles.topBar, { top: insets.top, paddingHorizontal: TOPBAR_H_PAD }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.pageTitle}>Canvas</Text>
          <DemoBadge />
        </View>
        <View style={styles.controls}>
          {viewMode === 'year' && (
            <Pressable
              onPress={() => setIsCompact(!isCompact)}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && { opacity: 0.5 },
                { marginRight: 8 },
              ]}
            >
              <Ionicons
                name={isCompact ? 'apps' : 'apps-outline'}
                size={22}
                color={theme.colors.typography}
              />
            </Pressable>
          )}
          <Text style={styles.headerLabel}>
            {viewMode === 'year' ? overviewYear.toString() : ''}
          </Text>
          <Pressable
            onPress={toggleViewMode}
            style={({ pressed }) => [styles.toggleBtn, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.toggleLabel}>
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
                  onDayPress={handleDayPress}
                />
              )}
              getItemLayout={getItemLayout}
              initialScrollIndex={monthList.length - 1}
              contentContainerStyle={{
                paddingTop: verticalPadding + 40,
                paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom,
              }}
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
            <View
              style={[
                styles.fill,
                {
                  paddingTop: insets.top + 60,
                  paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom,
                },
              ]}
            >
              <YearView
                onDayPress={handleDayPress}
                contentWidth={screenWidth}
                onYearChange={setOverviewYear}
                viewportHeight={
                  containerHeight - (insets.top + 60) - (LAYOUT.TAB_BAR_HEIGHT + insets.bottom)
                }
                isCompact={isCompact}
                maxTileSize={tileSize * 1.5}
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
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Fraunces',
    fontWeight: '700',
    color: theme.colors.typography,
    letterSpacing: -0.4,
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    marginRight: 8,
  },
  controls: { flexDirection: 'row', alignItems: 'center' },
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
