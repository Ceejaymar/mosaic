import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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
  onPress: () => void;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

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

function TileItem({ t }: { t: MosaicTileData }) {
  return <Tile color={t.color} label={t.label} occurredAt={t.occurredAt} style={styles.flex1} />;
}

function renderGrid(tiles: MosaicTileData[]) {
  if (tiles.length === 1) {
    return <TileItem t={tiles[0]} />;
  }

  if (tiles.length === 3) {
    return (
      <>
        <View style={[styles.row, styles.flex1]}>
          {tiles.slice(0, 2).map((t) => (
            <TileItem key={t.id} t={t} />
          ))}
        </View>
        <TileItem t={tiles[2]} />
      </>
    );
  }

  // 2 tiles: one row; 4 tiles: two rows
  const rows = tiles.length === 2 ? [tiles] : [tiles.slice(0, 2), tiles.slice(2)];
  return (
    <>
      {rows.map((row) => (
        <View key={row[0].id} style={[styles.row, styles.flex1]}>
          {row.map((t) => (
            <TileItem key={t.id} t={t} />
          ))}
        </View>
      ))}
    </>
  );
}

export function MosaicDisplay({ tiles, onPress }: Props) {
  const cappedTiles = tiles.slice(0, 4);
  const count = cappedTiles.length;
  const canAdd = count < 4;

  if (count === 0) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.emptyContainer, pressed && { opacity: 0.8 }]}
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

  return (
    <Pressable
      onPress={canAdd ? onPress : undefined}
      style={({ pressed }) => [styles.container, pressed && canAdd && { opacity: 0.9 }]}
      accessibilityRole={canAdd ? 'button' : 'none'}
      accessibilityLabel={canAdd ? 'Add another check-in' : 'Daily check-ins complete'}
    >
      {renderGrid(cappedTiles)}
    </Pressable>
  );
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
