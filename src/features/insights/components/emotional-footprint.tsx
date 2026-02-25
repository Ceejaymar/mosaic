import { Canvas, Circle, Group, LinearGradient, vec } from '@shopify/react-native-skia';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
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
  const { width: screenWidth } = useWindowDimensions();
  const CANVAS_W = screenWidth - 48; // account for paddingHorizontal: 24 × 2
  const CANVAS_H = Math.round(CANVAS_W * (260 / 320));
  const scale = CANVAS_W / 320;

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
        <View style={[styles.canvasBox, { width: CANVAS_W, height: CANVAS_H }]}>
          <Canvas style={[styles.canvas, { width: CANVAS_W, height: CANVAS_H }]}>
            {bubbles.map((bubble, i) => {
              const cx = bubble.cx * scale;
              const cy = bubble.cy * scale;
              const r = bubble.r * scale;
              return (
                <Group key={`group-${bubble.color}-${i}`}>
                  {/* 1. The Solid Base: 100% opaque, rich vibrant color */}
                  <Circle cx={cx} cy={cy} r={r} color={bubble.color} />

                  {/* 2. The Gradient Sheen: Adds a subtle light-to-dark gradient over the solid color */}
                  <Circle cx={cx} cy={cy} r={r}>
                    <LinearGradient
                      start={vec(cx - r, cy - r)}
                      end={vec(cx + r, cy + r)}
                      colors={['rgba(255,255,255,0.25)', 'rgba(0,0,0,0.1)']}
                    />
                  </Circle>
                </Group>
              );
            })}
          </Canvas>

          {/* Absolute Overlays locked exactly to the Canvas dimensions */}
          {bubbles.map((bubble, i) => {
            const cx = bubble.cx * scale;
            const cy = bubble.cy * scale;
            const r = bubble.r * scale;
            return (
              <View
                key={`text-${bubble.color}-${i}`}
                style={[
                  styles.pctOverlay,
                  {
                    left: cx - r,
                    top: cy - r,
                    width: r * 2,
                    height: r * 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pctText,
                    { fontSize: Math.max(14, r * 0.35), color: theme.colors.background },
                  ]}
                >
                  {bubble.pctString}
                </Text>
              </View>
            );
          })}
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
    position: 'relative',
  },
  canvas: {},
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
