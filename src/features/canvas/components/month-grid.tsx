import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { CanvasDay } from '../hooks/useCanvasData';
import { DayTile } from './day-tile';

type Cell = { key: string; day: number | null };

type Props = {
  month: number;
  year: number;
  data: CanvasDay[];
  tileSize: number;
  tileGap: number;
  hideEmpty: boolean;
  onDayPress: (date: string) => void;
};

export const MonthGrid = memo(function MonthGrid({
  month,
  year,
  data,
  tileSize,
  tileGap,
  hideEmpty,
  onDayPress,
}: Props) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayMap = new Map(data.map((d) => [Number(d.date.slice(8)), d]));

  // ALWAYS force exactly 42 cells (6 rows × 7 cols) for uniform snapping
  const cells: Cell[] = [
    ...Array.from({ length: firstDow }, (_, i) => ({ key: `blank-start-${i}`, day: null })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ key: `day-${i + 1}`, day: i + 1 })),
  ];
  while (cells.length < 42) {
    cells.push({ key: `blank-end-${cells.length}`, day: null });
  }

  return (
    <View style={[styles.grid, { gap: tileGap }]}>
      {cells.map(({ key, day }) => {
        const cellSize = { width: tileSize, height: tileSize };

        if (day === null) return <View key={key} style={cellSize} />;

        const dayData = dayMap.get(day);
        const colors = dayData?.entries ?? [];

        if (hideEmpty && colors.length === 0) return <View key={key} style={cellSize} />;

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
  );
});

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
