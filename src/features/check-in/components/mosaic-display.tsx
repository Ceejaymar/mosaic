import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { Surface } from '@/src/components/surface';
import { formatTime } from '@/src/features/check-in/utils/format-time';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { isLightColor } from '@/src/utils/color-ui';

const GAP = 4;

// White sheen top-left → transparent center → dark shadow bottom-right over mood color = glass
const TILE_SHIMMER = ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.15)'] as const;

export type MosaicTileData = {
  id: string;
  color: string;
  label: string;
  occurredAt: string;
};

type Props = {
  tiles: MosaicTileData[];
  /** Called when the empty-state container is tapped (open a new check-in). */
  onAddPress: () => void;
  /** Called when an individual filled tile is tapped (open edit for that entry). */
  onTilePress: (tile: MosaicTileData) => void;
};

type TileProps = {
  color: string;
  label: string;
  occurredAt: string;
  style?: StyleProp<ViewStyle>;
};

function Tile({ color, label, occurredAt, style }: TileProps) {
  const light = isLightColor(color);
  const textColor = light ? '#000000' : '#ffffff';
  const timeColor = light ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.65)';

  return (
    <Surface
      variant="card"
      bordered={false}
      surfaceGradientColors={TILE_SHIMMER}
      style={[styles.tile, { backgroundColor: color }, style]}
    >
      <View style={styles.scrim} />
      <AppText font="heading" style={[styles.tileLabel, { color: textColor }]} numberOfLines={1}>
        {label}
      </AppText>
      <AppText style={[styles.tileTime, { color: timeColor }]}>{formatTime(occurredAt)}</AppText>
    </Surface>
  );
}

function TileItem({ tile, onPress }: { tile: MosaicTileData; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.flex1, pressed && { opacity: 0.82 }]}
      accessibilityRole="button"
      accessibilityLabel={`${tile.label} at ${formatTime(tile.occurredAt)}, tap to edit`}
    >
      <Tile
        color={tile.color}
        label={tile.label}
        occurredAt={tile.occurredAt}
        style={styles.flex1}
      />
    </Pressable>
  );
}

function renderGrid(tiles: MosaicTileData[], onTilePress: (tile: MosaicTileData) => void) {
  if (tiles.length === 1) {
    return <TileItem tile={tiles[0]} onPress={() => onTilePress(tiles[0])} />;
  }

  if (tiles.length === 3) {
    return (
      <>
        <View style={[styles.row, styles.flex1]}>
          {tiles.slice(0, 2).map((tile) => (
            <TileItem key={tile.id} tile={tile} onPress={() => onTilePress(tile)} />
          ))}
        </View>
        <TileItem tile={tiles[2]} onPress={() => onTilePress(tiles[2])} />
      </>
    );
  }

  // 2 tiles: one row; 4 tiles: two rows
  const rows = tiles.length === 2 ? [tiles] : [tiles.slice(0, 2), tiles.slice(2)];
  return (
    <>
      {rows
        .filter((row) => row.length > 0)
        .map((row) => (
          <View key={row[0].id} style={[styles.row, styles.flex1]}>
            {row.map((tile) => (
              <TileItem key={tile.id} tile={tile} onPress={() => onTilePress(tile)} />
            ))}
          </View>
        ))}
    </>
  );
}

export function MosaicDisplay({ tiles, onAddPress, onTilePress }: Props) {
  const colors = useAccessibleColors();
  const cappedTiles = tiles.slice(0, 4);
  const count = cappedTiles.length;

  if (count === 0) {
    return (
      <Pressable
        onPress={onAddPress}
        style={({ pressed }) => [styles.emptyPressable, pressed && { opacity: 0.82 }]}
        accessibilityRole="button"
        accessibilityLabel="Check in"
      >
        <Surface variant="card" style={styles.emptyContainer}>
          <View style={[styles.plusCircle, { backgroundColor: colors.divider }]}>
            <AppText style={styles.plusIcon}>+</AppText>
          </View>
          <AppText colorVariant="muted" style={styles.emptyHint}>
            Tap to check in
          </AppText>
        </Surface>
      </Pressable>
    );
  }

  return <View style={styles.container}>{renderGrid(cappedTiles, onTilePress)}</View>;
}

const styles = StyleSheet.create((theme) => ({
  emptyPressable: {
    width: '100%',
    aspectRatio: 1,
  },
  emptyContainer: {
    flex: 1,
    borderRadius: theme.radius.sheet,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[3],
  },
  plusCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: { fontSize: 32, color: theme.colors.mosaicGold, lineHeight: 40 },
  emptyHint: { fontSize: 14 },
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.radius.sheet,
    overflow: 'hidden',
    gap: GAP,
  },
  row: { flexDirection: 'row', gap: GAP },
  flex1: { flex: 1 },
  tile: {
    borderRadius: theme.radius.tight,
    justifyContent: 'flex-end',
    padding: theme.spacing[4],
    overflow: 'hidden',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlayDark,
  },
  tileLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.54,
  },
  tileTime: { fontSize: 12, fontWeight: '700', marginTop: theme.spacing[1] },
}));
