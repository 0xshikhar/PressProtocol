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
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }
  const customHeader = request.headers['x-api-key'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }
  return undefined;
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

/**
 * preHandler that validates the API key and `scope` when an API key is provided
 * (or when REQUIRE_API_KEY=true), while allowing unauthenticated requests in
 * open community-node mode so existing SDK/web callers continue to work.
 */
export function optionalScope(scope: string): preHandlerAsyncHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const rawKey = extractApiKey(request);
    if (!rawKey) {
      if (process.env.REQUIRE_API_KEY === 'true') {
        return reply.status(401).send({ success: false, error: 'API key required' });
      }
      return;
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
    const record = request.apiKey ?? (extractApiKey(request) ? apiKeyService.validateKey(extractApiKey(request)!).record : undefined);
    const result = apiKeyService.checkRateLimit(record ? `key:${record.id}` : `ip:${request.ip}`, record?.rateLimitPerMin || limitPerMin);
    reply.header('X-RateLimit-Limit', result.limit);
    reply.header('X-RateLimit-Remaining', result.remaining);
    if (!result.allowed) {
      reply.header('Retry-After', result.retryAfterSec);
      return reply.status(429).send({ success: false, error: 'Too Many Requests: rate limit exceeded' });
    }
  };
}
