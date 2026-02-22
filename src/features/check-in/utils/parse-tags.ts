/**
 * Safely parses a JSON-serialised string[] from the `tags` column.
 * Returns an empty array for null, invalid JSON, or non-array values.
 */
export function parseStoredTags(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
