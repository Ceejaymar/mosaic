import { getData, keyExists, removeData, saveData } from './mmkv-storage';

const prefix = 'settings:';

export function saveSetting<T>(name: string, value: T) {
  return saveData(`${prefix}${name}`, value);
}

export function getSetting(name: string) {
  return getData(`${prefix}${name}`);
}

export function settingExists(name: string) {
  return keyExists(`${prefix}${name}`);
}

export function removeSetting(name: string) {
  return removeData(`${prefix}${name}`);
}
