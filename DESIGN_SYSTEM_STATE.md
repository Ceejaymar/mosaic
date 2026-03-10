# DESIGN_SYSTEM_STATE.md

> Audited: `src/app`, `src/components`, `src/features`
> Emotion-picker color palettes (`src/features/emotion-accordion/content/`) excluded.
> Generated: 2026-03-09

---

## 1. TYPOGRAPHY

### Consistency Score: 5 / 10

**Recommendation:** The Fraunces/SpaceMono pairing is intentional and looks premium, but font sizes are entirely ad-hoc integers with no shared scale. The biggest quick win is introducing ~8 named size tokens (`xs` through `display`) and replacing the 20+ unique raw numbers that appear once. letterSpacing is also unsystematic — three different negative values exist for "tight headings" (-0.4, -0.5, -0.66).

---

### 1.1 Font Families

| Role | Normal Mode | Dyslexic Mode | File |
|------|-------------|---------------|------|
| Heading | `'Fraunces'` | `'OpenDyslexic-Bold'` | `src/utils/typography.ts` |
| Body | *(system default)* | `'OpenDyslexic-Regular'` | `src/utils/typography.ts` |
| Mono / Label | `'SpaceMono'` | `'OpenDyslexic-Regular'` | `src/utils/typography.ts` |

Resolution flows through `getFontFamily(type, isDyslexic)` → consumed by `AppText` variant prop.

**Hardcoded font family leaks** (bypassing `AppText`/`getFontFamily`):

| File | Hardcoded Value | Context |
|------|----------------|---------|
| `src/app/(drawer)/pages/accessibility.tsx` | `fontFamily: 'Fraunces'` | Page title |
| `src/app/(drawer)/pages/notifications.tsx` | `fontFamily: 'Fraunces'` | Page title, sheet title |
| `src/app/(drawer)/pages/notifications.tsx` | `fontFamily: 'SpaceMono'` | Row sub, picker label, collision warning |
| `src/features/canvas/components/canvas.tsx` | `fontFamily: 'SpaceMono'` | Toggle/chip labels |
| `src/app/(drawer)/(tabs)/insights.tsx` | `fontFamily: 'SpaceMono'` | Dropdown, snapper items |
| `src/features/journal/components/entry-card.tsx` | `fontFamily: 'Fraunces'` | Note text, emotion label |
| `src/features/check-in/components/check-in-sheet.tsx` | `fontFamily: 'Fraunces'` | Title, emotion banner |
| `src/features/check-in/components/mood-slot.tsx` | *(none — no fontFamily set)* | — |
| `src/components/themed-text.tsx` | `fontFamily: 'Fraunces'` | title variant |
| `src/app/(drawer)/_layout.tsx` | `fontFamily: 'Fraunces'` | Drawer header title |

---

### 1.2 Font Size Inventory

All raw `fontSize` values found. Values **not** referenced by any token.

| Value | Where Used |
|-------|-----------|
| `10` | Tab bar label |
| `11` | Demo badge, mood slot slot-label, DOW header label |
| `12` | Date label (check-in), tag text (journal), entry time, version text, drawer section title, input label (check-in sheet), picker label (notifications), chip label (canvas) |
| `13` | Row sub (accessibility, notifications), "I'm feeling" label (journal), emotion.tsx label, selected-emotion pre-text |
| `14` | Error text (check-in), journal tag text, journal entry "I'm feeling", insights observation card, insights empty body text, notifications dropdown item |
| `15` | Insights dropdown trigger, insights snapper, check-in sheet text input, check-in sheet back button, pill button (sm), notifications surprise button |
| `16` | Default `ThemedText`, mood label (mood-slot), check-in sheet emotion dot label, notifications section label, canvas header label, theme-toggle segment |
| `17` | Accessibility/notifications row label, daily stats number, pill button (md) |
| `18` | Drawer row label, journal day-header emotion label (entry), notifications time row |
| `20` | Journal entry note, canvas month label |
| `22` | Journal day-header date, insights section title, check-in sheet title, rhythm bar title, context matrix title |
| `28` | Journal page title, canvas page title, insights page title, notifications page title (drawer) |
| `32` | Accessibility page title, notifications page title (pages/), `ThemedText` title variant |
| `34` | Check-in greeting |
| `36` | Check-in sheet selected emotion banner |

**Count of unique sizes:** 18

**Recommended scale to unify to (8 tokens):**

| Token | Value | Replaces |
|-------|-------|---------|
| `size.xs` | 11 | 10, 11 |
| `size.sm` | 13 | 12, 13 |
| `size.md` | 15 | 14, 15 |
| `size.base` | 17 | 16, 17 |
| `size.lg` | 20 | 18, 20 |
| `size.xl` | 22 | 22 |
| `size.2xl` | 28 | 28 |
| `size.display` | 34 | 32, 34, 36 |

---

### 1.3 Letter Spacing

| Value | Usage |
|-------|-------|
| `-1.08` | Check-in sheet selected emotion banner (hardcoded) |
| `-0.66` | Check-in sheet title (hardcoded) |
| `-0.5` | Greeting, drawer header title, accessibility/notifications page title |
| `-0.4` | Journal/canvas/insights page title, entry note |
| `-0.3` | Check-in history row label |
| `-0.2` | Journal entry note |
| `0` | Most body text (implicit) |
| `0.2` | Entry time |
| `0.5` | Drawer section title, notifications picker label |
| `0.6` | Check-in sheet emotion pre-text |
| `1.2` | Check-in sheet input label, mood-slot slot-label |
| `1.5` | Check-in date label |

**Problem:** Three values exist for "tight heading" (-0.4, -0.5, -0.66) applied inconsistently to the same visual tier.

---

### 1.4 Line Height

| Value | Usage |
|-------|-------|
| `18` | Accessibility/notifications row sub |
| `22` | Check-in sheet subtitle, insights observation card, insights empty body |
| `25` | Check-in sheet text input |
| `28` | Journal entry note |
| `40` | Check-in sheet emotion banner |
| `41` | Check-in greeting |

---

### 1.5 Font Weight

Weights in use: `'300'`, `'400'`, `'500'`, `'600'`, `'700'`, `'bold'`.
`'bold'` appears only in `ThemedText` (legacy component) — all other weight usages are numeric strings.

---

## 2. COLOR PALETTE

### Consistency Score: 7 / 10

**Recommendation:** The theme token coverage is strong for backgrounds, text, and interactive states. The main issues are: (1) a handful of hardcoded overlays using raw `rgba()` that vary slightly across components, and (2) `#000` used directly as `shadowColor` on two components instead of `theme.colors.typography`. Standardize all overlay scrim values to one or two named tokens.

---

### 2.1 Defined Theme Tokens

| Token | Light | Dark | Semantic Use |
|-------|-------|------|--------------|
| `background` | `#ffffff` | `#000000` | Page backgrounds |
| `typography` | `#000000` | `#ffffff` | Primary text |
| `textMuted` | `#8E8E93` | `#8E8E93` | Secondary/helper text |
| `surface` | `#F2F2F7` | `#1C1C1E` | Cards, input backgrounds, sheets |
| `divider` | `#D1D1D6` | `#3A3A3C` | Lines, separators |
| `mosaicGold` | `#E0C097` | `#E0C097` | Primary brand / interactive accent |
| `lightGrey` | `#808080` | `#808080` | Tertiary UI elements |
| `onAccent` | `#050505` | `#050505` | Text/icons on gold backgrounds |
| `tileBackground` | `#ffffff` | `#1C1C1E` | Tile/card surface |
| `tileShadowColor` | `#E0C097` | `transparent` | Brand-tinted tile shadow (disabled dark) |
| `destructive` | `#FF3B30` | `#FF3B30` | Delete / remove actions |
| `headerGradient` | `rgba(255,255,255,0.9→0.1)` | `rgba(0,0,0,0.9→0.1)` | Scroll fade-out header |
| `tabBarGradient` | `rgba(255,255,255,0→0.9)` | `rgba(0,0,0,0→0.9)` | Tab bar fade mask |
| `tabInactive` | `rgba(0,0,0,0.45)` | `rgba(255,255,255,0.45)` | Inactive tab labels/icons |

---

### 2.2 Hardcoded Color Leaks

| File | Value | Usage | Suggested Token |
|------|-------|-------|-----------------|
| `src/app/+not-found.tsx` | `#2e78b7` | Link text | *(one-off, low priority)* |
| `src/components/fab.tsx` | `#000` | Shadow color | `theme.colors.typography` |
| `src/components/fab.tsx` | `rgba(255,255,255,0.1)` | Border | Add `surfaceOverlay` token |
| `src/components/calendar-day.tsx` | `'white'` | Text over colored tile | `theme.colors.onAccent` |
| `src/components/calendar-day.tsx` | `#d3d3d330` | Border | `theme.colors.divider` + opacity |
| `src/features/check-in/components/emotion.tsx` | `#050505` | Selected label | `theme.colors.onAccent` |
| `src/features/check-in/components/emotion.tsx` | `#888888` | Unselected label | `theme.colors.textMuted` |
| `src/features/emotion-accordion/components/focus-group.tsx` | `rgba(255,255,255,0.15)` | Gradient overlay (light) | Add `overlayLight` token |
| `src/features/emotion-accordion/components/focus-group.tsx` | `rgba(0,0,0,0.2)` | Gradient overlay (dark) | Add `overlayDark` token |
| `src/features/emotion-accordion/components/selection-modal.tsx` | `#808080` | Color fallback | `theme.colors.lightGrey` |
| `src/features/canvas/components/day-tile.tsx` | `rgba(255,255,255,0.12)` | Segment overlay (light) | Add `overlayLight` token |
| `src/features/canvas/components/day-tile.tsx` | `rgba(0,0,0,0.10)` | Segment overlay (dark) | Add `overlayDark` token |
| `src/features/check-in/components/mosaic-display.tsx` | `rgba(0,0,0,0.22)` | Tile scrim | Add `tileScrim` token |
| `src/features/check-in/components/mosaic-display.tsx` | `#fff` | Tile label & time text | `theme.colors.onAccent` |
| `src/features/check-in/components/mosaic-display.tsx` | `rgba(255,255,255,0.65)` | Time opacity | `theme.colors.onAccent` + opacity |
| `src/features/insights/components/selection-modal.tsx` | `rgba(0,0,0,0.5)` | Modal overlay | Add `modalOverlay` token |
| `src/app/(drawer)/(tabs)/index.tsx` | `rgba(255,255,255,0.08)` | Hamburger border | Add `overlayLight` token |
| `src/features/check-in/components/mood-slot.tsx` | `${moodColor}50` | Tile border (with alpha) | *(emotion-driven, acceptable)* |

**Overlay `rgba()` values that should be unified into 2–3 tokens:**

| Proposed Token | Light Value | Dark Value |
|---------------|-------------|------------|
| `overlayLight` | `rgba(255,255,255,0.12–0.15)` | *(not used)* |
| `overlayDark` | *(not used)* | `rgba(0,0,0,0.10–0.22)` |
| `modalOverlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.5)` |

---

## 3. SPACING & LAYOUT

### Consistency Score: 5 / 10

**Recommendation:** The 4px base unit is implicit but not enforced. Values like `3`, `10`, `14`, `28`, `40` break the grid. Standard screen horizontal padding is inconsistently `20` or `24` across screens. Introduce a spacing scale constant and audit all outliers. The screen-edge padding inconsistency alone makes the app feel slightly misaligned on scrollable content.

---

### 3.1 Standard Screen Horizontal Padding

| Value | Used In |
|-------|---------|
| `20` | Journal day-header (`paddingHorizontal: 20`), check-in sheet content |
| `24` | Canvas, Insights (`TOPBAR_H_PAD: 24`), emotional footprint (`CANVAS_W = screenWidth - 48`) |
| `16` | Many feature components |

**Problem:** Screen-level horizontal padding is `20` in some screens and `24` in others. No single canonical value.

---

### 3.2 Layout Constants (Centralized in `src/constants/layout.ts`)

| Constant | Value | Notes |
|----------|-------|-------|
| `LAYOUT.TAB_BAR_HEIGHT` | `56` | Intrinsic height; safe-area added at call sites |
| `LAYOUT.TAB_SPACER_WIDTH` | `88` | Center FAB slot width |

---

### 3.3 Padding Values (All Unique Values Found)

| Value | On-grid (÷4)? | Usage Sample |
|-------|:---:|-------------|
| `3` | ✗ | Mood slot accent strip |
| `4` | ✓ | Handle bar, small icon padding |
| `8` | ✓ | Dividers, row vertical, chips |
| `10` | ✗ | Daily stats gap, tag padding |
| `12` | ✓ | Rows, pill button (sm), close button |
| `14` | ✗ | Picker wrapper, button defaults |
| `16` | ✓ | Cards, buttons, headers, grid cells |
| `20` | ✓ | Cards, modals, section content |
| `24` | ✓ | Screen horizontal padding, observation card |
| `28` | ✓ | Day header bottom padding |
| `32` | ✓ | Day header top padding, stats spacing |
| `40` | ✓ | Tab spacing, year view, header |
| `48` | ✓ | Notifications header padding |
| `56` | ✓ | Tab bar height, text input min-height |
| `64` | ✓ | Plus circle diameter |
| `72` | ✓ | Check-in history row divider margin |
| `80` | ✓ | Input container min-height |
| `120` | ✓ | Context scroll bottom padding |
| `180` | ✓ | Emotion selector scroll padding bottom |

**Off-grid values to fix:** `3`, `10`, `14`.

---

### 3.4 Gap Values

| Value | On-grid? | Usage |
|-------|:---:|-------|
| `4` | ✓ | Canvas day tile gaps, small UI |
| `6` | ✗ | Debug UI only |
| `8` | ✓ | Row spacing, tag spacing, lists |
| `10` | ✗ | Daily stats groups |
| `12` | ✓ | Cards, buttons, observation sections |
| `16` | ✓ | Tag grid, stat row gaps |
| `20` | ✓ | Major section gaps |
| `24` | ✓ | Insights section gaps |

**Off-grid values:** `6`, `10`.

---

### 3.5 Fixed Dimensions (Width/Height)

| Value | Usage |
|-------|-------|
| `1` | Borders, dividers |
| `2` | Handle bar height, hairline borders |
| `8` | Status dot |
| `12` | Emotion dot, squircle size |
| `20` | Close button, fade width |
| `24` | Icon buttons |
| `28` | Chip height |
| `36` | Header icon buttons |
| `40` | Plus circle |
| `48` | Floating menu size |
| `50` | Calendar day cell |
| `60` | FAB diameter |
| `300` | MosaicContainer fixed width |

---

## 4. SURFACE & SHAPE

### Consistency Score: 6 / 10

**Recommendation:** Border radii are the most scattered category — 10 distinct values exist for just 3 conceptual tiers (tight/card/full-pill). The worst offenders are `20` vs `16` on what are visually the same card type (entry card = 20, mood slot = 16). Consolidate to 4 radius tokens: `tight` (4), `card` (16), `sheet` (20), `pill` (100). Shadows are generally well-constructed with brand-tinted tile shadows — just replace the two raw `#000` shadow usages.

---

### 4.1 Border Radius Values

| Value | Usage |
|-------|-------|
| `2` | Handle bar |
| `4` | Tag, mosaic tile |
| `8` | Filter toggle, miscellaneous small UI |
| `10` | Demo badge |
| `12` | Observation card, input container, dropdowns, permission block, list block |
| `14` | Chip (large) |
| `16` | Mood slot, check-in sheet header, header buttons, day tile, year tile pressable |
| `20` | Entry cards (journal), context matrix, check-in sheet body, mosaic container |
| `30` | MosaicContainer outer wrapper |
| `32` | Plus circle |
| `100` | Pill buttons, tag chips, emotion buttons |

**Proposed 4-token radius scale:**

| Token | Value | Consolidates |
|-------|-------|-------------|
| `radius.tight` | `4` | 2, 4 |
| `radius.card` | `16` | 10, 12, 14, 16 |
| `radius.sheet` | `20` | 20, 30 |
| `radius.pill` | `100` | 32, 100 |

---

### 4.2 Border Width Values

| Value | Usage |
|-------|-------|
| `0` | Tab bar |
| `0.5` | Calendar day cell |
| `1` | Mood slot border, emotion tile, demo badge, list block, dropdown, observation card, pill container, theme toggle |
| `1.5` | Emotion button, tag chips, FAB |

No token currently exists for border widths. All values are hardcoded.

---

### 4.3 Shadow Definitions

| Component | shadowColor | shadowOffset | shadowOpacity | shadowRadius | elevation |
|-----------|------------|:------------:|:-------------:|:------------:|:---------:|
| FAB | `'#000'` ⚠️ | `{0, 10}` | `0.4` | `12` | `12` |
| Close button | `theme.colors.typography` | `{0, 1}` | `0.08` | `4` | `1` |
| Input container | `theme.colors.typography` | `{0, 2}` | `0.07` | `8` | `2` |
| Pill button (elevated) | `theme.colors.typography` | `{0, 3}` | `0.15` | `8` | `3` |
| Theme toggle active | `theme.colors.typography` | `{0, 2}` | `0.1` | `4` | `2` |
| Mood slot tile | `theme.colors.tileShadowColor` | `{0, 4}` | `0.12` | `12` | `0`/`2` |
| Journal entry card | `theme.colors.typography` | `{0, 3}` | `0.14` | `10` | `3` |
| Selection modal | `'#000'` ⚠️ | `{0, 8}` | `0.2` | `12` | `10` |
| Dropdown menu | `'#000'` ⚠️ | `{0, 4}` | `0.1` | `12` | `5` |
| Rhythm bar caps | `'#000'` ⚠️ | `{0, 2}` | `0.1` | `8` | *(none)* |

⚠️ = Raw `#000` hardcoded; should use `theme.colors.typography` for dark mode correctness.

**Shadow tiers (current, unformalized):**

| Tier | Offset | Opacity | Radius | Usage |
|------|--------|---------|--------|-------|
| Subtle | `{0, 1–2}` | `0.07–0.10` | `4–8` | Close button, toggle, input |
| Card | `{0, 3–4}` | `0.12–0.15` | `8–12` | Entry card, mood slot |
| Elevated | `{0, 8–10}` | `0.2–0.4` | `12` | FAB, modals |

---

### 4.4 `overflow: 'hidden'` Usage

Applied on: mood slots, canvas day tiles, FAB, check-in sheet, mosaic display, year view container, input containers, selection modals, emotion focus-group. Consistent and expected.

---

## 5. INTERACTION & FEEL

### Consistency Score: 8 / 10

**Recommendation:** The haptic and animation system is the most mature part of the design system. The `hapticLight`/`hapticSelection` utilities already guard against device preferences. The main gap is animation duration inconsistency — 4 different timing values (150ms, 180ms, 250ms, 300ms) are used for similar-tier transitions. Standardize to `fast: 150ms`, `standard: 250ms`, `slow: 350ms`. Spring configs are also scattered; extract them to shared constants.

---

### 5.1 Haptic Feedback

All haptic calls flow through `src/lib/haptics/haptics.ts` which internally guards against:
- `accessibility.disableHaptics` setting
- Platform availability
- Per-type throttle (impact: 50ms, selection: 35ms)

| Function | Intensity | Where Triggered |
|----------|-----------|----------------|
| `hapticLight()` | Light impact | Tab press, FAB press, button press, a11y toggles (re-enable), drawer interactions, check-in save |
| `hapticMedium()` | Medium impact | *(rarely used in audited files)* |
| `hapticHeavy()` | Heavy impact | *(rarely used in audited files)* |
| `hapticSuccess()` | Success notification | Check-in completion |
| `hapticSelection()` | Selection tick | Dropdown item, insights timeframe change, segment switch |

---

### 5.2 Animation Durations

| Duration | Usage |
|----------|-------|
| `150ms` | Emotion group entry/exit (`FadeIn`, `FadeOut`) |
| `180ms` | Canvas view-mode toggle (month↔year) |
| `250ms` | Focus group header (`withTiming`) |
| `300ms` | *(implied defaults in some Reanimated `withTiming` calls)* |

No shared duration constant currently exists.

---

### 5.3 Spring Configurations

| Config | Component | Usage |
|--------|-----------|-------|
| `{ damping: 15, stiffness: 300 }` | Mood slot | Press-in scale |
| `{ damping: 12, stiffness: 200 }` | Mood slot | Press-out scale |
| `{ damping: 15, stiffness: 200 }` | Focus group header | Layout spring |
| `{ mass: 0.8, damping: 28, stiffness: 250 }` | Emotion selector | LinearTransition.springify |
| `{ mass: 1.5, damping: 25, stiffness: 200 }` | Selection modal | FadeInDown |
| `scale: 0.92` (withSpring defaults) | FAB | Press-in scale |

---

### 5.4 Reduce Motion Handling

| Surface | Implementation |
|---------|---------------|
| Tab transitions | `animation: reduceMotion ? 'none' : 'shift'` |
| Screen push animations | `animation: reduceMotion ? 'none' : 'slide_from_right'` |
| All `withSpring` / `withTiming` | `reduceMotion: rm` param (where `rm = ReduceMotion.Always` or `ReduceMotion.System`) |
| Reanimated layout animations | Respect Reanimated's built-in reduce-motion handling |

The `reduceMotion` flag is read from `useAppStore((s) => s.accessibility.reduceMotion)` as a reactive selector across all animated screens.

---

## 6. OVERALL SUMMARY

| Category | Score | Top Priority Fix |
|----------|:-----:|-----------------|
| Typography | 5/10 | Introduce 8 named size tokens; unify tight-heading letter spacing to one value (-0.5) |
| Color Palette | 7/10 | Add `overlayLight`, `overlayDark`, `modalOverlay` tokens; replace 4× raw `#000` shadow color |
| Spacing & Layout | 5/10 | Align screen horizontal padding to one value (recommend `24`); fix off-grid values 3, 10, 14 |
| Surface & Shape | 6/10 | Consolidate 10 radius values into 4 named tokens; formal shadow tier system |
| Interaction & Feel | 8/10 | Extract animation duration constants; consolidate spring configs into 2–3 shared presets |

**Highest-leverage single change:** Introduce a `src/constants/design-tokens.ts` file with the font size scale, radius scale, and named durations. This one file, combined with a `src/styles/themes.ts` expansion (overlay tokens, shadow tokens), would move the overall system score from ~6 to ~8.5 and make every future component consistent by default.
