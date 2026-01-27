export const WHEEL = {
  // Sizing
  sizeL0: 120,
  sizeL1: 96,
  sizeL2: 78,

  // Physics & Focus
  focusRadius: 180, // [CRITICAL] Used for scaling math
  focusMaxBoost: 0.65, // [CRITICAL] How much it pops at center
  selectionBoost: 0.05,

  // Touch handling
  touchSmoothingAlpha: 0.26,

  // Physics
  snapSpring: {
    damping: 28,
    stiffness: 180,
    mass: 1,
  },

  // Layout
  selectionHysteresisPx: 14,
  rowSizeStart: 90,
  rowSizeDecay: 1,
  rowSizeMin: 90,
  nodeGapPx: 12,
  layoutSafetyFactor: 1.35, // Ensures bubbles don't overlap when scaled
  rowRadialStepFactor: 0.92,
  wedgePaddingRad: 0.06,
  wedgeEdgeInsetRad: 0.02,

  // Radii
  ring0Radius: 165,
  ring1Radius: 300,

  // Misc
  rowStart: 2,
  positionJitterPx: 0,
  hitTestRadius: 0.62,
  centerFocusHysteresisRatio: 0.92,
  zoomScale: 1,
} as const;
