import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { fetchMoodEntriesForMonth } from '@/src/db/repos/moodRepo';
import { getMoodDisplayInfo } from '@/src/features/check-in/utils/mood-helpers';

import type { CanvasDay } from '../hooks/useCanvasData';
import { useCanvasData } from '../hooks/useCanvasData';
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

const YEAR_TILE_GAP = 3;
/** Width reserved for the 3-letter month abbreviation column */
const MONTH_LABEL_WIDTH = 26;
/** Gap between the month label column and the tile grid */
const LABEL_GRID_GAP = 6;

// ─── MiniMonth ────────────────────────────────────────────────────────────────

type MiniMonthProps = {
  month: number;
  year: number;
  tileSize: number;
  demoMode: boolean;
  dbData: CanvasDay[];
  onDayPress: (date: string) => void;
};

const MiniMonth = memo(function MiniMonth({
  month,
  year,
  tileSize,
  demoMode,
  dbData,
  onDayPress,
}: MiniMonthProps) {
  const { i18n } = useTranslation();
  const mockData = useCanvasData(month, year);
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

  // ── Centralized DB data for all visible months ──
  const [liveDataMap, setLiveDataMap] = useState<Record<string, CanvasDay[]>>({});

  useEffect(() => {
    if (demoMode) {
      setLiveDataMap({});
      return;
    }

    let cancelled = false;

    const yearsList = [currentYear - 1, currentYear];
    const monthsToFetch = yearsList.flatMap((year) =>
      Array.from({ length: year === currentYear ? currentMonth + 1 : 12 }, (_, m) => ({
        month: m,
        year,
      })),
    );

    Promise.all(
      monthsToFetch.map(({ month, year }) =>
        fetchMoodEntriesForMonth(year, month).then((entries) => {
          const grouped = new Map<string, string[]>();
          for (const entry of entries) {
            const color = getMoodDisplayInfo(entry.primaryMood)?.color;
            if (!color) continue;
            const existing = grouped.get(entry.dateKey) ?? [];
            if (existing.length < 4) grouped.set(entry.dateKey, [...existing, color]);
          }

          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const canvasDays: CanvasDay[] = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const mm = String(month + 1).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const dateStr = `${year}-${mm}-${dd}`;
            return { date: dateStr, entries: grouped.get(dateStr) ?? [] };
          });

          return { key: `${year}-${month}`, data: canvasDays };
        }),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        const map: Record<string, CanvasDay[]> = {};
        for (const { key, data } of results) map[key] = data;
        setLiveDataMap(map);
      })
      .catch(console.error);

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
              dbData={liveDataMap[`${year}-${m}`] ?? []}
              onDayPress={onDayPress}
            />
          ))}
        </View>
      ))}
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
}));
