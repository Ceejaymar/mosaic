import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Text, View, type ViewToken } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { fetchMoodEntriesForMonth } from '@/src/db/repos/moodRepo';
import { computeMockCanvasDays } from '../hooks/useCanvasData';
import { buildCanvasDays } from '../utils/buildCanvasDays';

// ─── Configuration ────────────────────────────────────────────────────────────

// 14 = 2 weeks per row (larger tiles)
// 21 = 3 weeks per row (medium tiles)
// 28 = 4 weeks per row (tiny tiles)
const COLUMNS = 14;

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
}: {
  year: number;
  demoMode: boolean;
  tileSize: number;
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
};

export function YearView({ onDayPress: _onDayPress, contentWidth, demoMode, onYearChange }: Props) {
  const currentYear = new Date().getFullYear();
  const [yearsList, setYearsList] = useState<number[]>([currentYear]);

  const tileSize = contentWidth / COLUMNS;

  const loadPreviousYear = useCallback(() => {
    setYearsList((prev) => [...prev, prev[prev.length - 1] - 1]);
  }, []);

  // Stable ref so FlatList never sees a new callback reference between renders.
  // onYearChange is setOverviewYear (a stable state setter) so no stale closure risk.
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
          <SingleYearBlock year={item} demoMode={demoMode} tileSize={tileSize} />
        )}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
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
    paddingBottom: 60,
    paddingTop: 16,
    gap: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 24,
  },
}));
