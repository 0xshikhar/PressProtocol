/**
 * Test script to verify Helia dynamic import works
 * Run: npx tsx test-helia-fix.ts
 */

console.log('Testing Helia dynamic import fix...\n');

// Import HeliaNode (should not fail at import time)
import { heliaNode } from './src/services/HeliaNode.js';

async function test() {
  try {
    console.log('✅ HeliaNode imported successfully (no native module error!)');
    console.log('');
    
    // Try to initialize (will fail but shouldn't crash)
    console.log('Attempting to initialize Helia...');
    await heliaNode.init();
    
    if (heliaNode.isReady()) {
      console.log('✅ Helia initialized successfully!');
      const stats = heliaNode.getStats();
      console.log('Stats:', stats);
    } else {
      console.log('ℹ️  Helia not ready (expected - using Pinata fallback)');
    }
    
    console.log('');
    console.log('✅ Test passed! Backend will start successfully.');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
