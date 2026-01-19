# State Management (Zustand + MMKV Persist)

This document explains how Mosaic uses Zustand for state, and how state is persisted using MMKV.

## Why Zustand

Zustand is used as an ergonomic state container for app-level state:
- UI preferences (theme, language)
- onboarding flags
- small global UI state

Zustand is not used as a database.

## The App Store

File: `src/stores/useAppStore.ts`

State includes:
- `theme`
- `language`
- `hasOnboarded`

Actions include:
- `setTheme(theme)`
- `setLanguage(language)`
- `setHasOnboarded(hasOnboarded)`

### i18n integration

When `setLanguage` is called:
- `i18n.changeLanguage(language)` is executed immediately
- Zustand state is updated after that

This keeps UI language changes consistent with persisted state.

## Persistence with MMKV

We persist app state via:

- `persist(...)` middleware
- `createJSONStorage(() => mmkvAdapter)`

`mmkvAdapter` is the bridge from Zustand to MMKV.
It stores a JSON string under the key `app-storage`.

### Why `createJSONStorage`

Zustand expects a storage that returns/sets strings.
`createJSONStorage`:
- serializes Zustand state to JSON
- stores it using `mmkvAdapter.setItem`
- reads and parses it back on startup

## Partial persistence (partialize)

We use `partialize` to control exactly what is stored:

- `theme`
- `hasOnboarded`
- `language`

This protects us from accidentally persisting:
- ephemeral UI state
- non-serializable data
- large structures that should live in SQLite

## Default values and boot behavior

On first run:
- language defaults to `expo-localization` device language (fallback `en`)
- theme defaults to `light`
- hasOnboarded defaults to `false`

On subsequent runs:
- Zustand hydrates from MMKV
- stored values override defaults (for persisted keys)

## When to add more to the app store

Add a field to the store if:
- multiple screens need it
- it drives rendering or navigation
- it should persist across launches

Don’t add a field if:
- it’s derived from the DB
- it’s a large list
- it’s local to one screen

## How to add a new persisted preference

1) Add to `State` type
2) Add to store initializer in `persist((set) => ({ ... }))`
3) Add a setter to `Actions`
4) Add it to `partialize` if it should persist
5) Confirm it’s serializable JSON

Example additions:
- `emotionPaletteId: string`
- `setEmotionPaletteId(id: string)`

## Debugging persistence

- MMKV key for this store: `app-storage`
- Clearing persistence:
  - remove key `app-storage` from MMKV
  - or call `storage.clearAll()` in debug mode (careful)

If hydration fails:
- ensure `mmkvAdapter.getItem` returns `string | null`
- ensure stored value is valid JSON
- avoid persisting functions or classes (only plain JSON)
