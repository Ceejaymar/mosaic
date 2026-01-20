export const WHEEL = {
  // Big nodes (keep the vibe)
  sizeL0: 120,
  sizeL1: 96,
  sizeL2: 78,

  /**
   * TIGHT honeycomb:
   * - smaller gap
   * - tightness < 1.0 pulls nodes closer
   */
  gap: 4,
  packingTightness: 0.94,

  /**
   * Grid radius
   * Increase if you have more nodes than cells.
   */
  hexRadius: 11,

  /**
   * Hierarchy bands by hex distance:
   * (general -> specific outward)
   */
  level0Max: 2,
  level1Max: 6,

  /**
   * Band scaling:
   * We keep the center slightly looser (big nodes),
   * and outer bands tighter (honeycomb feel).
   */
  bandScale0: 1.14,
  bandScale1: 1.0,
  bandScale2: 0.96,

  /**
   * Focus field (center emphasis like How We Feel)
   * NOTE: tighter packing means we should keep boosts reasonable
   * to avoid overlaps while focused.
   */
  focusRadius: 210,
  focusMaxBoost: 0.28,
  focusNeighborBoost: 0.12,
  focusLift: -12,

  /**
   * Finger magnet is subtle: mostly scale, minimal translation
   */
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

  // Remove jitter for tight packing
  positionJitterPx: 0,

  hitTestRadius: 0.62,

  /**
   * ✅ Distinct solid group colors (one per root group).
   * Tune later; these are intentionally bold.
   */
  groupPalette: [
    '#FF4D4D', // red
    '#FF8A3D', // orange
    '#FFC533', // yellow
    '#7CDE5A', // green
    '#38D6C4', // teal
    '#3DA2FF', // blue
    '#7B61FF', // indigo
    '#FF58C8', // pink
  ],
} as const;
