import { memo } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { dateToKey } from '@/src/db/repos/moodRepo';
import { isWithinThreeMonths } from '@/src/features/canvas/utils/date-utils';
import type { CanvasDay } from '../hooks/useCanvasData';
import { DayTile } from './day-tile';

type Cell = { key: string; day: number | null };

type Props = {
  month: number;
  year: number;
  data: CanvasDay[];
  tileSize: number;
  tileGap: number;
  onDayPress: (date: string) => void;
  onEmptyDayPress?: (date: string) => void;
};

export const MonthGrid = memo(function MonthGrid({
  month,
  year,
  data,
  tileSize,
  tileGap,
  onDayPress,
  onEmptyDayPress,
}: Props) {
  const todayKey = dateToKey();
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

        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateKey = `${year}-${mm}-${dd}`;
        const isFuture = dateKey > todayKey;
        const dayData = dayMap.get(day);
        const colors = dayData?.entries ?? [];
        const hasData = colors.length > 0;

        const isEmptyPast = !hasData && !isFuture;
        const withinRange = isEmptyPast ? isWithinThreeMonths(dateKey) : false;
        const canLogHistorical = isEmptyPast && withinRange && !!onEmptyDayPress;
        const isTooOld = isEmptyPast && !withinRange;
        const isInteractive = !isFuture && (hasData || canLogHistorical || isTooOld);

        return (
          <Pressable
            key={key}
            disabled={!isInteractive}
            onPress={() => {
              if (hasData && dayData) onDayPress(dayData.date);
              else if (canLogHistorical) onEmptyDayPress?.(dateKey);
              else if (isTooOld)
                Alert.alert(
                  'Too far back',
                  'You can only log check-ins up to 3 months in the past.',
                );
            }}
            style={({ pressed }) => [
              cellSize,
              isTooOld && { opacity: 0.4 },
              isInteractive && !isTooOld && pressed && { opacity: 0.7 },
            ]}
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
