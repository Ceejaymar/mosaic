import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { type DimensionValue, FlatList, Pressable, View, type ViewToken } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { fetchMoodEntriesForMonth } from '@/src/db/repos/moodRepo';
import { buildCanvasDays } from '@/src/features/canvas/utils/buildCanvasDays';
import { isWithinThreeMonths } from '@/src/features/canvas/utils/date-utils';
import { getDemoEntriesForMonth } from '@/src/features/demo/generateDemoData';
import { useAppStore } from '@/src/store/useApp';

// ─── Context ──────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 5;
const VisibleYearContext = createContext(CURRENT_YEAR);
const yearKeyExtractor = (item: number) => item.toString();

// ─── Configuration ────────────────────────────────────────────────────────────

const COLUMNS = 14;
const MAX_ROWS = 27;
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 };

// Pre-calculate exact percentage strings for strict grid mode
const TILE_W_STRICT = `${100 / COLUMNS}%` as const;
const TILE_H_STRICT = `${100 / MAX_ROWS}%` as const;

// Static absolute positions for multi-color mosaic tiles
const PANELS = {
  left: { position: 'absolute' as const, top: 0, bottom: 0, left: 0, width: '50%' as const },
  right: { position: 'absolute' as const, top: 0, bottom: 0, left: '50%' as const, right: 0 },
  tl: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '50%' as const,
    height: '50%' as const,
  },
  tr: {
    position: 'absolute' as const,
    top: 0,
    left: '50%' as const,
    right: 0,
    height: '50%' as const,
  },
  bl: {
    position: 'absolute' as const,
    top: '50%' as const,
    left: 0,
    width: '50%' as const,
    bottom: 0,
  },
  br: {
    position: 'absolute' as const,
    top: '50%' as const,
    left: '50%' as const,
    right: 0,
    bottom: 0,
  },
  bottom: { position: 'absolute' as const, top: '50%' as const, left: 0, right: 0, bottom: 0 },
};

// ─── YearTile ─────────────────────────────────────────────────────────────────

type YearTileProps = {
  dateKey: string;
  colors: string[];
  isEvenMonth: boolean;
  isFuture: boolean;
  isWithin3Months: boolean;
  onPress: (dateKey: string) => void;
  onEmptyDayPress?: (dateKey: string) => void;
  // Dynamic sizing for Compact Mode (Fixed to DimensionValue!)
  width: DimensionValue;
  height: DimensionValue;
};

const YearTile = memo(function YearTile({
  dateKey,
  colors,
  isEvenMonth,
  isFuture,
  isWithin3Months,
  onPress,
  onEmptyDayPress,
  width,
  height,
}: YearTileProps) {
  const { theme } = useUnistyles();
  const emptyBg = isEvenMonth ? theme.colors.surface : 'transparent';
  const opacity = isFuture ? 0.25 : 1;
  const hasData = colors.length > 0;
  const canLogHistorical = !hasData && !isFuture && isWithin3Months && !!onEmptyDayPress;
  const isInteractive = hasData || canLogHistorical;

  const handlePress = () => {
    if (hasData) onPress(dateKey);
    else if (canLogHistorical) onEmptyDayPress?.(dateKey);
  };

  const flatStyle = {
    width,
    height,
    opacity,
    backgroundColor: colors.length === 0 ? emptyBg : colors[0],
  };
  const containerStyle = { width, height, overflow: 'hidden' as const, opacity };

  if (colors.length <= 1) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={!isInteractive}
        style={({ pressed }) => (pressed ? [flatStyle, { opacity: opacity * 0.6 }] : flatStyle)}
      />
    );
  }

  if (colors.length === 2) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) =>
          pressed ? [containerStyle, { opacity: opacity * 0.6 }] : containerStyle
        }
      >
        <View style={[PANELS.left, { backgroundColor: colors[0] }]} />
        <View style={[PANELS.right, { backgroundColor: colors[1] }]} />
      </Pressable>
    );
  }

  if (colors.length === 3) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) =>
          pressed ? [containerStyle, { opacity: opacity * 0.6 }] : containerStyle
        }
      >
        <View style={[PANELS.tl, { backgroundColor: colors[0] }]} />
        <View style={[PANELS.tr, { backgroundColor: colors[1] }]} />
        <View style={[PANELS.bottom, { backgroundColor: colors[2] }]} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) =>
        pressed ? [containerStyle, { opacity: opacity * 0.6 }] : containerStyle
      }
    >
      <View style={[PANELS.tl, { backgroundColor: colors[0] }]} />
      <View style={[PANELS.tr, { backgroundColor: colors[1] }]} />
      <View style={[PANELS.bl, { backgroundColor: colors[2] }]} />
      <View style={[PANELS.br, { backgroundColor: colors[3] }]} />
    </Pressable>
  );
});

// ─── SingleYearBlock ──────────────────────────────────────────────────────────

type FlatDay = {
  dateKey: string;
  month: number;
  entries: string[];
  isFuture: boolean;
  isWithin3Months: boolean;
};

const SingleYearBlock = memo(function SingleYearBlock({
  year,
  viewportHeight,
  contentWidth,
  isCompact,
  maxTileSize,
  onDayPress,
  onEmptyDayPress,
}: {
  year: number;
  viewportHeight: number;
  contentWidth: number;
  isCompact: boolean;
  maxTileSize: number;
  onDayPress: (date: string) => void;
  onEmptyDayPress?: (date: string) => void;
}) {
  const { t } = useTranslation();
  const visibleYear = useContext(VisibleYearContext);
  const isViewable = year === visibleYear;

  const hasBeenVisible = useRef(false);
  if (isViewable) hasBeenVisible.current = true;
  const shouldRender = isViewable || hasBeenVisible.current;

  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const [flatDays, setFlatDays] = useState<FlatDay[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    if (!shouldRender) return;
    let cancelled = false;
    setLiveLoading(true);

    const months = Array.from({ length: 12 }, (_, m) => m);
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const fetchMonth = (month: number) => {
      if (isDemoMode) {
        return Promise.resolve({
          month,
          data: buildCanvasDays(getDemoEntriesForMonth(year, month), year, month),
        });
      }
      return fetchMoodEntriesForMonth(year, month).then((entries) => ({
        month,
        data: buildCanvasDays(entries, year, month),
      }));
    };

    Promise.all(months.map(fetchMonth))
      .then((results) => {
        if (cancelled) return;
        const result: FlatDay[] = [];
        for (const { month, data } of results) {
          for (const d of data) {
            result.push({
              dateKey: d.date,
              month,
              entries: d.entries,
              isFuture: d.date > todayKey,
              isWithin3Months: isWithinThreeMonths(d.date),
            });
          }
        }
        setFlatDays(result);
        setLiveLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(`Failed to load mood entries for year ${year}`, err);
          setLiveLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [year, shouldRender, isDemoMode]);

  // --- Dynamic Layout Calculation ---
  const memoizedTiles = useMemo(() => {
    let daysToRender = flatDays;

    // 1. Filter out empty days if Compact Mode is ON
    if (isCompact) {
      daysToRender = flatDays.filter((d) => d.entries.length > 0);
    }

    // 2. Calculate dynamic size based on remaining days
    let dynamicW: DimensionValue = TILE_W_STRICT;
    let dynamicH: DimensionValue = TILE_H_STRICT;

    if (isCompact && daysToRender.length > 0) {
      // Area math: Total Screen Area / Number of items = Area per item.
      // Square root of that area gives us the ideal side length of a perfectly square tile.
      const totalArea = contentWidth * viewportHeight;
      const areaPerTile = totalArea / daysToRender.length;
      let idealSide = Math.floor(Math.sqrt(areaPerTile));

      // Cap the size so 3 check-ins don't create gigantic squares
      idealSide = Math.min(idealSide, maxTileSize);

      dynamicW = idealSide;
      dynamicH = idealSide;
    }

    return daysToRender.map((day) => (
      <YearTile
        key={day.dateKey}
        dateKey={day.dateKey}
        colors={day.entries}
        isEvenMonth={day.month % 2 === 0}
        isFuture={day.isFuture}
        isWithin3Months={day.isWithin3Months}
        onPress={onDayPress}
        onEmptyDayPress={onEmptyDayPress}
        width={dynamicW}
        height={dynamicH}
      />
    ));
  }, [flatDays, isCompact, contentWidth, viewportHeight, maxTileSize, onDayPress, onEmptyDayPress]);

  return (
    <View style={[styles.yearBlock, { height: viewportHeight }]}>
      {shouldRender && (
        <View
          style={[
            styles.grid,
            { width: contentWidth, height: viewportHeight },
            // If we are compacted and have hard pixel sizes, flex-start helps them wrap naturally from top-left.
            // If not compacted, percentages will naturally fill the space exactly.
            isCompact ? { alignContent: 'flex-start', justifyContent: 'flex-start' } : {},
          ]}
        >
          {memoizedTiles}
        </View>
      )}
      {liveLoading && (
        <AppText colorVariant="muted" style={styles.loadingText}>
          {t('canvas.loadingYear', { year })}
        </AppText>
      )}
    </View>
  );
});

// ─── YearView ─────────────────────────────────────────────────────────────────

type Props = {
  onDayPress: (date: string) => void;
  onEmptyDayPress?: (date: string) => void;
  contentWidth: number;
  onYearChange: (year: number) => void;
  viewportHeight: number;
  // --- NEW PROPS FOR COMPACT MODE ---
  isCompact: boolean;
  maxTileSize: number;
};

export function YearView({
  onDayPress,
  onEmptyDayPress,
  contentWidth,
  onYearChange,
  viewportHeight,
  isCompact,
  maxTileSize,
}: Props) {
  const [yearsList, setYearsList] = useState<number[]>([CURRENT_YEAR]);
  const [visibleYear, setVisibleYear] = useState(CURRENT_YEAR);

  const loadPreviousYear = useCallback(() => {
    setYearsList((prev) => {
      const oldest = prev[prev.length - 1];
      return oldest > MIN_YEAR ? [...prev, oldest - 1] : prev;
    });
  }, []);

  const latestOnYearChangeRef = useRef(onYearChange);
  useEffect(() => {
    latestOnYearChangeRef.current = onYearChange;
  }, [onYearChange]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const year = viewableItems[0].item as number;
        latestOnYearChangeRef.current(year);
        setVisibleYear(year);
      }
    },
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <SingleYearBlock
        year={item}
        viewportHeight={viewportHeight}
        contentWidth={contentWidth}
        onDayPress={onDayPress}
        onEmptyDayPress={onEmptyDayPress}
        isCompact={isCompact}
        maxTileSize={maxTileSize}
      />
    ),
    [viewportHeight, contentWidth, onDayPress, onEmptyDayPress, isCompact, maxTileSize],
  );

  return (
    <View style={styles.wrapper}>
      <VisibleYearContext.Provider value={visibleYear}>
        <FlatList
          data={yearsList}
          keyExtractor={yearKeyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          pagingEnabled
          inverted
          onEndReached={loadPreviousYear}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
        />
      </VisibleYearContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flex: 1,
  },
  container: {
    paddingBottom: 0,
    paddingTop: 0,
  },
  yearBlock: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Default strict grid settings:
    justifyContent: 'center',
    alignContent: 'flex-start',
    gap: 0,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    position: 'absolute',
    bottom: theme.spacing[5],
  },
}));
