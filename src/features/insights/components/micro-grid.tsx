import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { InsightEntry } from '@/src/features/insights/types';

type Props = { entries: InsightEntry[] };

const DOW_CONFIG = [
  { id: 'sun', label: 'S', dayIndex: 0 },
  { id: 'mon', label: 'M', dayIndex: 1 },
  { id: 'tue', label: 'T', dayIndex: 2 },
  { id: 'wed', label: 'W', dayIndex: 3 },
  { id: 'thu', label: 'T', dayIndex: 4 },
  { id: 'fri', label: 'F', dayIndex: 5 },
  { id: 'sat', label: 'S', dayIndex: 6 },
];

export function MicroGrid({ entries }: Props) {
  const { theme } = useUnistyles();

  const days = useMemo(() => {
    const dayColors: Record<string, string[]> = {};

    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    if (sortedEntries.length === 0) return {};

    // FIX: Parse into separate variables to avoid constructor overload error
    const firstParts = sortedEntries[0].date.split('-').map(Number);
    // JS Months are 0-indexed (Jan = 0)
    const firstDate = new Date(firstParts[0], firstParts[1] - 1, firstParts[2]);

    // Normalize baseline to the start of its week (Sunday)
    firstDate.setDate(firstDate.getDate() - firstDate.getDay());

    for (const entry of entries) {
      const [y, m, d] = entry.date.split('-').map(Number);
      // FIX: Construct local date to avoid UTC timezone shifting check-ins to the previous day
      const date = new Date(y, m - 1, d);

      const diffInDays = Math.floor((date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffInDays / 7);
      const dow = date.getDay();

      const key = `${weekIndex}-${dow}`;

      if (!dayColors[key]) dayColors[key] = [];

      const uniqueColors = Array.from(new Set(entry.emotions));
      dayColors[key] = Array.from(new Set([...dayColors[key], ...uniqueColors])).slice(0, 4);
    }
    return dayColors;
  }, [entries]);

  const renderMiniTile = (colors: string[]) => {
    if (colors.length === 0)
      return <View style={[styles.tile, { backgroundColor: theme.colors.surface }]} />;
    if (colors.length === 1) return <View style={[styles.tile, { backgroundColor: colors[0] }]} />;
    if (colors.length === 2)
      return (
        <View style={styles.tile}>
          <View style={[styles.halfL, { backgroundColor: colors[0] }]} />
          <View style={[styles.halfR, { backgroundColor: colors[1] }]} />
        </View>
      );
    if (colors.length === 3)
      return (
        <View style={styles.tile}>
          <View style={[styles.quadTL, { backgroundColor: colors[0] }]} />
          <View style={[styles.quadTR, { backgroundColor: colors[1] }]} />
          <View style={[styles.halfB, { backgroundColor: colors[2] }]} />
        </View>
      );
    return (
      <View style={styles.tile}>
        <View style={[styles.quadTL, { backgroundColor: colors[0] }]} />
        <View style={[styles.quadTR, { backgroundColor: colors[1] }]} />
        <View style={[styles.quadBL, { backgroundColor: colors[2] }]} />
        <View style={[styles.quadBR, { backgroundColor: colors[3] }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Week</Text>
      <View style={styles.grid}>
        {DOW_CONFIG.map(({ id, label, dayIndex }) => {
          // Identify the most recent entry for this specific day of the week
          const keys = Object.keys(days).filter((k) => k.endsWith(`-${dayIndex}`));
          const latestKey = keys.sort((a, b) => {
            const weekA = parseInt(a.split('-')[0], 10);
            const weekB = parseInt(b.split('-')[0], 10);
            return weekB - weekA;
          })[0];

          return (
            <View key={id} style={styles.col}>
              <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
              {renderMiniTile(latestKey ? days[latestKey] : [])}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const SIZE = 16;
const HALF = SIZE / 2;

const styles = StyleSheet.create((theme) => ({
  container: { paddingHorizontal: 24, marginBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  grid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  col: { alignItems: 'center', gap: 8 },
  label: { fontSize: 11, fontWeight: '600', fontFamily: 'SpaceMono' },
  tile: { width: SIZE, height: SIZE, borderRadius: 4, overflow: 'hidden' },
  halfL: { position: 'absolute', top: 0, bottom: 0, left: 0, width: HALF },
  halfR: { position: 'absolute', top: 0, bottom: 0, right: 0, width: HALF },
  halfB: { position: 'absolute', bottom: 0, left: 0, right: 0, height: HALF },
  quadTL: { position: 'absolute', top: 0, left: 0, width: HALF, height: HALF },
  quadTR: { position: 'absolute', top: 0, right: 0, width: HALF, height: HALF },
  quadBL: { position: 'absolute', bottom: 0, left: 0, width: HALF, height: HALF },
  quadBR: { position: 'absolute', bottom: 0, right: 0, width: HALF, height: HALF },
}));
