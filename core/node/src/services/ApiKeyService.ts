import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { JsonFileStore } from '../lib/json-store.js';

export interface ApiKeyRecord {
  id: string;
  name: string;
  owner: string;
  keyHash: string; // SHA-256 hex
  keyPrefix: string; // e.g. "pp_live_7a3f..."
  scopes: string[]; // 'publish:raw', 'publish:signed', 'resolve', 'pin', 'federate', 'admin'
  rateLimitPerMin: number;
  maxBytes?: number;
  usedBytes: number;
  requestCount: number;
  createdAt: string;
  revokedAt?: string;
  isActive: boolean;
}

export interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRatePerMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSec?: number;
}

const MAX_BUCKETS = 10_000;
const BUCKET_TTL_MS = 60 * 60 * 1000; // evict buckets idle for an hour
const FLUSH_INTERVAL_MS = 30_000;

/**
 * API key management. Only SHA-256 hashes are kept; records persist to
 * DATA_DIR/keys/api-keys.json so keys and their scopes survive restarts.
 * There is no baked-in credential: an admin key comes from ADMIN_API_KEY or is
 * generated once, printed to the log, and persisted.
 */
export class ApiKeyService {
  private keys: Map<string, ApiKeyRecord> = new Map(); // id -> ApiKeyRecord
  private hashIndex: Map<string, string> = new Map(); // keyHash -> id
  private buckets: Map<string, TokenBucket> = new Map(); // key or IP -> TokenBucket
  private store = new JsonFileStore<ApiKeyRecord[]>('keys/api-keys.json', () => []);
  private dirty = false;
  private metrics = {
    totalRequests: 0,
    totalBytesRelayed: 0,
    totalContentPinned: 0,
    startTime: Date.now(),
  };

  constructor() {
    for (const record of this.store.load()) {
      this.keys.set(record.id, record);
      this.hashIndex.set(record.keyHash, record.id);
    }
    this.bootstrapAdminKey();
    setInterval(() => {
      if (this.dirty) {
        this.persist();
      }
    }, FLUSH_INTERVAL_MS).unref();
  }

  private bootstrapAdminKey(): void {
    if (Array.from(this.keys.values()).some((k) => k.isActive && k.scopes.includes('admin'))) {
      // An env-supplied key still takes precedence even if persisted keys exist
      if (env.ADMIN_API_KEY && !this.hashIndex.has(this.hashKey(env.ADMIN_API_KEY))) {
        this.registerAdminKey(env.ADMIN_API_KEY, 'Node Administrator (env)');
      }
      return;
    }
    if (env.ADMIN_API_KEY) {
      this.registerAdminKey(env.ADMIN_API_KEY, 'Node Administrator (env)');
      return;
    }
    const generated = this.generateKey({
      name: 'Node Administrator (bootstrap)',
      owner: 'Node Operator',
      scopes: ['admin'],
      rateLimitPerMin: 10000,
    });
    console.log('🔑 Generated a one-time admin API key for this node (stored as a hash only):');
    console.log(`   ${generated.key}`);
    console.log('   Save it now; it will not be printed again.');
  }

  private registerAdminKey(rawKey: string, name: string): void {
    const record: ApiKeyRecord = {
      id: `key_${crypto.randomBytes(8).toString('hex')}`,
      name,
      owner: 'Node Operator',
      keyHash: this.hashKey(rawKey),
      keyPrefix: rawKey.slice(0, 16) + '...',
      scopes: ['admin'],
      rateLimitPerMin: 10000,
      usedBytes: 0,
      requestCount: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    this.keys.set(record.id, record);
    this.hashIndex.set(record.keyHash, record.id);
    this.persist();
  }

  private persist(): void {
    this.store.save(Array.from(this.keys.values()));
    this.dirty = false;
  }

  public hashKey(rawKey: string): string {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  /**
   * Generates a new cryptographically secure API key.
   * Returns the plaintext key once (node only stores the SHA-256 hash).
   */
  public generateKey(options: {
    name: string;
    owner?: string;
    scopes?: string[];
    rateLimitPerMin?: number;
    maxBytes?: number;
    isTest?: boolean;
  }): { key: string; record: ApiKeyRecord } {
    const prefix = options.isTest ? 'pp_test_' : 'pp_live_';
    const randomHex = crypto.randomBytes(24).toString('hex');
    const rawKey = `${prefix}${randomHex}`;
    const hash = this.hashKey(rawKey);

    const id = `key_${crypto.randomBytes(8).toString('hex')}`;
    const defaultScopes = ['publish:raw', 'publish:signed', 'resolve'];
    const rateLimit = options.rateLimitPerMin || 60; // 60 req/min default

    const record: ApiKeyRecord = {
      id,
      name: options.name,
      owner: options.owner || 'External Developer',
      keyHash: hash,
      keyPrefix: rawKey.slice(0, 16) + '...',
      scopes: options.scopes && options.scopes.length > 0 ? options.scopes : defaultScopes,
      rateLimitPerMin: rateLimit,
      maxBytes: options.maxBytes,
      usedBytes: 0,
      requestCount: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    this.keys.set(id, record);
    this.hashIndex.set(hash, id);
    this.persist();

    return { key: rawKey, record };
  }

  /**
   * Validates an incoming raw API key against stored SHA-256 hashes and verifies required scopes.
   */
  public validateKey(rawKey: string, requiredScope?: string): {
    valid: boolean;
    record?: ApiKeyRecord;
    error?: string;
  } {
    if (!rawKey) {
      return { valid: false, error: 'Missing API key' };
    }

    const hash = this.hashKey(rawKey);
    const keyId = this.hashIndex.get(hash);
    if (!keyId) {
      return { valid: false, error: 'Invalid or unrecognized API key' };
    }

    const record = this.keys.get(keyId);
    if (!record || !record.isActive) {
      return { valid: false, error: 'API key is revoked or deactivated' };
    }

    if (requiredScope) {
      const hasScope = record.scopes.includes(requiredScope) || record.scopes.includes('admin');
      if (!hasScope) {
        return {
          valid: false,
          record,
          error: `API key lacks required scope: "${requiredScope}". Assigned scopes: [${record.scopes.join(', ')}]`,
        };
      }
    }

    return { valid: true, record };
  }

  private evictStaleBuckets(now: number): void {
    for (const [id, bucket] of this.buckets) {
      if (now - bucket.lastRefill > BUCKET_TTL_MS) {
        this.buckets.delete(id);
      }
    }
  }

  /**
   * Token-bucket rate limiter engine.
   * Enforces continuous token refill based on allowed req/min. The bucket map is
   * bounded (stale entries evicted, hard cap) so hostile traffic cannot grow memory.
   */
  public checkRateLimit(identifier: string, limitPerMin = 60): RateLimitResult {
    const now = Date.now();
    let bucket = this.buckets.get(identifier);

    // Continuous refill rate
    const refillRatePerMs = limitPerMin / 60000;
    const capacity = Math.max(10, Math.floor(limitPerMin * 0.25)); // 25% burst capacity or 10 min

    if (!bucket) {
      if (this.buckets.size >= MAX_BUCKETS) {
        this.evictStaleBuckets(now);
      }
      if (this.buckets.size >= MAX_BUCKETS) {
        // Still full of hot buckets: degrade to a strict shared bucket rather than unbounded memory
        identifier = '__overflow__';
        bucket = this.buckets.get(identifier);
      }
      if (!bucket) {
        bucket = {
          tokens: capacity,
          lastRefill: now,
          capacity,
          refillRatePerMs,
        };
        this.buckets.set(identifier, bucket);
      }
    } else {
      // Calculate token replenishment
      const elapsed = now - bucket.lastRefill;
      bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsed * bucket.refillRatePerMs);
      bucket.lastRefill = now;
    }

    const resetTimeMs = Math.ceil((bucket.capacity - bucket.tokens) / bucket.refillRatePerMs);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        limit: limitPerMin,
        remaining: Math.floor(bucket.tokens),
        resetTimeMs,
      };
    } else {
      const retryAfterSec = Math.ceil(1 / (bucket.refillRatePerMs * 1000));
      return {
        allowed: false,
        limit: limitPerMin,
        remaining: 0,
        resetTimeMs,
        retryAfterSec: Math.max(1, retryAfterSec),
      };
    }
  }

  /**
   * Records usage metrics for an authenticated key (flushed to disk periodically).
   */
  public recordUsage(keyId: string, bytes = 0) {
    this.metrics.totalRequests++;
    this.metrics.totalBytesRelayed += bytes;

    const record = this.keys.get(keyId);
    if (record) {
      record.requestCount++;
      record.usedBytes += bytes;
      this.dirty = true;
    }
  }

  /**
   * Revokes an API key.
   */
  public revokeKey(id: string): boolean {
    const record = this.keys.get(id);
    if (!record) return false;

    record.isActive = false;
    record.revokedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  /**
   * Lists all keys for the admin dashboard (censoring private hashes).
   */
  public listKeys(): ApiKeyRecord[] {
    return Array.from(this.keys.values()).map((k) => ({ ...k }));
  }

  /**
   * Returns enterprise node throughput and gateway metrics.
   */
  public getMetrics() {
    const uptimeSec = Math.floor((Date.now() - this.metrics.startTime) / 1000);
    const activeKeys = Array.from(this.keys.values()).filter((k) => k.isActive).length;

    return {
      uptimeSeconds: uptimeSec,
      totalRequests: this.metrics.totalRequests,
      totalBytesRelayed: this.metrics.totalBytesRelayed,
      activeKeysCount: activeKeys,
      requestsPerSecond: uptimeSec > 0 ? (this.metrics.totalRequests / uptimeSec).toFixed(2) : '0.00',
    };
  }
}

export const apiKeyService = new ApiKeyService();
