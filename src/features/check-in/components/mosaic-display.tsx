import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const GAP = 2;
const CONTAINER_RADIUS = 20;
const TILE_RADIUS = 4;

export type MosaicTileData = {
  id: string;
  color: string;
  label: string;
  occurredAt: string;
};

type Props = {
  tiles: MosaicTileData[]; // max 4
  onPress: () => void;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

type TileProps = MosaicTileData & { style?: object };

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

export function MosaicDisplay({ tiles, onPress }: Props) {
  const count = tiles.length;
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
      {count === 1 && <Tile {...tiles[0]} style={styles.flex1} />}

      {count === 2 && (
        <View style={styles.row}>
          <Tile {...tiles[0]} style={styles.flex1} />
          <Tile {...tiles[1]} style={styles.flex1} />
        </View>
      )}

      {count === 3 && (
        <>
          <View style={[styles.row, styles.flex1]}>
            <Tile {...tiles[0]} style={styles.flex1} />
            <Tile {...tiles[1]} style={styles.flex1} />
          </View>
          <Tile {...tiles[2]} style={styles.flex1} />
        </>
      )}

      {count === 4 && (
        <>
          <View style={[styles.row, styles.flex1]}>
            <Tile {...tiles[0]} style={styles.flex1} />
            <Tile {...tiles[1]} style={styles.flex1} />
          </View>
          <View style={[styles.row, styles.flex1]}>
            <Tile {...tiles[2]} style={styles.flex1} />
            <Tile {...tiles[3]} style={styles.flex1} />
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => {
  const isDark = theme.colors.background !== '#ffffff';
  return {
    emptyContainer: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
      borderRadius: CONTAINER_RADIUS,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    plusCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
      alignItems: 'center',
      justifyContent: 'center',
    },
    plusIcon: {
      fontSize: 32,
      color: '#E0C097',
      lineHeight: 38,
    },
    emptyHint: {
      fontSize: 14,
      color: '#8E8E93',
    },
    container: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: CONTAINER_RADIUS,
      overflow: 'hidden',
      gap: GAP,
    },
    row: {
      flexDirection: 'row',
      gap: GAP,
    },
    flex1: {
      flex: 1,
    },
    tile: {
      borderRadius: TILE_RADIUS,
      justifyContent: 'flex-end',
      padding: 14,
      overflow: 'hidden',
    },
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
    },
    tileTime: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.65)',
      marginTop: 2,
    },
  };
});
