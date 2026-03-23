import { useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { Surface } from '@/src/components/surface';
import type { InsightEntry } from '@/src/features/insights/types';

type Props = { entries: InsightEntry[] };

type Item = { color: string; pct: number };
type LayoutItem = Item & { area: number };
type Block = Item & { x: number; y: number; w: number; h: number };
type Bounds = { x: number; y: number; w: number; h: number };

/**
 * Worst-case aspect ratio for a row of area values.
 * Uses the LONG side of the remaining bounds (per Bruls et al. squarify paper).
 */
function worstRatio(areas: number[], longSide: number): number {
  if (areas.length === 0) return Infinity;
  const s = areas.reduce((sum, a) => sum + a, 0);
  const rMax = Math.max(...areas);
  const rMin = Math.min(...areas);
  return Math.max((longSide * longSide * rMax) / (s * s), (s * s) / (longSide * longSide * rMin));
}

/** Place a committed row of items as absolute blocks within the given bounds. */
function layoutRow(row: LayoutItem[], bounds: Bounds): Block[] {
  const { x, y, w, h } = bounds;
  const rowArea = row.reduce((s, i) => s + i.area, 0);
  const blocks: Block[] = [];

  if (w >= h) {
    // Horizontal strip: spans full width, items stack left-to-right
    const stripH = rowArea / w;
    let cursor = 0;
    for (const item of row) {
      const itemW = item.area / stripH;
      blocks.push({ color: item.color, pct: item.pct, x: x + cursor, y, w: itemW, h: stripH });
      cursor += itemW;
    }
  } else {
    // Vertical strip: spans full height, items stack top-to-bottom
    const stripW = rowArea / h;
    let cursor = 0;
    for (const item of row) {
      const itemH = item.area / stripW;
      blocks.push({ color: item.color, pct: item.pct, x, y: y + cursor, w: stripW, h: itemH });
      cursor += itemH;
    }
  }

  return blocks;
}

/** Shrink the bounds past the just-committed row. */
function advanceBounds(rowArea: number, bounds: Bounds): Bounds {
  const { x, y, w, h } = bounds;
  if (w >= h) {
    const stripH = rowArea / w;
    return { x, y: y + stripH, w, h: h - stripH };
  }
  const stripW = rowArea / h;
  return { x: x + stripW, y, w: w - stripW, h };
}

/**
 * Squarified treemap (Bruls, Huizing, van Wijk).
 * Items must be pre-sorted largest-to-smallest by pct.
 * Outputs blocks with x/y/w/h in 0–100 percentage space.
 */
function squarify(items: Item[]): Block[] {
  if (items.length === 0) return [];

  // Re-normalize so pcts sum to 1, then scale to 100×100 area space
  const pctTotal = items.reduce((s, i) => s + i.pct, 0);
  const totalArea = 100 * 100;
  const normalized: LayoutItem[] = items.map((i) => ({
    color: i.color,
    pct: i.pct / pctTotal,
    area: (i.pct / pctTotal) * totalArea,
  }));

  let bounds: Bounds = { x: 0, y: 0, w: 100, h: 100 };
  let row: LayoutItem[] = [];
  const allBlocks: Block[] = [];

  for (const item of normalized) {
    if (row.length === 0) {
      row.push(item);
      continue;
    }

    const longSide = Math.max(bounds.w, bounds.h);
    const rowAreas = row.map((i) => i.area);
    const currentWorst = worstRatio(rowAreas, longSide);
    const candidateWorst = worstRatio([...rowAreas, item.area], longSide);

    if (candidateWorst <= currentWorst) {
      // Adding this item improves (or maintains) aspect ratios — keep building the row
      row.push(item);
    } else {
      // Adding would make things worse — commit the current row and start fresh
      const rowArea = row.reduce((s, i) => s + i.area, 0);
      allBlocks.push(...layoutRow(row, bounds));
      bounds = advanceBounds(rowArea, bounds);
      row = [item];
    }
  }

  if (row.length > 0) {
    allBlocks.push(...layoutRow(row, bounds));
  }

  return allBlocks;
}

export function HeroMosaic({ entries }: Props) {
  const blocks = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;

    for (const entry of entries) {
      for (const color of entry.coreEmotions) {
        counts[color] = (counts[color] || 0) + 1;
        total++;
      }
    }

    if (total === 0) return [];

    // Sort largest-to-smallest — squarify requires this ordering to work correctly
    const items = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([color, count]) => ({ color, pct: count / total }));

    return squarify(items);
  }, [entries]);

  if (blocks.length === 0) return null;

  return (
    <View style={styles.container}>
      <AppText font="heading" variant="xl" colorVariant="primary" style={styles.title}>
        Mood distribution
      </AppText>
      <Surface variant="card">
        <View style={styles.mosaic}>
          {blocks.map((block, i) => (
            <View
              key={`${block.color}-${i}`}
              style={[
                styles.block,
                {
                  backgroundColor: block.color,
                  left: `${block.x}%`,
                  top: `${block.y}%`,
                  width: `${block.w}%`,
                  height: `${block.h}%`,
                },
              ]}
            >
              {block.pct >= 0.05 && (
                <AppText font="mono" variant="sm" style={styles.pctLabel}>
                  {`${Math.round(block.pct * 100)}%`}
                </AppText>
              )}
            </View>
          ))}
        </View>
      </Surface>
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
  mosaic: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  block: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
}));
