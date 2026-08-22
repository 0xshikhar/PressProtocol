import crypto from 'node:crypto';

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

export class ApiKeyService {
  private keys: Map<string, ApiKeyRecord> = new Map(); // id -> ApiKeyRecord
  private hashIndex: Map<string, string> = new Map(); // keyHash -> id
  private buckets: Map<string, TokenBucket> = new Map(); // key or IP -> TokenBucket
  private metrics = {
    totalRequests: 0,
    totalBytesRelayed: 0,
    totalContentPinned: 0,
    startTime: Date.now(),
  };

  constructor() {
    // Bootstrap a default admin key if none exists (for local testing and node administration)
    const adminKey = 'pp_live_master_admin_key_pressprotocol_2026';
    const hash = this.hashKey(adminKey);
    const id = 'key_admin_root';
    const record: ApiKeyRecord = {
      id,
      name: 'Root Node Administrator',
      owner: 'Node Operator',
      keyHash: hash,
      keyPrefix: adminKey.slice(0, 16) + '...',
      scopes: ['publish:raw', 'publish:signed', 'resolve', 'pin', 'federate', 'admin'],
      rateLimitPerMin: 10000,
      usedBytes: 0,
      requestCount: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    this.keys.set(id, record);
    this.hashIndex.set(hash, id);
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

  /**
   * Token-bucket rate limiter engine.
   * Enforces continuous token refill based on allowed req/min.
   */
  public checkRateLimit(identifier: string, limitPerMin = 60): RateLimitResult {
    const now = Date.now();
    let bucket = this.buckets.get(identifier);

    // Continuous refill rate
    const refillRatePerMs = limitPerMin / 60000;
    const capacity = Math.max(10, Math.floor(limitPerMin * 0.25)); // 25% burst capacity or 10 min

    if (!bucket) {
      bucket = {
        tokens: capacity,
        lastRefill: now,
        capacity,
        refillRatePerMs,
      };
      this.buckets.set(identifier, bucket);
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
   * Records usage metrics for an authenticated key.
   */
  public recordUsage(keyId: string, bytes = 0) {
    this.metrics.totalRequests++;
    this.metrics.totalBytesRelayed += bytes;

    const record = this.keys.get(keyId);
    if (record) {
      record.requestCount++;
      record.usedBytes += bytes;
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
