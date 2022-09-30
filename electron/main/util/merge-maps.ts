export function mergeMaps<K, T>(maps: Array<Map<K, T> | undefined | null>): Map<K, T> {
  const newMap = new Map<K, T>();
  for (const map of maps) {
    if (!map) {
      continue;
    }
    for (const [key, value] of map) {
      newMap.set(key, value);
    }
  }
  return newMap;
}
