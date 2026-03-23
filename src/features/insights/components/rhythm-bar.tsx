import { useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import type { InsightEntry } from '@/src/features/insights/types';

type Props = { entries: InsightEntry[] };

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'night', label: 'Night' },
] as const;

export function RhythmBar({ entries }: Props) {
  const slotData = useMemo(() => {
    // 1. Group and tally by slot
    const stats = TIME_SLOTS.map(({ id, label }) => {
      const slotEntries = entries.filter((e) => e.timeOfDay === id);

      // 2. Tally colors within this specific slot (skip entries with no color)
      const colorTally: Record<string, number> = {};
      for (const e of slotEntries) {
        const color = e.coreEmotions[0] || e.emotions[0];
        if (!color) continue;
        colorTally[color] = (colorTally[color] || 0) + 1;
      }

      // 3. Segment width is relative to THIS slot's tallied total
      const totalCount = Object.values(colorTally).reduce((a, b) => a + b, 0);
      const segments = Object.entries(colorTally)
        .map(([color, count]) => ({
          color,
          pctOfSlot: totalCount > 0 ? count / totalCount : 0,
        }))
        .sort((a, b) => b.pctOfSlot - a.pctOfSlot);

      return { id, label, totalCount, segments };
    });

    // 4. Wrapper width is relative to the GLOBAL max
    const maxCount = Math.max(...stats.map((s) => s.totalCount), 1);
    return stats.map((s) => ({ ...s, pctOfMax: s.totalCount / maxCount }));
  }, [entries]);

  return (
    <View style={styles.container}>
      <AppText font="heading" variant="xl" colorVariant="primary" style={styles.title}>
        Time of day patterns
      </AppText>

      <View style={styles.stack}>
        {slotData.map((slot) => (
          <View key={slot.id} style={styles.row}>
            <AppText font="mono" colorVariant="muted" style={styles.slotLabel}>
              {slot.label}
            </AppText>
            <View style={styles.track}>
              {slot.totalCount > 0 && (
                <View style={[styles.pillWrapper, { width: '100%' }]}>
                  {slot.segments.map((seg) => (
                    <View
                      key={seg.color}
                      style={{
                        backgroundColor: seg.color,
                        width: `${seg.pctOfSlot * 100}%`,
                        height: '100%',
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { paddingHorizontal: theme.spacing[6], marginBottom: theme.spacing[8] },
  title: {
    fontWeight: '700',
    marginBottom: theme.spacing[4],
  },
  stack: {
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  slotLabel: {
    width: 80,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  track: {
    flex: 1,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pillWrapper: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
}));
