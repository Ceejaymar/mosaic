import { memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { WHEEL } from '../constants';
import { clamp, gaussian01, smoothStep } from '../layout/wheel-math';
import type { NodeLayout } from '../types';

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
    // 1. ANCHOR POSITION (Static world coords + current pan)
    const anchorX = fieldTx.value + node.x0;
    const anchorY = fieldTy.value + node.y0;

    // 2. VECTOR FROM SCREEN CENTER
    const cdx = anchorX - centerX;
    const cdy = anchorY - centerY;
    const cDist = Math.sqrt(cdx * cdx + cdy * cdy);

    // 3. FOCUS & SCALE
    const focusT = clamp(cDist / WHEEL.focusRadius, 0, 1);
    const focus = gaussian01(focusT);
    const isFocused = focusedIndex.value === index ? 1 : 0;

    const scale = (1 + focus * WHEEL.focusMaxBoost) * (1 + isFocused * 0.12);

    // 4. RADIAL REPEL (Shake-free logic)
    const deadZone = 15;
    const repelFactor = smoothStep(clamp(cDist / deadZone, 0, 1));
    const pushStrength = focus * 35 * repelFactor;

    const unitX = cDist > 0.1 ? cdx / cDist : 0;
    const unitY = cDist > 0.1 ? cdy / cDist : 0;

    // 5. FINGER MAGNET
    const fdx = touchX.value - anchorX;
    const fdy = touchY.value - anchorY;
    const fDist = Math.sqrt(fdx * fdx + fdy * fdy);
    const fingerEase =
      smoothStep(clamp(1 - fDist / WHEEL.fingerInfluenceRadius, 0, 1)) * isTouching.value;

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

    return {
      position: 'absolute',
      left: node.x0 - r,
      top: node.y0 - r,
      width: size,
      height: size,
      transform: [
        { translateX: ox + unitX * pushStrength },
        { translateY: oy + unitY * pushStrength + focus * WHEEL.focusLift },
        { scale },
      ],
      zIndex: Math.round(focus * 2000 + isFocused * 5000),
    };
  });

  return (
    <Animated.View style={style} pointerEvents="none">
      <View style={[styles.nodeContainer, { backgroundColor: node.color }]}>
        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[styles.label, { fontSize: node.rowIndex === 0 ? 16 : 13 }]}
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
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    // Add a slight shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  label: {
    color: 'rgba(0,0,0,0.8)',
    textAlign: 'center',
    fontWeight: '600',
  },
});
