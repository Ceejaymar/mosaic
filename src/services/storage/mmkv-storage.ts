import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

export function keyExists(key: string) {
  return storage.contains(key);
}
export function saveData<T>(key: string, value: T): void {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (e) {
    throw new Error(`Failed to save data: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

export function getData<T>(key: string): T | null {
  const value = storage.getString(key);

  if (value === undefined) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (e) {
    throw new Error(`Failed to parse data: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

export function removeData(key: string): void {
  try {
    storage.remove(key);
  } catch (e) {
    throw new Error(`Failed to remove data: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
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
