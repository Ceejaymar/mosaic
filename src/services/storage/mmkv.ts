import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export const mmkvAdapter = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.remove(key),
} satisfies {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export function contains(key: string) {
  try {
    return storage.contains(key);
  } catch {
    return false;
  }
}

export function remove(key: string): void {
  try {
    storage.remove(key);
  } catch (e) {
    throw new Error(`Failed to remove data: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

export function clearAllData(): void {
  storage.clearAll();
}

export function setJSON<T>(key: string, value: T): void {
  try {
    storage.set(key, JSON.stringify(value));
  } catch {
    throw new Error(`Failed to set data: ${key}`);
  }
}

export function getJSON<T>(key: string): T | null {
  const value = storage.getString(key);

  if (value === undefined) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    console.warn(`Removing invalid JSON data: ${key}`);
    storage.remove(key);
    return null;
  }
}
