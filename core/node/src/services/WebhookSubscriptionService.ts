import crypto from 'node:crypto';
import { generateWebhookSecret, signWebhookPayload } from '../lib/webhook-crypto.js';

export type WebhookEventType =
  | 'article.published'
  | 'article.verified'
  | 'mirror.health_changed'
  | '*';

export interface WebhookDeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  deliveredCount: number;
  failureCount: number;
  lastDeliveryStatus?: 'success' | 'failed';
  lastDeliveryAt?: string;
  lastStatusCode?: number;
  lastLatencyMs?: number;
  lastError?: string;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  owner: string;
  description?: string;
  status: 'active' | 'disabled';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats: WebhookDeliveryStats;
}

export interface CreateSubscriptionInput {
  url: string;
  events?: WebhookEventType[];
  secret?: string;
  owner?: string;
  description?: string;
}

export interface WebhookEventEnvelope {
  id: string;
  event: WebhookEventType;
  timestamp: string;
  data: any;
}

export class WebhookSubscriptionService {
  private subscriptions: Map<string, WebhookSubscription> = new Map();

  /**
   * Registers a new outbound webhook subscription.
   */
  public createSubscription(input: CreateSubscriptionInput): WebhookSubscription {
    if (!input.url || typeof input.url !== 'string') {
      throw new Error('Valid destination URL is required');
    }

    try {
      const parsed = new URL(input.url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('URL must use http: or https: protocol');
      }
    } catch {
      throw new Error(`Invalid webhook URL: "${input.url}"`);
    }

    const id = `sub_${crypto.randomBytes(8).toString('hex')}`;
    const secret = input.secret?.trim() || generateWebhookSecret();
    const events: WebhookEventType[] = input.events && input.events.length > 0 ? input.events : ['*'];
    const now = new Date().toISOString();

    const subscription: WebhookSubscription = {
      id,
      url: input.url.trim(),
      events,
      secret,
      owner: input.owner || 'default',
      description: input.description,
      status: 'active',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      stats: {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        deliveredCount: 0,
        failureCount: 0,
      },
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  /**
   * Lists all registered subscriptions, optionally filtered by owner.
   */
  public listSubscriptions(owner?: string): WebhookSubscription[] {
    const list = Array.from(this.subscriptions.values());
    if (owner) {
      return list.filter((s) => s.owner === owner);
    }
    return list;
  }

  /**
   * Retrieves a single subscription by ID.
   */
  public getSubscription(id: string): WebhookSubscription | undefined {
    return this.subscriptions.get(id);
  }

  /**
   * Revokes and removes a subscription.
   */
  public deleteSubscription(id: string): boolean {
    return this.subscriptions.delete(id);
  }

  /**
   * Dispatches an event to all matching active subscriptions asynchronously.
   */
  public async dispatch(eventType: WebhookEventType, data: any): Promise<number> {
    const envelope: WebhookEventEnvelope = {
      id: `evt_${crypto.randomBytes(8).toString('hex')}`,
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    const targetSubscriptions = Array.from(this.subscriptions.values()).filter(
      (sub) => sub.isActive && (sub.events.includes('*') || sub.events.includes(eventType))
    );

    // Fire deliveries asynchronously
    for (const sub of targetSubscriptions) {
      this.deliverPayload(sub, envelope).catch((err) => {
        console.warn(`[Webhook] Delivery failed for ${sub.url}:`, err.message);
      });
    }

    return targetSubscriptions.length;
  }

  /**
   * Delivers a signed payload to a subscription endpoint with exponential retry.
   */
  public async deliverPayload(
    sub: WebhookSubscription,
    envelope: WebhookEventEnvelope,
    retryCount: number = 0
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    const serializedPayload = JSON.stringify(envelope);
    const { header } = signWebhookPayload(serializedPayload, sub.secret);
    const startTime = performance.now();

    sub.stats.totalDeliveries++;
    sub.stats.lastDeliveryAt = new Date().toISOString();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(sub.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PressProtocol-Webhook/1.0',
          'X-PressProtocol-Signature': header,
          'X-PressProtocol-Event': envelope.event,
          'X-PressProtocol-Delivery': envelope.id,
        },
        body: serializedPayload,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      sub.stats.lastStatusCode = res.status;
      sub.stats.lastLatencyMs = Math.round(performance.now() - startTime);

      if (res.ok) {
        sub.stats.successfulDeliveries++;
        sub.stats.deliveredCount = sub.stats.successfulDeliveries;
        sub.stats.lastDeliveryStatus = 'success';
        delete sub.stats.lastError;
        return { success: true, statusCode: res.status };
      } else {
        sub.stats.failedDeliveries++;
        sub.stats.failureCount = sub.stats.failedDeliveries;
        sub.stats.lastDeliveryStatus = 'failed';
        sub.stats.lastError = `HTTP ${res.status}: ${res.statusText}`;

        // Retry on 5xx server errors up to 2 times
        if (res.status >= 500 && retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 500; // 500ms, 1000ms
          await new Promise((r) => setTimeout(r, delay));
          return this.deliverPayload(sub, envelope, retryCount + 1);
        }

        return { success: false, statusCode: res.status, error: sub.stats.lastError };
      }
    } catch (err: any) {
      sub.stats.lastLatencyMs = Math.round(performance.now() - startTime);
      sub.stats.failedDeliveries++;
      sub.stats.failureCount = sub.stats.failedDeliveries;
      sub.stats.lastDeliveryStatus = 'failed';
      sub.stats.lastError = err.message || 'Connection error';

      // Retry on network errors
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 500;
        await new Promise((r) => setTimeout(r, delay));
        return this.deliverPayload(sub, envelope, retryCount + 1);
      }

      return { success: false, error: sub.stats.lastError };
    }
  }

  /**
   * Sends an immediate test ping event to verify a subscription endpoint.
   */
  public async triggerTestPing(id: string): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    const sub = this.subscriptions.get(id);
    if (!sub) {
      throw new Error(`Subscription with ID "${id}" not found`);
    }

    const testEnvelope: WebhookEventEnvelope = {
      id: `evt_ping_${crypto.randomBytes(4).toString('hex')}`,
      event: 'article.published',
      timestamp: new Date().toISOString(),
      data: {
        ping: true,
        message: 'PressProtocol outbound webhook connectivity verification test',
        cid: 'bafkreifg43jdwfgeebl6fkt6ntem6xsw5pp54ttnuzb6rffil36jtjukq4',
        title: 'Connectivity Test Article',
      },
    };

    return this.deliverPayload(sub, testEnvelope);
  }
}

export const webhookSubscriptionService = new WebhookSubscriptionService();
