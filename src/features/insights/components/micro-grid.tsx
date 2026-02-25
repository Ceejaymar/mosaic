import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { InsightEntry } from '@/src/features/insights/types';

type Props = { entries: InsightEntry[] };

// Replaced simple array with explicit IDs and day indexes for stable mapping
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
    // Map entries to days of the week (0-6).
    // In a real implementation, you'd match exact dates. Here we mock it by grouping.
    const dayColors: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    for (const entry of entries) {
      // 1. Split the string 'YYYY-MM-DD' into an array of numbers
      const [year, month, day] = entry.date.split('-').map(Number);

      // 2. Construct a local date (Month is 0-indexed in JS, so we do month - 1)
      const date = new Date(year, month - 1, day);

      const dow = date.getDay(); // Now accurately reflects your local timezone!

      if (!Number.isNaN(dow)) {
        const uniqueColors = Array.from(new Set(entry.emotions));
        dayColors[dow] = Array.from(new Set([...dayColors[dow], ...uniqueColors])).slice(0, 4);
      }
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
        {DOW_CONFIG.map(({ id, label, dayIndex }) => (
          <View key={id} style={styles.col}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
            {renderMiniTile(days[dayIndex] || [])}
          </View>
        ))}
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
