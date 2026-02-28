import { BlurMask, Canvas, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAppStore } from '@/src/store/useApp';

type Props = {
  color: string;
};

export function SkiaAura({ color }: Props) {
  const { width } = useWindowDimensions();
  const height = 400; // Large enough to cover the grid
  const reduceMotion = useAppStore((s) => s.accessibility.reduceMotion);

  // Start almost completely transparent (3%)
  const pulse = useSharedValue(0.03);

  useEffect(() => {
    if (reduceMotion) return; // Keep aura static at minimum opacity
    // Pulse gently up to only 12% opacity
    pulse.value = withRepeat(
      withSequence(withTiming(0.12, { duration: 2500 }), withTiming(0.03, { duration: 2500 })),
      -1, // Infinite
      true, // Reverse
    );
  }, [pulse, reduceMotion]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, animStyle]}
      pointerEvents="none"
    >
      <Canvas style={{ flex: 1 }}>
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={vec(width / 2, height / 2)}
            r={width / 1.5}
            colors={[color, 'transparent']}
          />
          <BlurMask blur={60} style="normal" />
        </Rect>
      </Canvas>
    </Animated.View>
  );
}
