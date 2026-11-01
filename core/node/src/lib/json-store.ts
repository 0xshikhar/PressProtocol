import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { env } from '../config/env.js';

/**
 * Small durable JSON file store under DATA_DIR (atomic write via rename, owner-only permissions).
 * Used for operator state that must survive restarts: API key hashes and webhook subscriptions.
 */
export class JsonFileStore<T> {
  private readonly filePath: string;

  constructor(relativePath: string, private readonly fallback: () => T, dataDir?: string) {
    this.filePath = join(dataDir || env.DATA_DIR, relativePath);
  }

  load(): T {
    try {
      if (existsSync(this.filePath)) {
        return JSON.parse(readFileSync(this.filePath, 'utf-8')) as T;
      }
    } catch (err) {
      console.warn(`⚠️  Could not read ${this.filePath}; starting from defaults:`, err);
    }
    return this.fallback();
  }

  save(data: T): void {
    try {
      mkdirSync(dirname(this.filePath), { recursive: true, mode: 0o700 });
      const tmp = `${this.filePath}.tmp.${process.pid}`;
      writeFileSync(tmp, JSON.stringify(data, null, 2), { encoding: 'utf-8', mode: 0o600 });
      renameSync(tmp, this.filePath);
    } catch (err) {
      console.error(`❌ Failed to persist ${this.filePath}:`, err);
    }
  }
}
