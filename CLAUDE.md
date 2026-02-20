# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start           # Start Expo dev server
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator

# Testing
npm run test            # Run Jest in watch mode
npm run test:ci         # Run Jest once (CI mode)

# Code Quality
npm run lint            # Biome lint on changed files
npm run format          # Format with Biome
npm run lint-format     # Check and write all fixes

# Database
npm run db:gen          # Generate Drizzle migrations
```

To run a single test file: `npx jest path/to/test.test.tsx`

## Architecture

Mosaic is a local-first React Native mood tracking app built with Expo. Users log up to 4 moods per day (morning, afternoon, evening, night).

### Navigation Structure

Expo Router with file-based routing:
- `src/app/_layout.tsx` — Root layout: loads fonts, runs DB migrations, initializes theme/i18n
- `src/app/(drawer)/_layout.tsx` — Drawer navigator
- `src/app/(drawer)/(tabs)/` — Tab screens: Check In (`index.tsx`), Journal, Emotions, Reflections

### State & Data

**Zustand** (`src/store/`) manages app-level state (theme, language, onboarding flag, accessibility) persisted via **MMKV**.

**Drizzle ORM + ExpoSQLite** (`src/db/`) handles mood entries. The only table is `mood_entries` with fields: `id`, `dateKey`, `primaryMood`, `note`, `occurredAt`, `createdAt`, `updatedAt`. Repositories live in `src/db/repos/`.

Migrations in `drizzle/` are auto-generated — run `npm run db:gen` after schema changes.

### Styling

**React Native Unistyles v3** handles theming. Themes are defined in `src/styles/themes/` (light/dark) and registered in `src/styles/unistyles.ts`. Theme switching uses `UnistylesRuntime` and responds to system preference. Breakpoints are also defined in `src/styles/unistyles.ts`.

### Key Feature: Emotion Accordion

`src/features/emotion-accordion/` is a self-contained module for emotion selection with its own components, content data, and color palettes. It is the primary UI for mood entry.

### Internationalization

i18next with English and Spanish locales in `src/i18n/locales/`. Language preference persists via MMKV. The device locale is detected on first launch.

### Imports

Use the `@/` path alias to import from the project root (e.g., `@/components/Button`).

### Code Quality

Biome (not ESLint/Prettier) handles linting and formatting. Config in `biome.json` — 100-char line width, single quotes, automatic import sorting. Pre-commit hooks run Biome on staged files via `lint-staged`.


# CLAUDE.md — Frontend Mobile Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 1 comparison rounds. Stop only when no visible differences remain or user says so.

## Brand Assets
- Always check the `assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- Shadows: Never use standard flat shadows, try to use color-tinted shadows, with low opacity. Build cross-platform layered depth. For iOS, use shadowColor, shadowOffset, shadowOpacity, and shadowRadius. For Android, map these to appropriate elevation values.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth. Use expo-linear-gradient or react-native-linear-gradient if it makes sense.
- **Animations:** Only animate using react-native-reanimated or the native Animated API with useNativeDriver: true. Prefer spring-based animations (withSpring) where it makes sense instead of linear timing.
- **Interactive states:** Every clickable element needs active states. Use <Pressable> with the ({ pressed }) => ... pattern or <TouchableOpacity activeOpacity={0.7}>
- **Images:** For image overlays, use <ImageBackground> and render a child <View> with a semi-transparent dark background (backgroundColor: 'rgba(0,0,0,0.6)') unless CSS blend modes are fully supported natively.
- **Spacing:** Use intentional, consistent spacing tokens (e.g., prefer multiples of 4 or 8) — not random pixel values.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
- Do not forget to handle status bar overlaps and safe area insets.
