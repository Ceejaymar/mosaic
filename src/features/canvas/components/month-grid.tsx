import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { CanvasDay } from '../hooks/useCanvasData';
import { getDowLabels } from '../utils/date-labels';
import { DayTile } from './day-tile';

type Props = {
  month: number; // 0-indexed
  year: number;
  data: CanvasDay[];
  tileSize: number;
  tileGap: number;
  hideEmpty: boolean;
  showDowHeader?: boolean;
  onDayPress: (date: string) => void;
};

export const MonthGrid = memo(function MonthGrid({
  month,
  year,
  data,
  tileSize,
  tileGap,
  hideEmpty,
  showDowHeader = true,
  onDayPress,
}: Props) {
  const { i18n } = useTranslation();
  const firstDow = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayMap = new Map(data.map((d) => [Number(d.date.slice(8)), d]));

  type Cell = { key: string; day: number | null };

  // Build cells with stable string keys: blank spacers use their column slot, days use the day number
  const cells: Cell[] = [
    ...Array.from({ length: firstDow }, (_, i) => ({ key: `blank-${i}`, day: null })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ key: `day-${i + 1}`, day: i + 1 })),
  ];

  return (
    <View>
      {/* Day-of-week header — shown in month view; suppressed in year view (shown once per year block) */}
      {showDowHeader && (
        <View style={[styles.row, { gap: tileGap, marginBottom: tileGap }]}>
          {getDowLabels(i18n.language).map(({ key, label }) => (
            <Text key={key} style={[styles.dowLabel, { width: tileSize }]}>
              {label}
            </Text>
          ))}
        </View>
      )}

      {/* Tile grid */}
      <View style={[styles.grid, { gap: tileGap }]}>
        {cells.map(({ key, day }) => {
          const cellSize = { width: tileSize, height: tileSize };

          if (day === null) {
            return <View key={key} style={cellSize} />;
          }

          const dayData = dayMap.get(day);
          const colors = dayData?.entries ?? [];

          if (hideEmpty && colors.length === 0) {
            return <View key={key} style={cellSize} />;
          }

          const hasData = colors.length > 0;

          return (
            <Pressable
              key={key}
              disabled={!hasData}
              onPress={() => dayData && onDayPress(dayData.date)}
              style={({ pressed }) => [cellSize, hasData && pressed && { opacity: 0.7 }]}
            >
              <DayTile colors={colors} day={day} size={tileSize} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
  },
  dowLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
}));
