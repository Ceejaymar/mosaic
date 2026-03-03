import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Text, View } from 'react-native';
import FastSquircleView from 'react-native-fast-squircle';
import { useUnistyles } from 'react-native-unistyles';

const CORNER_SMOOTHING = 0.8;
const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/** Semi-transparent gradient overlay for depth on each color segment */
const SEGMENT_OVERLAY: readonly [string, string] = ['rgba(255,255,255,0.12)', 'rgba(0,0,0,0.10)'];

type Props = {
  colors: string[]; // 0–4 hex colors
  day?: number; // date number to show; omit to hide label
  size: number;
};

function ColorSegments({ colors, size }: { colors: string[]; size: number }) {
  const half = size / 2;

  if (colors.length === 0) return null;

  if (colors.length === 1) {
    return (
      <>
        <View style={[FILL, { backgroundColor: colors[0] }]} />
        <LinearGradient colors={SEGMENT_OVERLAY} style={FILL} />
      </>
    );
  }

  if (colors.length === 2) {
    return (
      <>
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: half,
            backgroundColor: colors[0],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: half,
            right: 0,
            backgroundColor: colors[1],
          }}
        />
        <LinearGradient colors={SEGMENT_OVERLAY} style={FILL} />
      </>
    );
  }

  if (colors.length === 3) {
    return (
      <>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: half,
            height: half,
            backgroundColor: colors[0],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: half,
            right: 0,
            height: half,
            backgroundColor: colors[1],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: half,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors[2],
          }}
        />
        <LinearGradient colors={SEGMENT_OVERLAY} style={FILL} />
      </>
    );
  }

  // 4 colors: quadrants
  return (
    <>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: half,
          height: half,
          backgroundColor: colors[0],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: half,
          right: 0,
          height: half,
          backgroundColor: colors[1],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: half,
          left: 0,
          width: half,
          bottom: 0,
          backgroundColor: colors[2],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: half,
          left: half,
          right: 0,
          bottom: 0,
          backgroundColor: colors[3],
        }}
      />
      <LinearGradient colors={SEGMENT_OVERLAY} style={FILL} />
    </>
  );
}

export const DayTile = memo(function DayTile({ colors, day, size }: Props) {
  const { theme } = useUnistyles();
  const showDate = day !== undefined && colors.length < 3;
  const bg = colors.length === 0 ? theme.colors.surface : 'transparent';

  return (
    <FastSquircleView
      cornerSmoothing={CORNER_SMOOTHING}
      style={{ width: size, height: size, backgroundColor: bg, overflow: 'hidden' }}
    >
      <ColorSegments colors={colors} size={size} />
      {showDate && (
        <Text
          allowFontScaling={false}
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            fontSize: Math.max(6, Math.round(size * 0.18)),
            color: theme.colors.typography,
          }}
        >
          {day}
        </Text>
      )}
    </FastSquircleView>
  );
});
