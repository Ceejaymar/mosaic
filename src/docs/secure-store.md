# Secure Storage (Expo SecureStore)

This document explains how Mosaic uses Expo SecureStore, what should be stored there, and the rules we follow to avoid security and reliability issues.

## What SecureStore is for

SecureStore is used for sensitive values that should be encrypted at rest on the device.

Use SecureStore for:
- Auth session tokens (access/refresh tokens)
- Encryption keys (if you add local encryption later)
- Secrets that could cause harm if extracted from the device

Do not use SecureStore for:
- Large objects or frequently updated values
- Non-sensitive preferences (theme, language, palette) — use MMKV
- User-generated records (mood entries, journals) — use SQLite

Why:
- SecureStore is asynchronous and typically slower than MMKV.
- Some platforms may have stricter limits and behavior differences.
- It’s best treated as a “keychain/vault” for small secrets.

## Current implementation

File: src/services/storage/secureStore.ts

We provide JSON wrappers so SecureStore can store typed values.

saveSecureItem<T>(key, value)
- Serializes value using JSON.stringify
- Stores it via SecureStore.setItemAsync
- Throws a generic error on failure

getSecureItem<T>(key)
- Reads a string via SecureStore.getItemAsync
- Returns null if not found
- Parses JSON and returns the typed value
- Returns null on parse/read errors (and logs)

deleteSecureItem(key)
- Deletes the key via SecureStore.deleteItemAsync
- Logs errors but does not throw

## Key naming conventions

To avoid collisions and make debugging easier, prefix secure keys.

Recommended format:
- secure:<feature>:<name>

Examples:
- secure:auth:session
- secure:auth:refreshToken
- secure:crypto:localKey

Rule:
- If a key is sensitive, it must start with secure:

## Example usage (future auth)

Example (pseudo-code):
- Save tokens under secure:auth:session
- Read tokens from secure:auth:session
- Delete tokens on logout by deleting secure:auth:session

(We avoid including fenced code blocks here to prevent renderer issues.)

## What not to store here

Mood entries:
- Never store mood entries in SecureStore.
- They belong in SQLite (Drizzle). SecureStore is not a database.

UI preferences:
- Theme/language/emotion palette are not secrets.
- Store these in MMKV (Zustand persist), not SecureStore.

## Error-handling rules

- Writes (saveSecureItem) should throw so callers can react (show error, retry).
- Reads (getSecureItem) should return null on failure so the app doesn’t crash on corrupted data.
- Deletes (deleteSecureItem) should not crash the app; log errors and continue.

## Migration strategy

If the stored data structure changes (for example, session format changes):
- Treat SecureStore values as optional
- If parsing fails, return null and force a re-auth flow
- Prefer storing small, stable data shapes
- Avoid frequent format changes

## Operational guidelines

- Keep SecureStore usage minimal and centralized (only through secureStore.ts).
- Avoid calling SecureStore on hot UI paths (like every render).
- Read secrets once at boot (or on demand) and keep them in memory if needed.
- Always clear secure keys on logout or account switch.

## Security notes

SecureStore improves local at-rest security, but it is not a full threat model solution.
- If a device is compromised (jailbroken/rooted), any local secret could be at risk.
- Treat SecureStore as a best-practice baseline, not a guarantee.
- For high-security flows, consider server-side protections and token rotation.

## Checklist

- [ ] Sensitive key uses secure: prefix
- [ ] No user-generated record data stored in SecureStore
- [ ] Reads handle missing/corrupted data without crashing
- [ ] Secure keys cleared on logout/account change
