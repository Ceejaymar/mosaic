import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { WHEEL } from '../constants';
import { clamp, gaussian01 } from '../layout/wheel-math';
import type { NodeLayout } from '../types';

export const EmotionNode = memo(function EmotionNode(props: {
  node: NodeLayout;
  index: number;
  centerX: number;
  centerY: number;
  fieldTx: SharedValue<number>;
  fieldTy: SharedValue<number>;
  focusedIndex: SharedValue<number>;
}) {
  const { node, index, centerX, centerY, fieldTx, fieldTy, focusedIndex } = props;
  const size = node.size;
  const r = size / 2;

  // Static starting position
  const baseLeft = node.x0 - r;
  const baseTop = node.y0 - r;

  const style = useAnimatedStyle(() => {
    // 1. Calculate World Position
    const currentX = node.x0 + fieldTx.value;
    const currentY = node.y0 + fieldTy.value;

    // 2. Distance from Center
    const dX = currentX - centerX;
    const dY = currentY - centerY;
    const distFromCenter = Math.sqrt(dX * dX + dY * dY);

    // 3. Scale Logic
    // If WHEEL.focusRadius is undefined, this becomes NaN and view disappears!
    const focusT = clamp(distFromCenter / (WHEEL.focusRadius || 180), 0, 1);
    const focus = gaussian01(focusT);
    const isFocused = focusedIndex.value === index ? 1 : 0;

    const scale =
      1 + focus * (WHEEL.focusMaxBoost || 0.5) + isFocused * (WHEEL.selectionBoost || 0.05);

    // 4. Z-Index (Focused on top)
    const zIndex = Math.round(focus * 100 + isFocused * 10);

    return {
      position: 'absolute',
      left: baseLeft,
      top: baseTop,
      width: size,
      height: size,
      zIndex,
      transform: [{ translateX: fieldTx.value }, { translateY: fieldTy.value }, { scale }],
    };
  });

  return (
    <Animated.View style={style} pointerEvents="none">
      <View style={[styles.nodeContainer, { backgroundColor: node.color }]}>
        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[styles.label, { fontSize: node.rowIndex === 0 ? 17 : 14 }]}
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
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    color: 'black',
    textAlign: 'center',
    fontWeight: '700',
    fontFamily: 'Fraunces',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
