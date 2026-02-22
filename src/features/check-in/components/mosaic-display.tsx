import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { formatTime } from '@/src/features/check-in/utils/format-time';

const GAP = 4;
const CONTAINER_RADIUS = 20;
const TILE_RADIUS = 4;

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
  return (
    <View style={[styles.tile, { backgroundColor: color }, style]}>
      <View style={styles.scrim} />
      <Text style={styles.tileLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.tileTime}>{formatTime(occurredAt)}</Text>
    </View>
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
  const cappedTiles = tiles.slice(0, 4);
  const count = cappedTiles.length;

  if (count === 0) {
    return (
      <Pressable
        onPress={onAddPress}
        style={({ pressed }) => [styles.emptyContainer, pressed && { opacity: 0.82 }]}
        accessibilityRole="button"
        accessibilityLabel="Check in"
      >
        <View style={styles.plusCircle}>
          <Text style={styles.plusIcon}>+</Text>
        </View>
        <Text style={styles.emptyHint}>Tap to check in</Text>
      </Pressable>
    );
  }

  return <View style={styles.container}>{renderGrid(cappedTiles, onTilePress)}</View>;
}

const styles = StyleSheet.create((theme) => ({
  emptyContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: CONTAINER_RADIUS,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  plusCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: { fontSize: 32, color: theme.colors.mosaicGold, lineHeight: 40 },
  emptyHint: { fontSize: 14, color: theme.colors.textMuted },
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: CONTAINER_RADIUS,
    overflow: 'hidden',
    gap: GAP,
  },
  row: { flexDirection: 'row', gap: GAP },
  flex1: { flex: 1 },
  tile: { borderRadius: TILE_RADIUS, justifyContent: 'flex-end', padding: 16, overflow: 'hidden' },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  tileLabel: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: '#fff',
    letterSpacing: -0.54,
  },
  tileTime: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
}));
