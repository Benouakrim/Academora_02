import { AppError } from '../utils/AppError';

// --- INTERFACE DEFINITION (For Redis/Memcached compatibility) ---
interface ICacheAdapter {
  isReady: boolean;
  connect(): Promise<void>;
  get<T>(key: string): T | undefined;
  set(key: string, value: any, ttl: number): void;
  del(key: string): boolean;
  delMany(keys: string[]): void;
  clear(): void;
}

interface CacheEntry {
  value: any;
  expires: number;
}

// --- TTL CONSTANTS ---
export const TTL_SHORT = 60000;   // 1 minute
export const TTL_LONG = 300000;   // 5 minutes
const CLEANUP_INTERVAL = 600000; // 10 minutes

/**
 * Default Cache Implementation using in-memory Map.
 * Implements ICacheAdapter for easy swapping with a Redis adapter.
 */
class InMemoryCacheAdapter implements ICacheAdapter {
  private cache = new Map<string, CacheEntry>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  public isReady = false;

  async connect(): Promise<void> {
    console.log('[Cache] Using In-Memory Cache (Development Mode).');
    this.startCleanupTimer();
    this.isReady = true;
    return;
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value as T;
  }

  set(key: string, value: any, ttl: number = TTL_LONG): void {
    if (!this.isReady) {
        throw new AppError(500, 'Cache not connected.');
    }
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  del(key: string): boolean {
    return this.cache.delete(key);
  }

  delMany(keys: string[]): void {
    keys.forEach(key => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
    console.log('[Cache] Cleared all in-memory cache entries.');
  }

  // Private method for garbage collection
  private startCleanupTimer() {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
        const now = Date.now();
        const initialSize = this.cache.size;
        const keysToDelete: string[] = [];
        
        this.cache.forEach((entry, key) => {
          if (entry.expires < now) {
            keysToDelete.push(key);
          }
        });
        
        keysToDelete.forEach(key => this.cache.delete(key));
        
        if (keysToDelete.length > 0) {
          console.log(`[Cache] Cleaned up ${keysToDelete.length} expired entries (New size: ${this.cache.size}).`);
        }
    }, CLEANUP_INTERVAL);
    
    // Ensure the process won't hang waiting for the timer
    if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref();
    }
  }

  // Method to manually stop the timer if needed
  public disconnect() {
      if (this.cleanupTimer) {
          clearInterval(this.cleanupTimer);
          this.cleanupTimer = null;
      }
      this.isReady = false;
      console.log('[Cache] In-Memory Cache stopped.');
  }

  /**
   * Reports the current status and size of the cache.
   */
  public getStats() {
    let expiredCount = 0;
    const now = Date.now();
    this.cache.forEach((entry) => {
        if (entry.expires < now) {
            expiredCount++;
        }
    });

    return {
      type: 'IN_MEMORY',
      size: this.cache.size,
      expired: expiredCount,
      hitRate: 0, // Placeholder for future metrics
      missRate: 0, // Placeholder for future metrics
      isReady: this.isReady,
    };
  }
}

// Export the singleton instance
export const Cache: ICacheAdapter = new InMemoryCacheAdapter();

// Export legacy function signatures for backward compatibility
export const get = <T>(key: string): T | undefined => Cache.get<T>(key);
export const set = (key: string, value: any, ttl: number = TTL_LONG): void => Cache.set(key, value, ttl);
export const del = (key: string): boolean => Cache.del(key);
export const delMany = (keys: string[]): void => Cache.delMany(keys);
export const clear = (): void => Cache.clear();

// HINT TO USER: You should call Cache.connect() in server/src/index.ts before starting the server.
