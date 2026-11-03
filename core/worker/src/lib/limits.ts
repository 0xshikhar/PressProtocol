import { z } from 'zod';
import type { Context, MiddlewareHandler } from 'hono';
import type { Env } from '../types';

export const MAX_JSON_BODY_BYTES = 2 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif']);

const timestamp = z
  .string()
  .max(64)
  .refine((v) => !Number.isNaN(Date.parse(v)), 'timestamp must be a parseable date string');

const hex = (bytes: number) => z.string().regex(new RegExp(`^[0-9a-fA-F]{${bytes * 2}}$`));

const articleFields = {
  content: z.string().refine((v) => v.trim().length > 0, 'Content is required').refine(
    (v) => new TextEncoder().encode(v).length <= 1024 * 1024,
    'Content exceeds 1 MiB'
  ),
  tags: z.array(z.string().min(1).max(64)).max(20).default([]),
};

/** Title/content are validated but returned untouched so signatures still match. */
const untrimmedTitle = z
  .string()
  .max(500)
  .refine((v) => v.trim().length > 0, 'Title is required');

export const publishContentSchema = z.object({
  title: untrimmedTitle,
  content: articleFields.content,
  tags: articleFields.tags,
  timestamp: timestamp.optional(),
  publicKey: hex(32).optional(),
  signature: hex(64).optional(),
  walletAddress: z.string().max(128).optional(),
});

export const publishSignedSchema = publishContentSchema.extend({
  timestamp,
  publicKey: hex(32),
  signature: hex(64),
});

export const publishRawSchema = z.object({
  title: untrimmedTitle,
  content: articleFields.content,
  tags: articleFields.tags,
  format: z.string().max(32).optional(),
  author: z.string().max(200).optional(),
});

export function validationError(c: Context, error: z.ZodError) {
  return c.json(
    {
      success: false,
      error: error.issues[0]?.message || 'Invalid request body',
      issues: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    },
    400
  );
}

export function validateImageUpload(file: unknown): string | null {
  if (!(file instanceof File)) return 'A file field is required';
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return 'Only PNG, JPEG, GIF, WebP and AVIF images are accepted';
  if (file.size > MAX_UPLOAD_BYTES) return 'Image must be 10 MiB or smaller';
  return null;
}

type LimiterBinding = 'PUBLISH_LIMITER' | 'READ_LIMITER';

/**
 * Applies a Cloudflare Rate Limiting binding keyed by client IP (and route bucket).
 * When the binding is not configured (e.g. local dev), requests pass through.
 */
export function rateLimit(binding: LimiterBinding, bucket: string): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const limiter = c.env[binding];
    if (limiter) {
      const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
      const { success } = await limiter.limit({ key: `${bucket}:${ip}` });
      if (!success) {
        c.header('Retry-After', '60');
        return c.json({ success: false, error: 'Too many requests. Please retry shortly.' }, 429);
      }
    }
    await next();
  };
}
