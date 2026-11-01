import type { FastifyReply, FastifyRequest, preHandlerAsyncHookHandler } from 'fastify';
import { apiKeyService, type ApiKeyRecord } from '../services/ApiKeyService.js';

declare module 'fastify' {
  interface FastifyRequest {
    apiKey?: ApiKeyRecord;
  }
}

/** Extracts an API key from "Authorization: Bearer <key>" or "X-API-Key". */
export function extractApiKey(request: FastifyRequest): string | undefined {
  const authHeader = request.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = request.headers['x-api-key'];
  return typeof customHeader === 'string' ? customHeader.trim() : undefined;
}

/**
 * preHandler that requires a valid, active API key carrying `scope` (or "admin").
 * Attaches the key record to request.apiKey.
 */
export function requireScope(scope: string): preHandlerAsyncHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const rawKey = extractApiKey(request);
    if (!rawKey) {
      return reply.status(401).send({ success: false, error: 'API key required' });
    }
    const auth = apiKeyService.validateKey(rawKey, scope);
    if (!auth.valid || !auth.record) {
      return reply.status(auth.record ? 403 : 401).send({ success: false, error: auth.error || 'Invalid API key' });
    }
    request.apiKey = auth.record;
  };
}

/** preHandler applying the token-bucket limiter per API key (when present) or client IP. */
export function rateLimit(limitPerMin: number): preHandlerAsyncHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const rawKey = extractApiKey(request);
    const record = rawKey ? apiKeyService.validateKey(rawKey).record : undefined;
    const result = apiKeyService.checkRateLimit(record ? `key:${record.id}` : `ip:${request.ip}`, record?.rateLimitPerMin || limitPerMin);
    reply.header('X-RateLimit-Limit', result.limit);
    reply.header('X-RateLimit-Remaining', result.remaining);
    if (!result.allowed) {
      reply.header('Retry-After', result.retryAfterSec);
      return reply.status(429).send({ success: false, error: 'Too Many Requests: rate limit exceeded' });
    }
  };
}
