import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { buildWheelNodes } from '../data/wheel-nodes';
import { useWheelGesture } from '../hooks/useWheelGesture';
import { buildWheelLayout } from '../layout/build-wheel-layout';
import { EmotionNode } from './emotion-node';

export function EmotionWheel() {
  const { width, height } = useWindowDimensions();
  const centerX = width / 2;
  const centerY = height / 2;

  const roots = useMemo(() => buildWheelNodes(), []);
  const nodes = useMemo(
    () => buildWheelLayout(roots, { cx: centerX, cy: centerY }),
    [roots, centerX, centerY],
  );

  const g = useWheelGesture({ nodes, centerX, centerY });

  // ✅ This is the missing link: actually apply pan translation visually
  const fieldStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: g.fieldTx.value }, { translateY: g.fieldTy.value }],
    };
  });

  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((e, success) => {
      if (!success) return;
      // Focus nearest node to tap point (screen coords)
      g.focusNearestToPoint(e.x, e.y);
    });

  const composed = Gesture.Simultaneous(g.pan, tap);

  return (
    <GestureDetector gesture={composed}>
      <View style={{ flex: 1 }}>
        {/* Single moving field */}
        <Animated.View style={[{ flex: 1 }, fieldStyle]} pointerEvents="box-none">
          {nodes.map((node, index) => (
            <EmotionNode
              key={node.id}
              node={node}
              index={index}
              centerX={centerX}
              centerY={centerY}
              // ✅ IMPORTANT: fieldTx/fieldTy no longer needed in node render transforms
              // We still pass them for bx/by distance math (finger + focus)
              fieldTx={g.fieldTx}
              fieldTy={g.fieldTy}
              touchX={g.touchX}
              touchY={g.touchY}
              isTouching={g.isTouching}
              selectedIndex={g.selectedIndex}
            />
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
