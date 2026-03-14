import { useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import type { InsightEntry, TimeFrame } from '@/src/features/insights/types';

type Props = { entries: InsightEntry[]; timeFrame: TimeFrame };

type FeelingRow = { name: string; color: string; count: number };

export function TopFeelings({ entries, timeFrame }: Props) {
  const rows = useMemo<FeelingRow[]>(() => {
    const counts: Record<string, { color: string; count: number }> = {};

    for (const entry of entries) {
      const { name, color } = entry.specificMood;
      if (!counts[name]) counts[name] = { color, count: 0 };
      counts[name].count += 1;
    }

    const limit = timeFrame === 'week' ? 5 : 10;

    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([name, { color, count }]) => ({ name, color, count }));
  }, [entries, timeFrame]);

  if (rows.length === 0) return null;

  const maxCount = rows[0].count;

  return (
    <View style={styles.container}>
      <AppText font="heading" variant="xl" colorVariant="primary" style={styles.title}>
        The emotions you felt most often
      </AppText>

      <View style={styles.list}>
        {rows.map((row) => (
          <View key={row.name} style={styles.row}>
            {/* Left: dot + name */}
            <View style={styles.rowLeft}>
              <View style={[styles.dot, { backgroundColor: row.color }]} />
              <AppText colorVariant="primary" style={styles.feelingName} numberOfLines={1}>
                {row.name}
              </AppText>
            </View>

            {/* Right: proportional pill bar */}
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.pill,
                  {
                    width: `${Math.round((row.count / maxCount) * 100)}%`,
                    backgroundColor: row.color,
                  },
                ]}
              >
                <AppText font="mono" variant="xs" style={styles.pillCount}>
                  {row.count}
                </AppText>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[10],
  },
  title: {
    fontWeight: '700',
    marginBottom: theme.spacing[4],
  },
  list: {
    gap: theme.spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 140,
    gap: theme.spacing[2],
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  feelingName: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
  },
  pill: {
    height: 28,
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing[2],
    minWidth: 28,
  },
  pillCount: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
}));
