import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { fetchMoodEntriesForMonth } from '@/src/db/repos/moodRepo';

import type { CanvasDay } from '../hooks/useCanvasData';
import { computeMockCanvasDays } from '../hooks/useCanvasData';
import { buildCanvasDays } from '../utils/buildCanvasDays';
import { getDowLabels, getMonthName } from '../utils/date-labels';
import { MonthGrid } from './month-grid';

/** Stable React list keys for each month, used instead of array index */
const MONTH_KEYS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;

/**
 * Compact tile gap for the year overview grid.
 * Intentionally 3px (below the 4px token minimum) to pack 7 tiles across
 * the narrow per-month width without clipping.
 */
const YEAR_TILE_GAP = 3;

/**
 * Width of the 3-letter month abbreviation label column (e.g. "Jan").
 * Non-token value: sized to the narrowest locale abbreviation at 10px/600.
 */
const MONTH_LABEL_WIDTH = 26;

/**
 * Gap between the month label column and the tile grid.
 * Uses 6px (between 4 and 8 tokens) for visual balance in the compact layout.
 */
const LABEL_GRID_GAP = 6;

// ─── MiniMonth ────────────────────────────────────────────────────────────────

type MiniMonthProps = {
  month: number;
  year: number;
  tileSize: number;
  demoMode: boolean;
  mockData: CanvasDay[];
  dbData: CanvasDay[];
  onDayPress: (date: string) => void;
};

const MiniMonth = memo(function MiniMonth({
  month,
  year,
  tileSize,
  demoMode,
  mockData,
  dbData,
  onDayPress,
}: MiniMonthProps) {
  const { i18n } = useTranslation();
  const data = demoMode ? mockData : dbData;

  return (
    <View style={styles.miniMonth}>
      <Text style={[styles.miniMonthLabel, { width: MONTH_LABEL_WIDTH }]}>
        {getMonthName(month, 'short', i18n.language)}
      </Text>
      <MonthGrid
        month={month}
        year={year}
        data={data}
        tileSize={tileSize}
        tileGap={YEAR_TILE_GAP}
        hideEmpty={false}
        showDowHeader={false}
        onDayPress={onDayPress}
      />
    </View>
  );
});

// ─── YearView ─────────────────────────────────────────────────────────────────

type Props = {
  onDayPress: (date: string) => void;
  contentWidth: number;
  demoMode: boolean;
};

export function YearView({ onDayPress, contentWidth, demoMode }: Props) {
  const { i18n } = useTranslation();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  // Older year first → current year at bottom → swipe DOWN reveals older year
  const years = [currentYear - 1, currentYear];

  const scrollRef = useRef<ScrollView>(null);
  const didScrollToEnd = useRef(false);

  // Grid occupies the remaining width after the month label column
  const gridWidth = contentWidth - MONTH_LABEL_WIDTH - LABEL_GRID_GAP;
  const tileSize = (gridWidth - 6 * YEAR_TILE_GAP) / 7;

  // ── Mock data: computed once per demoMode=true, avoids per-MiniMonth hook calls ──
  const mockDataMap = useMemo(() => {
    if (!demoMode) return {} as Record<string, CanvasDay[]>;
    const map: Record<string, CanvasDay[]> = {};
    const yearsList = [currentYear - 1, currentYear];
    for (const year of yearsList) {
      const monthCount = year === currentYear ? currentMonth + 1 : 12;
      for (let m = 0; m < monthCount; m++) {
        map[`${year}-${m}`] = computeMockCanvasDays(m, year);
      }
    }
    return map;
  }, [demoMode, currentYear, currentMonth]);

  // ── Centralized DB data for all visible months ──
  const [liveDataMap, setLiveDataMap] = useState<Record<string, CanvasDay[]>>({});
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<unknown>(null);

  useEffect(() => {
    if (demoMode) {
      setLiveDataMap({});
      setLiveLoading(false);
      setLiveError(null);
      return;
    }

    let cancelled = false;
    setLiveLoading(true);
    setLiveError(null);

    const yearsList = [currentYear - 1, currentYear];
    const monthsToFetch = yearsList.flatMap((year) =>
      Array.from({ length: year === currentYear ? currentMonth + 1 : 12 }, (_, m) => ({
        month: m,
        year,
      })),
    );

    Promise.all(
      monthsToFetch.map(({ month, year }) =>
        fetchMoodEntriesForMonth(year, month).then((entries) => ({
          key: `${year}-${month}`,
          data: buildCanvasDays(entries, year, month),
        })),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        const map: Record<string, CanvasDay[]> = {};
        for (const { key, data } of results) map[key] = data;
        setLiveDataMap(map);
        setLiveLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLiveError(err);
        setLiveLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [demoMode, currentYear, currentMonth]);

  const onContentSizeChange = useCallback(() => {
    if (!didScrollToEnd.current) {
      scrollRef.current?.scrollToEnd({ animated: false });
      didScrollToEnd.current = true;
    }
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      onContentSizeChange={onContentSizeChange}
    >
      {liveError != null && !demoMode && <Text style={styles.errorText}>Failed to load data</Text>}
      {years.map((year) => (
        <View key={year} style={styles.yearBlock}>
          <Text style={styles.yearLabel}>{year}</Text>

          {/* DOW header — once per year block, offset to align with tile columns */}
          <View
            style={[
              styles.dowRow,
              { paddingLeft: MONTH_LABEL_WIDTH + LABEL_GRID_GAP, gap: YEAR_TILE_GAP },
            ]}
          >
            {getDowLabels(i18n.language).map(({ key, label }) => (
              <Text key={key} style={[styles.dowLabel, { width: tileSize }]}>
                {label}
              </Text>
            ))}
          </View>

          {Array.from({ length: year === currentYear ? currentMonth + 1 : 12 }, (_, m) => (
            <MiniMonth
              key={MONTH_KEYS[m]}
              month={m}
              year={year}
              tileSize={tileSize}
              demoMode={demoMode}
              mockData={mockDataMap[`${year}-${m}`] ?? []}
              dbData={liveDataMap[`${year}-${m}`] ?? []}
              onDayPress={onDayPress}
            />
          ))}
        </View>
      ))}
      {liveLoading && !demoMode && <Text style={styles.loadingText}>Loading…</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: 40,
    paddingBottom: 32,
  },
  yearBlock: {
    gap: 2,
  },
  yearLabel: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  dowRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dowLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontFamily: 'SpaceMono',
  },
  miniMonth: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: LABEL_GRID_GAP,
    marginBottom: 2,
  },
  miniMonthLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    letterSpacing: 0.2,
    paddingTop: 4,
    fontFamily: 'SpaceMono',
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.destructive,
    textAlign: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
  },
}));
