import { config } from 'dotenv';
import { z } from 'zod';

config();

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

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
