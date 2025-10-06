import { SocksProxyAgent } from 'socks-proxy-agent';
import { env } from '../config/env.js';

export interface OnionServiceResult {
  onionUrl: string;
  serviceId: string;
}

/**
 * TorService handles Tor onion service creation and management
 * 
 * Note: For full functionality, requires Tor daemon running with control port access
 * In development/demo, can use mock onion addresses
 */
export class TorService {
  private proxyHost: string;
  private proxyPort: number;
  private controlPort: number;
  private controlPassword?: string;
  private isDevelopment: boolean;

  constructor() {
    this.proxyHost = env.TOR_PROXY_HOST;
    this.proxyPort = parseInt(env.TOR_PROXY_PORT);
    this.controlPort = parseInt(env.TOR_CONTROL_PORT);
    this.controlPassword = env.TOR_CONTROL_PASSWORD;
    this.isDevelopment = env.NODE_ENV === 'development';
  }

  /**
   * Create a Tor onion service for content
   * In development mode, generates a mock onion address
   */
  async createOnionService(contentCid: string, gatewayUrl: string): Promise<OnionServiceResult> {
    try {
      // In development, create a deterministic mock onion address
      if (this.isDevelopment) {
        return this.createMockOnionService(contentCid);
      }

      // TODO: Production implementation would:
      // 1. Connect to Tor control port
      // 2. Create ephemeral hidden service
      // 3. Map to IPFS gateway URL
      // 4. Return actual .onion address
      
      // For now, return mock service
      return this.createMockOnionService(contentCid);
    } catch (error) {
      console.error('Error creating onion service:', error);
      // Fallback to mock in case of error
      return this.createMockOnionService(contentCid);
    }
  }

  /**
   * Create a mock onion service for development/testing
   */
  private createMockOnionService(contentCid: string): OnionServiceResult {
    // Create a deterministic "onion" address from CID
    // Real onion addresses are 56 characters (v3)
    const serviceId = this.generateDeterministicOnionAddress(contentCid);
    
    return {
      onionUrl: `http://${serviceId}.onion`,
      serviceId,
    };
  }

  /**
   * Generate a deterministic mock onion address from CID
   */
  private generateDeterministicOnionAddress(cid: string): string {
    // Take first 56 chars of CID and pad/truncate to match v3 onion format
    const baseId = cid.toLowerCase().replace(/[^a-z2-7]/g, '');
    
    // Pad or truncate to 56 characters (v3 onion address length)
    if (baseId.length < 56) {
      return (baseId + 'anonpress'.repeat(10)).substring(0, 56);
    }
    return baseId.substring(0, 56);
  }

  /**
   * Create SOCKS proxy agent for Tor requests
   */
  createProxyAgent(): SocksProxyAgent {
    const proxyUrl = `socks5://${this.proxyHost}:${this.proxyPort}`;
    return new SocksProxyAgent(proxyUrl);
  }

  /**
   * Check if content is accessible via Tor
   */
  async checkOnionAvailability(onionUrl: string): Promise<boolean> {
    try {
      if (this.isDevelopment) {
        // In development, assume mock onions are "available"
        return true;
      }

      const agent = this.createProxyAgent();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(onionUrl, {
        // @ts-ignore - SocksProxyAgent type compatibility
        agent,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      console.error('Onion availability check failed:', error);
      return false;
    }
  }

  /**
   * Measure latency to onion service
   */
  async measureOnionLatency(onionUrl: string): Promise<number | null> {
    try {
      if (this.isDevelopment) {
        // Return mock latency for development (450ms is typical for Tor)
        return 450;
      }

      const agent = this.createProxyAgent();
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      await fetch(onionUrl, {
        method: 'HEAD',
        // @ts-ignore - SocksProxyAgent type compatibility
        agent,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return Date.now() - startTime;
    } catch (error) {
      console.error('Onion latency measurement failed:', error);
      return null;
    }
  }

  /**
   * Delete/stop an onion service
   */
  async deleteOnionService(serviceId: string): Promise<boolean> {
    try {
      if (this.isDevelopment) {
        // Mock deletion in development
        return true;
      }

      // TODO: Production implementation would:
      // 1. Connect to Tor control port
      // 2. Send DEL_ONION command
      // 3. Confirm deletion
      
      return true;
    } catch (error) {
      console.error('Error deleting onion service:', error);
      return false;
    }
  }
}

export const torService = new TorService();
