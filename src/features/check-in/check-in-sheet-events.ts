/**
 * Module-level pub/sub for opening the check-in sheet from any context
 * (e.g. the global tab bar FAB). Kept intentionally minimal — no external deps.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

/** Subscribe to the open-sheet event. Returns an unsubscribe function. */
export function onOpenCheckInSheet(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Fire the open-sheet event to all current subscribers. */
export function emitOpenCheckInSheet(): void {
  for (const l of listeners) l();
}
