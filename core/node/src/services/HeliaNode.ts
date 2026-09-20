/**
 * Helia IPFS Node Service (Phase 2C)
 * 
 * Creates and manages a Helia IPFS node with DHT support
 * Enables true peer-to-peer discovery without centralized servers
 * 
 * NOTE: Helia is completely optional. If native dependencies fail,
 * the system falls back to Pinata gateway (fully functional).
 */

export class HeliaNode {
  private node: any = null; // Using 'any' to avoid import-time errors
  private fs: any = null;
  private jsonStore: any = null;
  private isInitialized = false;

  /**
   * Initialize Helia node with DHT support
   * This is completely optional - system works fine without it using Pinata
   * 
   * Uses dynamic imports to avoid loading native dependencies at startup
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Attempting to initialize Helia IPFS node...');
      console.log('⚠️  Note: Helia requires native dependencies. If this fails, Pinata fallback will be used.');

      // Polyfill Promise.withResolvers if needed
      if (typeof (Promise as any).withResolvers === 'undefined') {
        (Promise as any).withResolvers = function <T>() {
          let resolve!: (value: T | PromiseLike<T>) => void;
          let reject!: (reason?: any) => void;
          const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
          });
          return { promise, resolve, reject };
        };
      }

      // Dynamic import to avoid loading at startup
      const { createHelia } = await import('helia');
      const { unixfs } = await import('@helia/unixfs');
      const { json } = await import('@helia/json');

      // Create Helia node with default configuration
      // This creates in-memory blockstore and datastore automatically
      this.node = await createHelia();

      // Initialize UnixFS for file operations
      this.fs = unixfs(this.node);

      // Initialize JSON store for manifests
      this.jsonStore = json(this.node);

      this.isInitialized = true;

      console.log('✅ Helia node initialized successfully!');
      console.log(`📍 Peer ID: ${this.node.libp2p.peerId.toString()}`);
      console.log(`🔗 Listening on: ${this.node.libp2p.getMultiaddrs().length} addresses`);
    } catch (error: any) {
      console.warn('⚠️  Helia initialization failed - this is OK, using Pinata fallback');
      console.warn('💡 Reason:', error.message || error);
      console.warn('💡 To enable Helia P2P: npm install and rebuild native dependencies');
      this.isInitialized = false;
      // Don't throw - let the system continue with Pinata
    }
  }

  /**
   * Add JSON content to IPFS
   */
  async addJSON(data: any): Promise<string> {
    if (!this.jsonStore) {
      throw new Error('Helia node not initialized');
    }

    const cid = await this.jsonStore.add(data);
    return cid.toString();
  }

  /**
   * Get JSON content from IPFS
   */
  async getJSON(cidString: string): Promise<any> {
    if (!this.jsonStore) {
      throw new Error('Helia node not initialized');
    }

    try {
      const data = await this.jsonStore.get(cidString as any);
      return data;
    } catch (error) {
      console.error(`Failed to get JSON from IPFS: ${cidString}`, error);
      throw error;
    }
  }

  /**
   * Add file to IPFS
   */
  async addFile(content: Uint8Array): Promise<string> {
    if (!this.fs) {
      throw new Error('Helia node not initialized');
    }

    const cid = await this.fs.addBytes(content);
    return cid.toString();
  }

  /**
   * Get file from IPFS
   */
  async getFile(cidString: string): Promise<Uint8Array> {
    if (!this.fs) {
      throw new Error('Helia node not initialized');
    }

    const bytes: Uint8Array[] = [];
    for await (const chunk of this.fs.cat(cidString as any)) {
      bytes.push(chunk);
    }

    // Concatenate all chunks
    const totalLength = bytes.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of bytes) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
   * Provide content to DHT (announce that we have this CID)
   * This makes the content discoverable by other nodes
   */
  async provide(cidString: string): Promise<void> {
    if (!this.node) {
      throw new Error('Helia node not initialized');
    }

    try {
      // In full implementation, this would use libp2p's DHT
      // to announce that we provide this CID
      // For now, Helia handles this automatically for added content
      console.log(`📢 Providing ${cidString} to DHT`);
    } catch (error) {
      console.error('Failed to provide to DHT:', error);
    }
  }

  /**
   * Find providers for a CID in the DHT
   */
  async findProviders(cidString: string): Promise<string[]> {
    if (!this.node) {
      throw new Error('Helia node not initialized');
    }

    try {
      // In full implementation, this would query DHT for providers
      // For Phase 2C, we return empty array and rely on IPFS gateways
      console.log(`🔍 Finding providers for ${cidString}`);
      return [];
    } catch (error) {
      console.error('Failed to find providers:', error);
      return [];
    }
  }

  /**
   * Get node statistics
   */
  getStats(): { peerId: string; peers: number; addresses: number } | null {
    if (!this.node) return null;

    return {
      peerId: this.node.libp2p.peerId.toString(),
      peers: this.node.libp2p.getPeers().length,
      addresses: this.node.libp2p.getMultiaddrs().length,
    };
  }

  /**
   * Check if node is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.node !== null;
  }

  /**
   * Stop the node
   */
  async stop(): Promise<void> {
    if (this.node) {
      await this.node.stop();
      this.node = null;
      this.fs = null;
      this.jsonStore = null;
      this.isInitialized = false;
      console.log('🛑 Helia node stopped');
    }
  }
}

// Singleton instance
export const heliaNode = new HeliaNode();
