import { useMemo } from 'react';
import { View } from 'react-native';
import FastSquircleView from 'react-native-fast-squircle';
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

  return (
    <View style={styles.container}>
      <AppText font="heading" variant="xl" colorVariant="primary" style={styles.title}>
        Emotions you felt most
      </AppText>

      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row.name} style={styles.tile}>
            <FastSquircleView
              cornerSmoothing={0.8}
              borderRadius={14}
              style={[styles.squircle, { backgroundColor: row.color }]}
            >
              <AppText font="heading" style={styles.countText}>
                {row.count}
              </AppText>
            </FastSquircleView>
            <AppText font="heading" style={styles.emotionName} numberOfLines={2}>
              {row.name}
            </AppText>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    minWidth: '45%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  squircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  countText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  emotionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
}));
