/**
 * PressProtocol Sovereign Web Clipper - Shared TypeScript Type Definitions
 */

export interface ClipperTelemetry {
  scriptsPurged: number;
  trackingPixelsPurged: number;
  trackingParamsPurged: number;
  inlineHandlersPurged: number;
  surveillanceElementsPurged: number;
  totalPurged: number;
  originalByteSize: number;
  cleanedByteSize: number;
  wordCount: number;
  readingTimeMinutes: number;
  purgedTrackersSummary: string[];
}

export interface ClippedArticle {
  title: string;
  author: string;
  excerpt: string;
  contentHtml: string;
  textContent: string;
  canonicalUrl: string;
  publishedAt: string;
  siteName: string;
  tags: string[];
  wordCount: number;
  readingTimeMinutes: number;
  telemetry: ClipperTelemetry;
}

export interface SovereignScrap {
  id: string;
  quote: string;
  url: string;
  pageTitle: string;
  timestamp: number;
}

export interface ExtensionSettings {
  apiUrl: string;
  webAppUrl: string;
  autoCopyPermalink: boolean;
  signWithBurnerKey: boolean;
}

export interface MirrorEndpointStatus {
  available: boolean;
  latency?: number;
  url?: string;
}

export interface MirrorTelemetry {
  ipfs: MirrorEndpointStatus;
  tor: MirrorEndpointStatus;
  gateway: MirrorEndpointStatus;
}

export interface PublishResult {
  success: boolean;
  cid: string;
  shareUrl: string;
  mirrors?: {
    ipfs?: string | MirrorEndpointStatus;
    tor?: string | MirrorEndpointStatus;
    gateway?: string | MirrorEndpointStatus;
  };
  author: string;
}
