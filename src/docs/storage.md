# Storage (MMKV, Settings, SecureStore)

This document explains how Mosaic stores data locally and why we use different stores for different types of data.

## Storage layers

### 1) MMKV (fast key/value)
**Use for**: small preferences and app settings that are frequently read.

Examples:
- language (`en`, `es`)
- app theme (`light`, `dark`)
- emotion palette theme (color accessibility palettes)
- onboarding flags
- feature flags

**Do not use for**:
- lists of user-generated records (mood entries, journal history)
  - those belong in SQLite/Drizzle

### 2) SecureStore (encrypted key/value)
**Use for**: secrets or sensitive values that should be encrypted at rest.

Examples:
- auth tokens / refresh tokens
- encryption keys
- API keys (if any)
- “remember me” session credentials

**Do not use for**:
- large objects or frequent writes
- non-sensitive preferences (use MMKV)

### 3) SQLite/Drizzle
**Use for**: records and history (mood entries, notes, trends).
Not covered in this doc.

---

## MMKV implementation

### `src/services/storage/mmkv.ts`

We create a single MMKV instance:

- `storage = createMMKV()`

We also expose:

1) `mmkvAdapter` — a minimal (string-only) adapter used by Zustand `persist` via `createJSONStorage`.
2) JSON helpers (`setJSON`, `getJSON`) for any non-string data we choose to store in MMKV directly.

### Why there are two access patterns

- `mmkvAdapter.getItem/setItem/removeItem`
  - returns and stores raw strings
  - required by Zustand persist storage interface

- `setJSON/getJSON`
  - stores typed JSON under a key (stringified)
  - includes parsing guard + corruption cleanup

### JSON parsing safety

`getJSON`:
- returns `null` if not found
- if JSON is invalid:
  - logs a warning
  - removes the key
  - returns `null`

This prevents hydration crashes if storage gets corrupted.

---

## Settings wrapper

### `src/services/storage/settings.ts`

Settings are a convenience layer on top of MMKV JSON helpers.

All keys are namespaced with a prefix:

- Prefix: `settings:`
- Key format: `settings:<name>`

Functions:
- `saveSetting(name, value)` -> `setJSON("settings:name", value)`
- `getSetting(name)` -> `getJSON("settings:name")`
- `settingExists(name)` -> `contains("settings:name")`
- `removeSetting(name)` -> `remove("settings:name")`

### When to use `settings:*` vs Zustand persisted state

- Use **Zustand persisted state** for settings that affect UI flow and are accessed frequently inside components.
  - Example: theme, language, onboarding

- Use **settings wrapper** for “misc settings” that don’t need to live in app state or don’t need reactive UI updates.
  - Example: last seen “what’s new” version, debug flags, optional user toggles

Rule of thumb:
- If the UI should instantly react to changes: put it in Zustand and persist it.
- If it’s read occasionally and doesn’t drive rendering: store it as a setting.

---

## SecureStore implementation

### `src/services/storage/secureStore.ts`

SecureStore helpers store and retrieve JSON-encoded values:

- `saveSecureItem(key, value)` -> JSON.stringify + SecureStore.setItemAsync
- `getSecureItem(key)` -> SecureStore.getItemAsync + JSON.parse
- `deleteSecureItem(key)` -> SecureStore.deleteItemAsync

Notes:
- SecureStore operations are async and slower than MMKV.
- Use SecureStore sparingly (secrets only).

---

## What goes where (Mosaic rules)

### Use MMKV (via Zustand persist) for:
- `language`
- `theme`
- `hasOnboarded`
- `emotionPaletteId` (planned)

### Use Settings wrapper for:
- non-reactive toggles
- debug flags
- last seen version / “what’s new” state
- temporary feature flags

### Use SecureStore for:
- auth session tokens
- encryption keys
- anything that would be harmful if extracted from the device

### Use SQLite for:
- mood entries
- journaling history
- any list that grows over time

---

## Key naming conventions

- Zustand persist:
  - `app-storage` (single root key for app store)
- Settings:
  - `settings:<name>`
- SecureStore:
  - `secure:<feature>:<name>` (recommended prefix; enforce later)

---

## Gotchas

- Don’t store “big arrays of mood entries” in MMKV.
- Don’t store “non-secret preferences” in SecureStore.
- If you change the shape of persisted Zustand state, consider migration strategy:
  - add defaults
  - use `partialize` to persist only stable fields
  - avoid breaking changes to persisted structures
