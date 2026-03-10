// ─── Typography Scale ────────────────────────────────────────────────────────
// 8-token scale derived from DESIGN_SYSTEM_STATE.md audit.
// Each token covers a 2–3px range of ad-hoc values found across the codebase.

export const FONT_SIZE = {
  /** 11 — replaces: 10, 11 (tab label, badge, slot label, DOW header) */
  xs: 11,
  /** 13 — replaces: 12, 13 (dates, tags, entry time, row sub, section title) */
  sm: 13,
  /** 15 — replaces: 14, 15 (body copy, inputs, back buttons, dropdown items) */
  md: 15,
  /** 17 — replaces: 16, 17 (default text, mood label, row label, stats number) */
  base: 17,
  /** 20 — replaces: 18, 20 (entry note, canvas month, drawer row label) */
  lg: 20,
  /** 22 — section headings (journal day-header, insights section, check-in title) */
  xl: 22,
  /** 28 — page titles (journal, canvas, insights, notifications) */
  '2xl': 28,
  /** 34 — display / hero text (check-in greeting, page titles on settings pages) */
  display: 34,
} as const;

// ─── Letter Spacing ──────────────────────────────────────────────────────────
// Three values exist for "tight headings" in the wild. Standardizing to two.

export const LETTER_SPACING = {
  /** -0.5 — page titles, settings headers (was also -0.4 and -0.66) */
  tight: -0.5,
  /** 0 — body copy (implicit default) */
  normal: 0,
  /** 0.5 — small caps labels, mono section titles */
  wide: 0.5,
  /** 1.2 — all-caps input labels, slot labels */
  wider: 1.2,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
// 4-token scale replacing 10 ad-hoc values (2, 4, 8, 10, 12, 14, 16, 20, 30, 100).

export const RADIUS = {
  /** 4 — replaces: 2, 4 (tiles, tags, handle bar, micro elements) */
  tight: 4,
  /** 16 — replaces: 8, 10, 12, 14, 16 (cards, inputs, chips, dropdowns, buttons) */
  card: 16,
  /** 20 — replaces: 20, 30 (modals, sheets, major containers) */
  sheet: 20,
  /** 100 — replaces: 32, 100 (pill buttons, tag chips, emotion buttons) */
  pill: 100,
} as const;

// ─── Spacing Scale ────────────────────────────────────────────────────────────
// Strict multiples-of-4 grid. Use these instead of raw numbers.
// Off-grid values from the audit (3, 10, 14) should migrate to the nearest token.

export const SPACING = {
  /** 4 — hairline gaps, handle bar, micro icon padding */
  1: 4,
  /** 8 — dividers, row vertical padding, chip padding, small gaps */
  2: 8,
  /** 12 — rows, close button, pill button (sm), tight section gaps */
  3: 12,
  /** 16 — cards, buttons, headers, grid cells, icon buttons */
  4: 16,
  /** 20 — modals, major cards, section content */
  5: 20,
  /** 24 — screen horizontal padding (canonical), observation card, emotional footprint */
  6: 24,
  /** 32 — section top spacing, stats group spacing */
  8: 32,
  /** 40 — tab content area, year view content, large header offsets */
  10: 40,
  /** 48 — large header padding (notifications) */
  12: 48,
  /** 56 — tab bar height, text input min-height (maps to LAYOUT.TAB_BAR_HEIGHT) */
  14: 56,
  /** 64 — large circle icons (plus circle diameter) */
  16: 64,
  /** 80 — input container min-height */
  20: 80,
} as const;

// ─── Animation Durations ──────────────────────────────────────────────────────
// In milliseconds. Use with withTiming / FadeIn / FadeOut duration props.

export const DURATION = {
  /** 150ms — micro transitions (fade in/out, icon swaps) */
  fast: 150,
  /** 250ms — standard transitions (panels, headers, layout shifts) */
  standard: 250,
  /** 350ms — deliberate transitions (modals, page content) */
  slow: 350,
} as const;

// ─── Spring Presets ───────────────────────────────────────────────────────────
// Use with withSpring / LinearTransition.springify().

export const SPRING = {
  /** Snappy press response — buttons, mood slots */
  snappy: { damping: 15, stiffness: 300 },
  /** Smooth release — press-out, layout settle */
  smooth: { damping: 12, stiffness: 200 },
  /** Gentle layout — accordion open/close, panel expand */
  gentle: { mass: 0.8, damping: 28, stiffness: 250 },
} as const;
