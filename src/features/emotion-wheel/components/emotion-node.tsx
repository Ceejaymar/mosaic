import { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { WHEEL } from '../constants';
import { clamp, gaussian01, smoothStep } from '../layout/wheel-math';
import type { NodeLayout } from '../types';

function fontForRow(rowIndex: number) {
  if (rowIndex === 0) return 16;
  if (rowIndex === 1) return 13;
  if (rowIndex === 2) return 12;
  return 11;
}

function linesForRow(rowIndex: number) {
  if (rowIndex >= 3) return 1;
  return 2;
}

export const EmotionNode = memo(function EmotionNode(props: {
  node: NodeLayout;
  index: number;
  centerX: number;
  centerY: number;
  fieldTx: SharedValue<number>;
  fieldTy: SharedValue<number>;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  isTouching: SharedValue<number>;
  focusedIndex: SharedValue<number>;
}) {
  const {
    node,
    index,
    centerX,
    centerY,
    fieldTx,
    fieldTy,
    touchX,
    touchY,
    isTouching,
    focusedIndex,
  } = props;

  const size = node.size;
  const r = size / 2;

  const style = useAnimatedStyle(() => {
    const bx = fieldTx.value + node.x0;
    const by = fieldTy.value + node.y0;

    // Focus field relative to screen center
    const cdx = bx - centerX;
    const cdy = by - centerY;
    const cDist = Math.sqrt(cdx * cdx + cdy * cdy);

    const focusT = clamp(cDist / WHEEL.focusRadius, 0, 1);
    const focus = gaussian01(focusT);
    const focusScale = 1 + focus * WHEEL.focusMaxBoost;

    const neighbor = gaussian01(clamp(cDist / (WHEEL.focusRadius * 1.55), 0, 1));
    const neighborScale = 1 + neighbor * WHEEL.focusNeighborBoost;

    // Finger magnet (subtle)
    const fdx = touchX.value - bx;
    const fdy = touchY.value - by;
    const fDist = Math.sqrt(fdx * fdx + fdy * fdy);

    const raw = clamp(1 - fDist / WHEEL.fingerInfluenceRadius, 0, 1);
    const fingerEase = smoothStep(raw) * isTouching.value;

    const ox = clamp(
      fdx * fingerEase * WHEEL.fingerStrength,
      -WHEEL.fingerMaxOffset,
      WHEEL.fingerMaxOffset,
    );
    const oy = clamp(
      fdy * fingerEase * WHEEL.fingerStrength,
      -WHEEL.fingerMaxOffset,
      WHEEL.fingerMaxOffset,
    );

    const fingerScale = 1 + fingerEase * WHEEL.fingerScaleBoost;

    // ✅ focused = nearest to center (drives the “big” bubble)
    const isFocused = focusedIndex.value === index ? 1 : 0;
    const focusedScale = 1 + isFocused * 0.14;

    const lift = focus * WHEEL.focusLift;

    const scale = focusScale * neighborScale * fingerScale * focusedScale;

    return {
      position: 'absolute',
      left: node.x0 - r,
      top: node.y0 - r,
      width: size,
      height: size,
      transform: [{ translateX: ox }, { translateY: oy + lift }, { scale }],
      zIndex: Math.round(focus * 2000 + isFocused * 4000 + fingerEase * 500),
    };
  });

  return (
    <Animated.View style={style} pointerEvents="none">
      <View style={[styles.nodeContainer, { backgroundColor: node.color }]}>
        <Text
          numberOfLines={linesForRow(node.rowIndex)}
          style={[styles.label, { fontSize: fontForRow(node.rowIndex) }]}
        >
          {node.label}
        </Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  nodeContainer: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  label: {
    color: 'rgba(0,0,0,0.88)',
    textAlign: 'center',
  },
});
