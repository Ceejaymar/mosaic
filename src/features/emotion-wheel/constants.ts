export const WHEEL = {
  sizeL0: 120,
  sizeL1: 96,
  sizeL2: 78,

  focusRadius: 210,
  focusMaxBoost: 0.28,
  focusNeighborBoost: 0.12,
  focusLift: -12,

  fingerInfluenceRadius: 170,
  fingerMaxOffset: 6,
  fingerStrength: 0.05,
  fingerScaleBoost: 0.08,

  touchSmoothingAlpha: 0.26,

  snapSpring: {
    damping: 26,
    stiffness: 280,
    mass: 0.95,
  },

  selectionHysteresisPx: 14,

  // row sizing (replaces size-by-level visually)
  rowSizeStart: 96,
  rowSizeDecay: 0.9,
  rowSizeMin: 56,

  nodeGapPx: 16,
  rowRadialStepFactor: 0.9,

  wedgePaddingRad: 0.1,

  ring0Radius: 165,
  ring1Radius: 330,

  rowStart: 2,

  positionJitterPx: 0,

  hitTestRadius: 0.62,

  zoomScale: 1,

  groupPalette: [
    '#FF4D4D',
    '#FF8A3D',
    '#FFC533',
    '#7CDE5A',
    '#38D6C4',
    '#3DA2FF',
    '#7B61FF',
    '#FF58C8',
  ],
} as const;
