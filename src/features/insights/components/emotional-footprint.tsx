import { Canvas, Circle, Group, LinearGradient, vec } from '@shopify/react-native-skia';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { InsightEntry } from '@/src/features/insights/types';

type Props = { entries: InsightEntry[] };

const CLUSTER_POSITIONS = [
  { cx: 160, cy: 130 }, // Center
  { cx: 230, cy: 80 }, // Top Right
  { cx: 90, cy: 180 }, // Bottom Left
  { cx: 230, cy: 190 }, // Bottom Right
  { cx: 80, cy: 75 }, // Top Left
];

export function EmotionalFootprint({ entries }: Props) {
  const { theme } = useUnistyles();

  const bubbles = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;

    for (const entry of entries) {
      for (const color of entry.emotions) {
        counts[color] = (counts[color] || 0) + 1;
        total++;
      }
    }

    if (total === 0) return [];

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sorted.map(([color, count], index) => {
      const percentage = count / total;
      const radius = Math.max(40, Math.min(100, percentage * 160));
      const pctString = `${Math.round(percentage * 100)}%`;

      return {
        color,
        r: radius,
        pctString,
        ...CLUSTER_POSITIONS[index],
      };
    });
  }, [entries]);

  if (bubbles.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Footprint</Text>

      <Pressable
        onPress={() => router.push('/insights/footprint' as any)}
        style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.9 }]}
      >
        {/* The Exact Size Box: This guarantees the Canvas and Text overlays perfectly align */}
        <View style={styles.canvasBox}>
          <Canvas style={styles.canvas}>
            {bubbles.map((bubble, i) => (
              <Group key={`group-${bubble.color}-${i}`}>
                {/* 1. The Solid Base: 100% opaque, rich vibrant color */}
                <Circle cx={bubble.cx} cy={bubble.cy} r={bubble.r} color={bubble.color} />

                {/* 2. The Gradient Sheen: Adds a subtle light-to-dark gradient over the solid color */}
                <Circle cx={bubble.cx} cy={bubble.cy} r={bubble.r}>
                  <LinearGradient
                    start={vec(bubble.cx - bubble.r, bubble.cy - bubble.r)}
                    end={vec(bubble.cx + bubble.r, bubble.cy + bubble.r)}
                    colors={['rgba(255,255,255,0.25)', 'rgba(0,0,0,0.1)']}
                  />
                </Circle>
              </Group>
            ))}
          </Canvas>

          {/* Absolute Overlays locked exactly to the Canvas dimensions */}
          {bubbles.map((bubble, i) => (
            <View
              key={`text-${bubble.color}-${i}`}
              style={[
                styles.pctOverlay,
                {
                  left: bubble.cx - bubble.r,
                  top: bubble.cy - bubble.r,
                  width: bubble.r * 2,
                  height: bubble.r * 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.pctText,
                  { fontSize: Math.max(14, bubble.r * 0.35), color: theme.colors.background },
                ]}
              >
                {bubble.pctString}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </View>
  );
}

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
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  canvasBox: {
    width: 320,
    height: 260,
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  pctOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
}));
