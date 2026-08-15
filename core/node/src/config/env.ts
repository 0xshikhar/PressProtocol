import { config } from 'dotenv';
import { z } from 'zod';

// Load .env file in development, but in production env vars come from platform
config({ path: process.env.NODE_ENV === 'production' ? undefined : '.env' });

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().optional().default(''),
  PINATA_API_KEY: z.string().optional().default(''),
  PINATA_SECRET_KEY: z.string().optional().default(''),
  PINATA_JWT: z.string().optional().default(''),
  IPFS_GATEWAY_URL: z.string().default('https://gateway.pinata.cloud/ipfs'),
  TOR_PROXY_HOST: z.string().default('localhost'),
  TOR_PROXY_PORT: z.string().default('9050'),
  TOR_CONTROL_PORT: z.string().default('9051'),
  TOR_CONTROL_PASSWORD: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().default('pressprotocol-sovereign-node-secret-key-32chars'),
  DATA_DIR: z.string().default(process.env.DATA_DIR || './.data'),
  NODE_ID: z.string().optional().default(''),
  NODE_NAME: z.string().default('PressProtocol Community Node'),
  AUTO_PIN_POLICY: z.enum(['all', 'followed', 'trending']).default('all'),
  TOR_ENABLED: z.string().default('true'),
  TOR_ONION_ADDRESS: z.string().optional(),
  FEDERATION_PSK: z.string().optional().default(''),
  PEER_WHITELIST: z.string().optional().default(''),
});

export type Env = z.infer<typeof envSchema>;

// Debug: Log environment mode
const isSovereignMode = !process.env.PINATA_API_KEY;
console.log(`🔍 PressProtocol Node Mode: ${isSovereignMode ? '🌱 Pure Sovereign (Helia/Tor)' : '⚡ Hybrid (Pinata/Cloud)'}`);
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '✅ External' : '📁 Embedded Store');
console.log('  - PINATA_API_KEY:', process.env.PINATA_API_KEY ? '✅ Set' : '⚪ Sovereign Mode');
console.log('  - DATA_DIR:', process.env.DATA_DIR || './.data');

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
