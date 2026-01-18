import { contains, getJSON, remove, setJSON } from './mmkv';

const prefix = 'settings:';
const key = (name: string) => `${prefix}${name}`;

export function saveSetting<T>(name: string, value: T) {
  return setJSON(key(name), value);
}

export function getSetting(name: string) {
  return getJSON(key(name));
}

export function settingExists(name: string) {
  return contains(key(name));
}

export function removeSetting(name: string) {
  return remove(key(name));
}
