// src/lib/utils/cache.ts
export class Cache<T> {
  private store = new Map<string, { value: T; expiry: number }>();

  constructor(private readonly defaultTtlMs: number = 60_000) {}

  set(key: string, value: T, ttlMs: number = this.defaultTtlMs): void {
    this.store.set(key, { value, expiry: Date.now() + ttlMs });
  }

  get(key: string): T | null {
    const item = this.store.get(key);
    if (!item || Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }
}
