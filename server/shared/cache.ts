/**
 * Cache Module — In-memory cache with TTL for high-read, low-write data.
 * Reduces database load and unnecessary cryptographic operations.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheOptions {
  ttl: number; // Time-to-live in seconds
  maxSize?: number; // Maximum entries (default: 1000)
}

export class InMemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(options: CacheOptions) {
    this.ttlMs = options.ttl * 1000;
    this.maxSize = options.maxSize ?? 1000;

    // Cleanup expired entries every 30 seconds
    setInterval(() => this.cleanup(), 30_000).unref();
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.value;
  }

  set(key: string, value: T): void {
    // Evict oldest entries if at capacity
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) {
        this.store.delete(firstKey);
      }
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stats(): { hits: number; misses: number; size: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.store.size,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.store.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.store.delete(key));
  }
}

// ── Pre-configured cache instances ───────────────────────────
export const trackingDataCache = new InMemoryCache<unknown>({ ttl: 300 }); // 5min
export const systemConfigCache = new InMemoryCache<string>({ ttl: 600 }); // 10min
export const reconciliationStatsCache = new InMemoryCache<unknown>({ ttl: 120 }); // 2min
