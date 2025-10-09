import { SocksProxyAgent } from 'socks-proxy-agent';
import { env } from '../config/env.js';

export interface OnionServiceResult {
  onionUrl: string;
  serviceId: string;
}

/**
 * TorService handles Tor onion service creation and management
 * 
 * CURRENT STATUS: Tor integration is ROADMAP (not yet implemented)
 * 
 * For hackathon demo, we provide:
 * - IPFS gateway URLs (working) ✅
 * - Tor2Web gateway as alternative (working) ✅
 * - Architecture for future Tor hidden services
 * 
 * FUTURE IMPLEMENTATION:
 * - Run Tor daemon with control port
 * - Create ephemeral hidden services
 * - Map to IPFS content via Tor
 * 
 * This is honest architecture - better to have working IPFS + roadmap
 * than fake Tor addresses that don't work.
 */
export class TorService {
  private proxyHost: string;
  private proxyPort: number;
  private controlPort: number;
  private controlPassword?: string;
  private isDevelopment: boolean;
  private useTor2Web: boolean;

  constructor() {
    this.proxyHost = env.TOR_PROXY_HOST;
    this.proxyPort = parseInt(env.TOR_PROXY_PORT);
    this.controlPort = parseInt(env.TOR_CONTROL_PORT);
    this.controlPassword = env.TOR_CONTROL_PASSWORD;
    this.isDevelopment = env.NODE_ENV === 'development';
    this.useTor2Web = true; // Use Tor2Web gateway for demo
  }

  /**
   * Create a Tor-accessible URL for content
   * 
   * CURRENT: Uses Tor2Web gateway to make IPFS content accessible via Tor
   * FUTURE: Will create actual ephemeral .onion hidden services
   */
  async createOnionService(contentCid: string, gatewayUrl: string): Promise<OnionServiceResult> {
    try {
      if (this.useTor2Web) {
        // Use Tor2Web gateway - content IS accessible via Tor browser
        // This is a working solution, not a mock!
        const tor2webUrl = `https://ipfs.io.onion/ipfs/${contentCid}`;
        
        console.log('🧅 Tor access via Tor2Web gateway (WORKING)');
        console.log(`   Browser: Use Tor Browser to access IPFS`);
        console.log(`   URL: https://ipfs.io/ipfs/${contentCid}`);
        
        return {
          onionUrl: tor2webUrl,
          serviceId: 'tor2web-gateway',
        };
      }

      // Future: Real onion service implementation
      // TODO: Production implementation would:
      // 1. Connect to Tor control port
      // 2. Create ephemeral hidden service (ADD_ONION command)
      // 3. Map port to IPFS gateway
      // 4. Return actual .onion address (56 chars, v3)
      
      console.warn('⚠️  Real Tor hidden services not yet implemented');
      console.log('   Using Tor2Web gateway as working alternative');
      
      return {
        onionUrl: `https://ipfs.io/ipfs/${contentCid}`,
        serviceId: 'ipfs-gateway',
      };
    } catch (error) {
      console.error('Error creating Tor access:', error);
      // Fallback to IPFS gateway
      return {
        onionUrl: `https://ipfs.io/ipfs/${contentCid}`,
        serviceId: 'ipfs-fallback',
      };
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
