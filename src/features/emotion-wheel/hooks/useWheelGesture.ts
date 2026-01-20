import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { hapticSelection } from '../../../lib/haptics/haptics';
import { WHEEL } from '../constants';
import type { NodeLayout } from '../types';

export function useWheelGesture(args: { nodes: NodeLayout[]; centerX: number; centerY: number }) {
  const { nodes, centerX, centerY } = args;

  const fieldTx = useSharedValue(0);
  const fieldTy = useSharedValue(0);

  const touchX = useSharedValue(centerX);
  const touchY = useSharedValue(centerY);
  const isTouching = useSharedValue(0);

  const smoothX = useSharedValue(centerX);
  const smoothY = useSharedValue(centerY);

  const selectedIndex = useSharedValue(-1);

  const lastTx = useSharedValue(0);
  const lastTy = useSharedValue(0);

  const focusIndex = (index: number) => {
    'worklet';
    if (index < 0 || index >= nodes.length) return;

    selectedIndex.value = index;

    const target = nodes[index];
    const bx = fieldTx.value + target.x0;
    const by = fieldTy.value + target.y0;

    const deltaX = centerX - bx;
    const deltaY = centerY - by;

    fieldTx.value = withSpring(fieldTx.value + deltaX, WHEEL.snapSpring);
    fieldTy.value = withSpring(fieldTy.value + deltaY, WHEEL.snapSpring);
  };

  const findNearestIndexToPoint = (x: number, y: number) => {
    'worklet';
    let bestI = 0;
    let bestD = 1e15;

    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      const bx = fieldTx.value + p.x0;
      const by = fieldTy.value + p.y0;

      const dx = x - bx;
      const dy = y - by;
      const d = dx * dx + dy * dy;

      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    }
    return { bestI, bestD };
  };

  const focusNearestToPoint = (x: number, y: number) => {
    'worklet';
    const { bestI, bestD } = findNearestIndexToPoint(x, y);

    // Optional: require tap to be “close enough” to a node
    const n = nodes[bestI];
    const size = n.level === 0 ? WHEEL.sizeL0 : n.level === 1 ? WHEEL.sizeL1 : WHEEL.sizeL2;
    const hit = (size * WHEEL.hitTestRadius) ** 2; // radius-ish

    if (bestD <= hit) {
      focusIndex(bestI);
      // treat as a “selection”
      runOnJS(hapticSelection)();
    }
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      isTouching.value = 1;

      smoothX.value = e.x;
      smoothY.value = e.y;
      touchX.value = e.x;
      touchY.value = e.y;

      lastTx.value = e.translationX ?? 0;
      lastTy.value = e.translationY ?? 0;
    })
    .onUpdate((e) => {
      // smooth finger (premium)
      const a = WHEEL.touchSmoothingAlpha;
      smoothX.value = smoothX.value + (e.x - smoothX.value) * a;
      smoothY.value = smoothY.value + (e.y - smoothY.value) * a;
      touchX.value = smoothX.value;
      touchY.value = smoothY.value;

      // free pan anywhere
      const tx = e.translationX ?? 0;
      const ty = e.translationY ?? 0;
      const dx = tx - lastTx.value;
      const dy = ty - lastTy.value;
      lastTx.value = tx;
      lastTy.value = ty;

      fieldTx.value += dx;
      fieldTy.value += dy;

      // hover selection: nearest to finger (haptics + visual)
      const { bestI, bestD } = findNearestIndexToPoint(touchX.value, touchY.value);

      const prev = selectedIndex.value;
      if (prev === -1) {
        selectedIndex.value = bestI;
        runOnJS(hapticSelection)();
      } else if (bestI !== prev) {
        // hysteresis check
        const prevNode = nodes[prev];
        const pbx = fieldTx.value + prevNode.x0;
        const pby = fieldTy.value + prevNode.y0;

        const pdx = touchX.value - pbx;
        const pdy = touchY.value - pby;
        const prevD = pdx * pdx + pdy * pdy;

        const thresh = WHEEL.selectionHysteresisPx;
        if (bestD < prevD - thresh * thresh) {
          selectedIndex.value = bestI;
          runOnJS(hapticSelection)();
        }
      }
    })
    .onEnd(() => {
      // settle: nearest to screen center becomes focused
      const { bestI } = findNearestIndexToPoint(centerX, centerY);
      focusIndex(bestI);
      isTouching.value = withTiming(0, { duration: 160 });
    })
    .onFinalize(() => {
      isTouching.value = withTiming(0, { duration: 160 });
    });

  return {
    pan,
    fieldTx,
    fieldTy,
    touchX,
    touchY,
    isTouching,
    selectedIndex,
    focusIndex,
    focusNearestToPoint,
  };
}
