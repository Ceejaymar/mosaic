import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useCanvasData } from '../hooks/useCanvasData';
import { useCanvasDbData } from '../hooks/useCanvasDbData';
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
  onDayPress: (date: string) => void;
};

const MiniMonth = memo(function MiniMonth({
  month,
  year,
  tileSize,
  demoMode,
  onDayPress,
}: MiniMonthProps) {
  const { i18n } = useTranslation();
  const mockData = useCanvasData(month, year);
  const dbData = useCanvasDbData(month, year, !demoMode);
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

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      onContentSizeChange={() => {
        if (!didScrollToEnd.current) {
          scrollRef.current?.scrollToEnd({ animated: false });
          didScrollToEnd.current = true;
        }
      }}
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
  },
}));
