# Mosaic Architecture

This document describes the current architecture for Mosaic (Expo + React Native) and the guiding rules that keep the codebase maintainable as the app grows (and later adds Supabase/PowerSync).

## Goals

- **Local-first**: app works fully offline.
- **Fast UI**: smooth lists and transitions even with lots of mood entries.
- **Clear separation of concerns**: screens don’t talk directly to the database.
- **Future-proof**: adding Supabase / sync later should not require rewriting UI.

## Tech stack (current)

- **App**: Expo + TypeScript + Expo Router
- **Local DB**: Expo SQLite + Drizzle ORM
- **KV storage**: MMKV (fast key/value) for preferences
- **State management**: Zustand (primarily UI + app state)
- **i18n**: i18next + react-i18next + expo-localization
- **A11y**: documented rules + accessible primitives (in progress)

## Folder structure (high-level)

- `app/`
  - Screens/routes (Expo Router)

- `src/`
  - `db/`
    - `schema.ts` — Drizzle schema (single source of truth)
    - `client.ts` — SQLite connection + Drizzle client
    - `repos/` — DB access layer (all queries live here)
  - `services/`
    - `storage/`
      - `mmkv.ts` — MMKV helpers + Zustand storage adapter
  - `stores/`
    - `useAppStore.ts` — persisted app preferences (theme, onboarding, etc.)
  - `data/`
    - `emotions/` — emotion catalog + palettes (static domain data)
  - `i18n/` — translations + setup
  - `components/` — UI primitives + screens/components

- `docs/` — architecture, a11y, db, etc.
- `drizzle/` — generated migrations (commit to git)
- `drizzle.config.ts` — drizzle-kit config

## Data ownership rules (source of truth)

### 1) SQLite (Drizzle) = source of truth for user-generated records

Use SQLite for data that grows over time and needs querying:

- Mood entries (multiple per day)
- Journals/notes tied to entries
- Any future history / analytics / trends

**Why**: queryable, scalable, reliable persistence.

### 2) MMKV = source of truth for small app preferences / flags

Use MMKV for small, frequently accessed settings:

- Language
- App theme (light/dark/system)
- Emotion palette selection (color accessibility themes)
- Onboarding completion
- Feature flags / last-seen version

**Why**: extremely fast and simple; not suitable for large record sets.

### 3) Zustand = state container, not a database

Use Zustand for:

- UI state (current selections, modals, temporary state)
- App preferences only when persisted via the MMKV adapter

Avoid putting large historical data (mood entries lists) into Zustand.
Instead, query SQLite and keep results in component state (or use live queries later).

## Domain model guidance

### Stable IDs from day one

All persisted entities should use **UUID string IDs** (no auto-increment).
This maps cleanly to Postgres/Supabase later and avoids collisions.

### Timestamps

Maintain three distinct time concepts:

- `occurredAt`: when the mood happened (user intent)
- `createdAt`: when the record was created locally
- `updatedAt`: last modification time (helps with later sync/conflicts)

### Day lookup key

Store `dateKey` as `YYYY-MM-DD` (derived from `occurredAt`, using user-local logic).
This makes “today”, “month grid”, and streak queries fast.

## Database layer

### Drizzle schema

- Single source of truth: `src/db/schema.ts`
- Migrations generated via `drizzle-kit` into `/drizzle`

### Migrations (boot process)

- Migrations run during app boot in `app/_layout.tsx`
- Splash screen remains visible until:
  - fonts are loaded
  - migrations succeed
- This prevents blank-frame flicker and ensures tables exist before queries.

### Live updates (optional)

SQLite is opened with `enableChangeListener: true` to support Drizzle live queries later.

## Repository pattern (critical boundary)

Screens and components should not import `db` directly.

Instead, all data operations go through repo modules, e.g.:

- `src/db/repos/moodRepo.ts`
  - `addMoodEntry()`
  - `listByDate(dateKey)`
  - `listRecent(limit)`
  - `deleteById(id)`

Benefits:

- UI doesn’t care whether storage is SQLite today or PowerSync tomorrow
- Easy to test
- One place to enforce conventions (UUIDs, timestamps, dateKey logic)

## Static domain data (Emotions + palettes)

Emotions are defined as a static catalog in code for now.

- `emotionId` is the stable identifier stored in entries
- UI labels can be i18n keys (`labelKey`)
- Colors come from a separate **emotion palette theme**, not the app theme

Key rule: store `emotionId` in DB, derive display label + color from catalog + selected palette.

## Internationalization (i18n)

- UI strings live in locale files (namespaces)
- Long-form educational content may be:
  - i18n namespaces (JSON) for moderate text, or
  - Markdown per locale (preferred for large articles)

Language selection is persisted in MMKV and loaded during app boot.
