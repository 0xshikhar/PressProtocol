import { config } from 'dotenv';
import { z } from 'zod';

// Load .env file in development, but in production env vars come from platform
config({ path: process.env.NODE_ENV === 'production' ? undefined : '.env' });

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  PINATA_API_KEY: z.string(),
  PINATA_SECRET_KEY: z.string(),
  PINATA_JWT: z.string(),
  IPFS_GATEWAY_URL: z.string().default('https://gateway.pinata.cloud/ipfs'),
  TOR_PROXY_HOST: z.string().default('localhost'),
  TOR_PROXY_PORT: z.string().default('9050'),
  TOR_CONTROL_PORT: z.string().default('9051'),
  TOR_CONTROL_PASSWORD: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;

// Debug: Log all available environment variables (without values for security)
console.log('🔍 Available environment variables:', Object.keys(process.env).sort().join(', '));
console.log('🔍 Required variables check:');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('  - PINATA_API_KEY:', process.env.PINATA_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  - PINATA_SECRET_KEY:', process.env.PINATA_SECRET_KEY ? '✅ Set' : '❌ Missing');
console.log('  - PINATA_JWT:', process.env.PINATA_JWT ? '✅ Set' : '❌ Missing');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  console.error('\n📋 Railway Setup Instructions:');
  console.error('1. Go to your Railway dashboard');
  console.error('2. Select your BACKEND SERVICE (not project settings)');
  console.error('3. Click "Variables" tab');
  console.error('4. Add each variable individually (not as a file)');
  console.error('5. Click "Deploy" to restart with new variables\n');
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
