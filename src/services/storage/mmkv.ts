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
  } catch (e) {
    throw new Error(
      `Failed to check key existence: ${e instanceof Error ? e.message : 'Unknown error'}`,
    );
  }
}

export function remove(key: string): void {
  try {
    storage.remove(key);
  } catch (e) {
    throw new Error(`Failed to remove data: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

export function setJSON<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function getJSON<T>(key: string): T | null {
  const value = storage.getString(key);
  if (value === undefined) {
    return null;
  }
  return JSON.parse(value) as T;
}

export function clearAllData(): void {
  try {
    storage.clearAll();
  } catch (e) {
    throw new Error(
      `Failed to clear all data: ${e instanceof Error ? e.message : 'Unknown error'}`,
    );
  }
}
