export class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end to show that it was recently used
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  put(key: K, value: V): void {
    // If cache is at max size, remove the first (least recently used) item
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
}

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

// @ts-ignore
import { unsafeWindow } from '$';

// Save the original fetch method for later use
const originalFetch = unsafeWindow.fetch;

/**
 * Fetch Flow data from the specified URL
 * @param dataUrl The URL to request
 */
export async function getFlowData(dataUrl: string) {
  const newResp = await originalFetch(new Request(dataUrl));
  const newJson = await newResp.json();
  return newJson;
}