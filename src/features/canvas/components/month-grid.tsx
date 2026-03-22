import { memo } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { MAX_BACKDATE_DAYS } from '@/src/constants/config';
import { dateToKey } from '@/src/db/repos/moodRepo';
import { isPastBackdateLimit } from '@/src/features/canvas/utils/date-utils';
import { useAppStore } from '@/src/store/useApp';
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
  const firstDayOfWeek = useAppStore((s) => s.preferences.firstDayOfWeek);
  const jsDow = new Date(year, month, 1).getDay();
  const firstDow = firstDayOfWeek === 'monday' ? (jsDow === 0 ? 6 : jsDow - 1) : jsDow;
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
        const isTooOld = isEmptyPast && isPastBackdateLimit(dateKey);
        const canLogHistorical = isEmptyPast && !isTooOld && !!onEmptyDayPress;
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
                  'Cannot Log Emotion',
                  `You cannot log new entries older than ${MAX_BACKDATE_DAYS} days.`,
                );
            }}
            style={({ pressed }) => [
              cellSize,
              isFuture && { opacity: 0.35 },
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
