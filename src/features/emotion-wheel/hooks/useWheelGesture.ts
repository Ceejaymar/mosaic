import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { hapticSelection } from '../../../lib/haptics/haptics';
import { WHEEL } from '../constants';
import type { NodeLayout } from '../types';

export function useWheelGesture(args: { nodes: NodeLayout[]; centerX: number; centerY: number }) {
  const { nodes, centerX, centerY } = args;

  const S = WHEEL.zoomScale ?? 1;

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

    const wx = fieldTx.value + target.x0;
    const wy = fieldTy.value + target.y0;

    const deltaX = centerX - wx;
    const deltaY = centerY - wy;

    fieldTx.value = withSpring(fieldTx.value + deltaX, WHEEL.snapSpring);
    fieldTy.value = withSpring(fieldTy.value + deltaY, WHEEL.snapSpring);
  };

  const findNearestIndexToPoint = (x: number, y: number) => {
    'worklet';
    let bestI = 0;
    let bestD = 1e15;

    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      const wx = fieldTx.value + p.x0;
      const wy = fieldTy.value + p.y0;

      const bx = centerX + (wx - centerX) * S;
      const by = centerY + (wy - centerY) * S;

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

    const n = nodes[bestI];
    const size = n.size;
    const hit = (size * S * WHEEL.hitTestRadius) ** 2;

    if (bestD <= hit) {
      focusIndex(bestI);
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
      const a = WHEEL.touchSmoothingAlpha;
      smoothX.value = smoothX.value + (e.x - smoothX.value) * a;
      smoothY.value = smoothY.value + (e.y - smoothY.value) * a;
      touchX.value = smoothX.value;
      touchY.value = smoothY.value;

      const tx = e.translationX ?? 0;
      const ty = e.translationY ?? 0;
      const dx = tx - lastTx.value;
      const dy = ty - lastTy.value;
      lastTx.value = tx;
      lastTy.value = ty;

      fieldTx.value += dx / S;
      fieldTy.value += dy / S;

      const { bestI, bestD } = findNearestIndexToPoint(touchX.value, touchY.value);

      const prev = selectedIndex.value;
      if (prev === -1) {
        selectedIndex.value = bestI;
        runOnJS(hapticSelection)();
      } else if (bestI !== prev) {
        const prevNode = nodes[prev];

        const pwx = fieldTx.value + prevNode.x0;
        const pwy = fieldTy.value + prevNode.y0;

        const pbx = centerX + (pwx - centerX) * S;
        const pby = centerY + (pwy - centerY) * S;

        const pdx = touchX.value - pbx;
        const pdy = touchY.value - pby;
        const prevD = pdx * pdx + pdy * pdy;

        const ratio = 0.88;
        if (bestD < prevD * ratio) {
          selectedIndex.value = bestI;
          runOnJS(hapticSelection)();
        }
      }
    })
    .onEnd(() => {
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
