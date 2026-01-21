import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { WHEEL } from '../constants';
import { FEELINGS_CONTENT } from '../constants/feelings.content';
import { buildWheelTree } from '../data/build-wheel-tree';
import { useWheelGesture } from '../hooks/useWheelGesture';
import { buildWheelLayout } from '../layout/build-wheel-layout';
import { EmotionNode } from './emotion-node';

export function EmotionWheel() {
  const { width, height } = useWindowDimensions();
  const centerX = width / 2;
  const centerY = height / 2;

  const roots = useMemo(() => buildWheelTree(FEELINGS_CONTENT), []);
  const nodes = useMemo(
    () => buildWheelLayout(roots, { cx: centerX, cy: centerY }),
    [roots, centerX, centerY],
  );

  const g = useWheelGesture({ nodes, centerX, centerY });

  const fieldStyle = useAnimatedStyle(() => {
    const S = WHEEL.zoomScale ?? 1;

    return {
      transform: [
        { translateX: centerX },
        { translateY: centerY },

        { translateX: g.fieldTx.value },
        { translateY: g.fieldTy.value },

        { scale: S },

        { translateX: -centerX },
        { translateY: -centerY },
      ],
    };
  });

  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((e, success) => {
      if (!success) return;
      // ✅ focus whatever bubble you actually tapped
      g.focusNearestToPoint(e.x, e.y);
    });

  const composed = Gesture.Simultaneous(g.pan, tap);

  return (
    <GestureDetector gesture={composed}>
      <View style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, fieldStyle]} pointerEvents="box-none">
          {nodes.map((node, index) => (
            <EmotionNode
              key={node.id}
              node={node}
              index={index}
              centerX={centerX}
              centerY={centerY}
              fieldTx={g.fieldTx}
              fieldTy={g.fieldTy}
              touchX={g.touchX}
              touchY={g.touchY}
              isTouching={g.isTouching}
              focusedIndex={g.focusedIndex}
            />
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
