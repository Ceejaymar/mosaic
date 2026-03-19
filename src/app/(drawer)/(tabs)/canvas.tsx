import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  ReduceMotion,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { DemoBadge } from '@/src/components/demo-badge';
import { TopFade } from '@/src/components/top-fade';
import { LAYOUT } from '@/src/constants/layout';
import { insertMoodEntry, type NewMoodEntry } from '@/src/db/repos/moodRepo';
import { MonthGrid } from '@/src/features/canvas/components/month-grid';
import { YearView } from '@/src/features/canvas/components/year-view';
import {
  invalidateMonthCache,
  prefetchMonth,
  useCanvasDbData,
} from '@/src/features/canvas/hooks/useCanvasDbData';
import { getDowLabels, getMonthName } from '@/src/features/canvas/utils/date-labels';
import { CheckInSheet } from '@/src/features/check-in/components/check-in-sheet';
import { useRefreshOnFocus } from '@/src/hooks/useRefreshOnFocus';
import { uuid } from '@/src/lib/uuid';
import { useAppStore } from '@/src/store/useApp';
import { LETTER_SPACING } from '@/src/styles/design-tokens';

// Grid math constants — used in layout calculations, exempt from token rule
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
  onEmptyDayPress,
  refreshKey,
  reduceMotion,
}: {
  item: MonthItem;
  index: number;
  scrollY: SharedValue<number>;
  itemHeight: number;
  tileSize: number;
  onDayPress: (date: string) => void;
  onEmptyDayPress?: (date: string) => void;
  refreshKey: number;
  reduceMotion: boolean;
}) {
  const { i18n } = useTranslation();
  const { days: data, loading } = useCanvasDbData(item.month, item.year, refreshKey);
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

  const dataOpacity = useSharedValue(loading ? 0 : 1);
  const dataAnimStyle = useAnimatedStyle(() => ({ opacity: dataOpacity.value }));

  // biome-ignore lint/correctness/useExhaustiveDependencies: dataOpacity is a stable shared value ref
  useEffect(() => {
    if (!loading) {
      dataOpacity.value = reduceMotion ? 1 : withTiming(1, { duration: 300 });
    }
  }, [loading, reduceMotion]);

  return (
    <View style={{ height: itemHeight, paddingHorizontal: GRID_H_PAD, justifyContent: 'center' }}>
      <Animated.View style={[styles.monthLabelWrapper, textAnimStyle]}>
        <AppText font="heading" variant="xl" colorVariant="primary" style={styles.monthPageLabel}>
          {getMonthName(item.month, 'long', i18n.language)} {item.year}
        </AppText>
        <View style={[styles.dowRow, { gap: TILE_GAP }]}>
          {dowLabels.map(({ key, label }) => (
            <AppText
              key={key}
              variant="xs"
              colorVariant="muted"
              style={[styles.dowLabel, { width: tileSize }]}
            >
              {label}
            </AppText>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={gridAnimStyle}>
        <Animated.View style={dataAnimStyle}>
          <MonthGrid
            month={item.month}
            year={item.year}
            data={data}
            tileSize={tileSize}
            tileGap={TILE_GAP}
            onDayPress={onDayPress}
            onEmptyDayPress={onEmptyDayPress}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
});

export default function CanvasScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const reduceMotion = useAppStore((s) => s.accessibility.reduceMotion);
  const rm = reduceMotion ? ReduceMotion.Always : ReduceMotion.System;

  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [isCompact, setIsCompact] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isYearMounted, setIsYearMounted] = useState(false);
  const [overviewYear, setOverviewYear] = useState(new Date().getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);

  useRefreshOnFocus(
    useCallback(() => {
      const now = new Date();
      invalidateMonthCache(now.getFullYear(), now.getMonth());
      setRefreshKey((k) => k + 1);
    }, []),
  );

  const monthList = useMemo(() => buildMonthList(MONTHS_BACK), []);

  // Grid math — raw numbers intentional
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

  const [checkInTargetDate, setCheckInTargetDate] = useState<string | null>(null);

  const handleEmptyDayPress = useCallback((dateKey: string) => {
    setCheckInTargetDate(dateKey);
  }, []);

  const handleSheetClose = useCallback(() => {
    setCheckInTargetDate(null);
  }, []);

  const handleSheetSave = useCallback(
    async (nodeId: string, note?: string, tags?: string[]) => {
      if (!checkInTargetDate) return;
      const now = new Date();
      const newEntry: NewMoodEntry = {
        id: uuid(),
        dateKey: checkInTargetDate,
        primaryMood: nodeId,
        note: note ?? null,
        tags: tags && tags.length > 0 ? JSON.stringify(tags) : null,
        occurredAt: `${checkInTargetDate}T12:00:00.000Z`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      await insertMoodEntry(newEntry);
      const [yearStr, monthStr] = checkInTargetDate.split('-');
      invalidateMonthCache(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1);
      setRefreshKey((k) => k + 1);
      setCheckInTargetDate(null);
    },
    [checkInTargetDate],
  );

  const toggleViewMode = useCallback(() => {
    setIsYearMounted(true);
    setViewMode((prev) => {
      if (prev === 'month') {
        monthOpacity.value = withTiming(0, { duration: 180, reduceMotion: rm });
        yearOpacity.value = withTiming(1, { duration: 180, reduceMotion: rm });
        return 'year';
      }
      yearOpacity.value = withTiming(0, { duration: 180, reduceMotion: rm });
      monthOpacity.value = withTiming(1, { duration: 180, reduceMotion: rm });
      return 'month';
    });
  }, [monthOpacity, yearOpacity, rm]);

  // Preload adjacent months to prevent visual pop-in
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is an intentional cache-bust trigger
  useEffect(() => {
    const current = monthList[monthList.length - 1];
    const prev = monthList[monthList.length - 2];
    const prePrev = monthList[monthList.length - 3];
    prefetchMonth(current.year, current.month);
    prefetchMonth(prev.year, prev.month);
    prefetchMonth(prePrev.year, prePrev.month);
  }, [monthList, refreshKey]);

  return (
    <View style={styles.screen}>
      <TopFade height={insets.top + 60} />

      <View style={[styles.topBar, { top: insets.top }]}>
        {/* Left: year number in year mode, empty in month mode */}
        <View style={styles.topLeft}>
          {viewMode === 'year' && (
            <AppText font="heading" variant="2xl" colorVariant="primary" style={styles.yearTitle}>
              {overviewYear}
            </AppText>
          )}
          <DemoBadge />
        </View>

        {/* Right: compact icon + month/year toggle pill */}
        <View style={styles.controls}>
          {viewMode === 'year' && (
            <Pressable
              onPress={() => setIsCompact(!isCompact)}
              style={({ pressed }) => [styles.compactBtn, pressed && { opacity: 0.5 }]}
            >
              <Ionicons
                name={isCompact ? 'apps-outline' : 'apps'}
                size={14}
                color={theme.colors.textMuted}
              />
              <AppText variant="sm" font="mono" colorVariant="muted" style={styles.compactLabel}>
                {isCompact ? t('canvas.mode.standard') : t('canvas.mode.compact')}
              </AppText>
            </Pressable>
          )}

          <Pressable onPress={toggleViewMode} style={styles.viewToggleGroup} hitSlop={12}>
            <AppText
              font="mono"
              style={viewMode === 'month' ? styles.toggleActive : styles.toggleInactive}
            >
              {t('canvas.month')}
            </AppText>
            <AppText font="mono" colorVariant="muted">
              {' | '}
            </AppText>
            <AppText
              font="mono"
              style={viewMode === 'year' ? styles.toggleActive : styles.toggleInactive}
            >
              {t('canvas.year')}
            </AppText>
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
                  onEmptyDayPress={handleEmptyDayPress}
                  refreshKey={refreshKey}
                  reduceMotion={reduceMotion}
                />
              )}
              getItemLayout={getItemLayout}
              initialScrollIndex={monthList.length - 1}
              contentContainerStyle={{
                paddingTop: verticalPadding + 40,
                paddingBottom: 0,
              }}
              snapToInterval={itemHeight}
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
              removeClippedSubviews={false}
              bounces={true}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              ListFooterComponent={
                <View style={{ height: verticalPadding, overflow: 'hidden' }}>
                  <View
                    style={{
                      paddingHorizontal: GRID_H_PAD,
                      opacity: 0.15,
                      marginTop: theme.spacing[4],
                    }}
                  >
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
                onEmptyDayPress={handleEmptyDayPress}
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

      <CheckInSheet
        visible={!!checkInTargetDate}
        initialData={checkInTargetDate ? { targetDate: checkInTargetDate } : undefined}
        onSave={handleSheetSave}
        onClose={handleSheetClose}
      />
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
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[1],
    paddingHorizontal: theme.spacing[4],
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  yearTitle: {
    fontWeight: '700',
    letterSpacing: LETTER_SPACING.tight,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  compactBtn: {
    position: 'absolute',
    right: 145,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[2],
  },
  compactLabel: {
    fontWeight: '600',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 110,
    paddingVertical: theme.spacing[2],
  },
  toggleActive: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.mosaicGold,
  },
  toggleInactive: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  // AnimatedMonth
  monthLabelWrapper: {
    marginBottom: theme.spacing[3],
  },
  monthPageLabel: {
    fontWeight: '700',
  },
  dowRow: {
    flexDirection: 'row',
    marginTop: theme.spacing[3],
  },
  dowLabel: {
    fontWeight: '600',
    textAlign: 'center',
  },
  // Layout utilities
  fill: { flex: 1 },
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
}));
