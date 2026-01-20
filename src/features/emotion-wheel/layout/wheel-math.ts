export function clamp(v: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, v));
}

export function smoothStep(t: number) {
  'worklet';
  return t * t * (3 - 2 * t);
}

// Smooth “bell curve” falloff (nice for focus field)
export function gaussian01(x: number) {
  'worklet';
  // x is 0..1, output ~1 at 0, ~0 at 1
  const a = 2.2;
  return Math.exp(-(x * x) * a);
}

export function hash01(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000; // 0..1
}

export function jitterSigned(id: string) {
  return hash01(id) * 2 - 1; // -1..1
}
