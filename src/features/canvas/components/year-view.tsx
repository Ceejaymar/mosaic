import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Text, View, type ViewToken } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { fetchMoodEntriesForMonth } from '@/src/db/repos/moodRepo';
import { computeMockCanvasDays } from '../hooks/useCanvasData';
import { buildCanvasDays } from '../utils/buildCanvasDays';

// ─── Configuration ────────────────────────────────────────────────────────────

// Number of tile columns. Controls tile width (height is derived from viewportHeight).
const COLUMNS = 14;

// Max rows needed to display a full year (365 days / 14 cols = 26.07 → ceil = 27).
const MAX_ROWS = 27;

// ─── YearTile ─────────────────────────────────────────────────────────────────

type YearTileProps = {
  colors: string[];
  size: number;
  isEvenMonth: boolean;
  isFuture: boolean;
};

const YearTile = memo(function YearTile({ colors, size, isEvenMonth, isFuture }: YearTileProps) {
  const { theme } = useUnistyles();
  const half = size / 2;
  const emptyBg = isEvenMonth ? theme.colors.surface : 'transparent';
  const opacity = isFuture ? 0.25 : 1;

  if (colors.length === 0) {
    return <View style={{ width: size, height: size, backgroundColor: emptyBg, opacity }} />;
  }

  if (colors.length === 1) {
    return <View style={{ width: size, height: size, backgroundColor: colors[0], opacity }} />;
  }

  if (colors.length === 2) {
    return (
      <View style={{ width: size, height: size, overflow: 'hidden', opacity }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: half,
            backgroundColor: colors[0],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: half,
            right: 0,
            backgroundColor: colors[1],
          }}
        />
      </View>
    );
  }

  if (colors.length === 3) {
    return (
      <View style={{ width: size, height: size, overflow: 'hidden', opacity }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: half,
            height: half,
            backgroundColor: colors[0],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: half,
            right: 0,
            height: half,
            backgroundColor: colors[1],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: half,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors[2],
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, overflow: 'hidden', opacity }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: half,
          height: half,
          backgroundColor: colors[0],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: half,
          right: 0,
          height: half,
          backgroundColor: colors[1],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: half,
          left: 0,
          width: half,
          bottom: 0,
          backgroundColor: colors[2],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: half,
          left: half,
          right: 0,
          bottom: 0,
          backgroundColor: colors[3],
        }}
      />
    </View>
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
  tileSize,
  viewportHeight,
}: {
  year: number;
  demoMode: boolean;
  tileSize: number;
  viewportHeight: number;
}) {
  const [flatDays, setFlatDays] = useState<FlatDay[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
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
      .catch(() => {
        if (!cancelled) setLiveLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [demoMode, year]);

  return (
    <View style={[styles.yearBlock, { height: viewportHeight }]}>
      <View style={styles.grid}>
        {flatDays.map((day) => (
          <YearTile
            key={day.dateKey}
            colors={day.entries}
            size={tileSize}
            isEvenMonth={day.month % 2 === 0}
            isFuture={day.isFuture}
          />
        ))}
      </View>
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
  onDayPress: _onDayPress,
  contentWidth,
  demoMode,
  onYearChange,
  viewportHeight,
}: Props) {
  const currentYear = new Date().getFullYear();
  // Inverted FlatList: data[0] renders at the bottom. Current year first = bottom.
  const [yearsList, setYearsList] = useState<number[]>([currentYear]);

  // Fit tiles to whichever dimension is tighter — width or height.
  const tileByWidth = contentWidth / COLUMNS;
  const tileByHeight = viewportHeight / MAX_ROWS;
  const tileSize = Math.min(tileByWidth, tileByHeight);

  // With inverted=true, onEndReached fires when the user scrolls UP to the oldest year.
  // Append the next older year to the END of the array so it renders above the current top.
  const loadPreviousYear = useCallback(() => {
    setYearsList((prev) => [...prev, prev[prev.length - 1] - 1]);
  }, []);

  // Stable ref — onYearChange is setOverviewYear (stable state setter), no stale closure risk.
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      onYearChange(viewableItems[0].item as number);
    }
  }).current;

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={yearsList}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => (
          <SingleYearBlock
            year={item}
            demoMode={demoMode}
            tileSize={tileSize}
            viewportHeight={viewportHeight}
          />
        )}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        inverted
        onEndReached={loadPreviousYear}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
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
    gap: 0,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    position: 'absolute',
    bottom: 20,
  },
}));
