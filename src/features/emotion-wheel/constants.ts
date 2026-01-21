export const WHEEL = {
  sizeL0: 120,
  sizeL1: 96,
  sizeL2: 78,

  focusRadius: 210,
  focusMaxBoost: 0.35, // Increased slightly for "pop"
  focusNeighborBoost: 0.1,
  focusLift: -8,

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

  // Row sizing: Uniform nodes after core
  rowSizeStart: 90,
  rowSizeDecay: 1,
  rowSizeMin: 90,

  nodeGapPx: 12, // Gap between bubbles

  // New: This multiplier ensures the static layout creates
  // enough "empty space" for bubbles to scale up to 1.4x
  layoutSafetyFactor: 1.25,

  rowRadialStepFactor: 0.92,
  wedgePaddingRad: 0.06, // Increased slightly for clearer wedge separation
  wedgeEdgeInsetRad: 0.02,

  ring0Radius: 165,
  ring1Radius: 300,

  rowStart: 2,
  positionJitterPx: 0,
  hitTestRadius: 0.62,
  centerFocusHysteresisRatio: 0.92,
  zoomScale: 1,
} as const;
