import { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { WHEEL } from '../constants';
import { clamp, gaussian01, smoothStep } from '../layout/wheel-math';
import type { NodeLayout } from '../types';

function sizeForLevel(level: 0 | 1 | 2) {
  if (level === 0) return WHEEL.sizeL0;
  if (level === 1) return WHEEL.sizeL1;
  return WHEEL.sizeL2;
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
  selectedIndex: SharedValue<number>;
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
    selectedIndex,
  } = props;

  const size = sizeForLevel(node.level);
  const r = size / 2;

  const style = useAnimatedStyle(() => {
    // Node position in SCREEN coords (field translation affects it)
    // Even though the container translates visually, we still use fieldTx/fieldTy here
    // so the math matches what the user sees.
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

    const isSelected = selectedIndex.value === index ? 1 : 0;
    const selectedScale = 1 + isSelected * 0.1;

    const lift = focus * WHEEL.focusLift;

    const scale = focusScale * neighborScale * fingerScale * selectedScale;

    return {
      position: 'absolute',
      left: node.x0 - r, // NOTE: this is inside the translated container
      top: node.y0 - r,
      width: size,
      height: size,
      transform: [{ translateX: ox }, { translateY: oy + lift }, { scale }],
      zIndex: Math.round(focus * 2000 + isSelected * 3000 + fingerEase * 500),
    };
  });

  return (
    <Animated.View style={style} pointerEvents="none">
      <View
        style={{
          flex: 1,
          borderRadius: 999,
          backgroundColor: node.color,
          borderWidth: 2,
          borderColor: 'rgba(0,0,0,0.20)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 10,
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            fontSize: node.level === 0 ? 16 : node.level === 1 ? 13 : 11,
            color: 'rgba(0,0,0,0.88)',
            textAlign: 'center',
          }}
        >
          {node.label}
        </Text>
      </View>
    </Animated.View>
  );
});
