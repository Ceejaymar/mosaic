import { createContext, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View, type ViewToken } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { fetchMoodEntriesForMonth } from '@/src/db/repos/moodRepo';
import { computeMockCanvasDays } from '../hooks/useCanvasData';
import { buildCanvasDays } from '../utils/buildCanvasDays';

// ─── Context ──────────────────────────────────────────────────────────────────

const VisibleYearContext = createContext(new Date().getFullYear());

// ─── Configuration ────────────────────────────────────────────────────────────

const COLUMNS = 14;
const MAX_ROWS = 27;
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 };

// Pre-calculate exact percentage strings so Yoga handles the sub-pixel math perfectly.
const TILE_W = `${100 / COLUMNS}%` as const;
const TILE_H = `${100 / MAX_ROWS}%` as const;

// Static absolute positions using 50% — no per-tile JS math required.
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
  onPress: (dateKey: string) => void;
};

const YearTile = memo(function YearTile({
  dateKey,
  colors,
  isEvenMonth,
  isFuture,
  onPress,
}: YearTileProps) {
  const { theme } = useUnistyles();
  const emptyBg = isEvenMonth ? theme.colors.surface : 'transparent';
  const opacity = isFuture ? 0.25 : 1;

  const flatStyle = {
    width: TILE_W,
    height: TILE_H,
    opacity,
    backgroundColor: colors.length === 0 ? emptyBg : colors[0],
  };
  const containerStyle = { width: TILE_W, height: TILE_H, overflow: 'hidden' as const, opacity };

  if (colors.length <= 1) {
    return (
      <Pressable
        onPress={() => onPress(dateKey)}
        style={({ pressed }) => (pressed ? [flatStyle, { opacity: opacity * 0.6 }] : flatStyle)}
      />
    );
  }

  if (colors.length === 2) {
    return (
      <Pressable
        onPress={() => onPress(dateKey)}
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
        onPress={() => onPress(dateKey)}
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
      onPress={() => onPress(dateKey)}
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
};

const SingleYearBlock = memo(function SingleYearBlock({
  year,
  demoMode,
  viewportHeight,
  contentWidth,
  onDayPress,
}: {
  year: number;
  demoMode: boolean;
  viewportHeight: number;
  contentWidth: number;
  onDayPress: (date: string) => void;
}) {
  const visibleYear = useContext(VisibleYearContext);
  const isViewable = year === visibleYear;
  // Gate tile rendering: skip until this block is scrolled into view.
  // Once rendered, keep rendered to avoid remounting on scroll.
  const hasBeenVisible = useRef(false);
  if (isViewable) hasBeenVisible.current = true;
  const shouldRender = isViewable || hasBeenVisible.current;

  const [flatDays, setFlatDays] = useState<FlatDay[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  useEffect(() => {
    if (!shouldRender) return;
    let cancelled = false;
    setLiveLoading(true);

    const months = Array.from({ length: 12 }, (_, m) => m);
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (demoMode) {
      const result: FlatDay[] = [];
      for (const month of months) {
        for (const d of computeMockCanvasDays(month, year)) {
          result.push({ dateKey: d.date, month, entries: d.entries, isFuture: d.date > todayKey });
        }
      }
      setFlatDays(result);
      setLiveLoading(false);
      return;
    }

    Promise.all(
      months.map((month) =>
        fetchMoodEntriesForMonth(year, month).then((entries) => ({
          month,
          data: buildCanvasDays(entries, year, month),
        })),
      ),
    )
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
  }, [demoMode, year, shouldRender]);

  return (
    <View style={[styles.yearBlock, { height: viewportHeight }]}>
      {shouldRender && (
        <View style={[styles.grid, { width: contentWidth, height: viewportHeight }]}>
          {flatDays.map((day) => (
            <YearTile
              key={day.dateKey}
              dateKey={day.dateKey}
              colors={day.entries}
              isEvenMonth={day.month % 2 === 0}
              isFuture={day.isFuture}
              onPress={onDayPress}
            />
          ))}
        </View>
      )}
      {liveLoading && <Text style={styles.loadingText}>Loading {year}…</Text>}
    </View>
  );
});

// ─── YearView ─────────────────────────────────────────────────────────────────

type Props = {
  onDayPress: (date: string) => void;
  contentWidth: number;
  demoMode: boolean;
  onYearChange: (year: number) => void;
  viewportHeight: number;
};

export function YearView({
  onDayPress,
  contentWidth,
  demoMode,
  onYearChange,
  viewportHeight,
}: Props) {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5;
  // Inverted FlatList: data[0] renders at the bottom. Current year first = bottom.
  const [yearsList, setYearsList] = useState<number[]>([currentYear]);
  const [visibleYear, setVisibleYear] = useState(currentYear);

  // With inverted=true, onEndReached fires when the user scrolls UP to the oldest year.
  // Append the next older year to the END of the array so it renders above the current top.
  const loadPreviousYear = useCallback(() => {
    setYearsList((prev) => {
      const oldest = prev[prev.length - 1];
      return oldest > minYear ? [...prev, oldest - 1] : prev;
    });
  }, [minYear]);

  // Keep a fresh ref so the stable onViewableItemsChanged callback never reads a stale onYearChange.
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
        demoMode={demoMode}
        viewportHeight={viewportHeight}
        contentWidth={contentWidth}
        onDayPress={onDayPress}
      />
    ),
    [demoMode, viewportHeight, contentWidth, onDayPress],
  );

  return (
    <View style={styles.wrapper}>
      <VisibleYearContext.Provider value={visibleYear}>
        <FlatList
          data={yearsList}
          keyExtractor={(item) => item.toString()}
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
    justifyContent: 'center',
    alignContent: 'flex-start',
    gap: 0,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    position: 'absolute',
    bottom: 20,
  },
}));
