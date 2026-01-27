import { useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { WHEEL } from '../constants';
import { FEELINGS_CONTENT } from '../constants/feelings.content';
import { buildWheelTree } from '../data/build-wheel-tree';
import { useWheelGesture } from '../hooks/useWheelGesture';
import { buildWheelLayout } from '../layout/build-wheel-layout';
import { EmotionNode } from './emotion-node';

export function EmotionWheel() {
  // 1. We start with 0 dimensions and wait for onLayout
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const isLayoutReady = layout.width > 0 && layout.height > 0;

  const centerX = layout.width / 2;
  const centerY = layout.height / 2;

  const roots = useMemo(() => buildWheelTree(FEELINGS_CONTENT), []);

  // 2. Only build the nodes once we know the exact center
  const nodes = useMemo(() => {
    if (!isLayoutReady) return [];
    return buildWheelLayout(roots, { cx: centerX, cy: centerY });
  }, [roots, centerX, centerY, isLayoutReady]);

  const g = useWheelGesture({ nodes, centerX, centerY });

  const fieldStyle = useAnimatedStyle(() => {
    const S = WHEEL.zoomScale ?? 1;
    return {
      transform: [
        // Pivot around the calculated center
        { translateX: centerX },
        { translateY: centerY },
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
      g.focusNearestToPoint(e.x, e.y);
    });

  const composed = Gesture.Simultaneous(g.pan, tap);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    // Only update if dimensions actually changed to avoid re-renders
    if (width !== layout.width || height !== layout.height) {
      setLayout({ width, height });
    }
  };

  return (
    <GestureDetector gesture={composed}>
      <View style={styles.container} onLayout={handleLayout}>
        {/* 3. Don't render nodes until we know where the center is */}
        {isLayoutReady && (
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
                focusedIndex={g.focusedIndex}
              />
            ))}
          </Animated.View>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    overflow: 'hidden',
  },
});
