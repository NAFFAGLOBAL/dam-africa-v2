import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/damflotte'),

  // JWT
  JWT_SECRET: z.string().default('dev-secret-change-in-production'),
  JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret-change-in-production'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Logging
  LOG_LEVEL: z.string().default('info'),

  // Wave Mobile Money
  WAVE_API_URL: z.string().default('https://api.wave.com/v1'),
  WAVE_API_KEY: z.string().default(''),
  WAVE_WEBHOOK_SECRET: z.string().default(''),
  WAVE_CURRENCY: z.string().default('XOF'),

  // Uffizio GPS Tracking
  UFFIZIO_API_URL: z.string().default('https://api.uffizio.com'),
  UFFIZIO_USERNAME: z.string().default(''),
  UFFIZIO_PASSWORD: z.string().default(''),
  UFFIZIO_RATE_LIMIT_MS: z.coerce.number().default(180000),

  // Yango Integration
  YANGO_API_URL: z.string().default('https://fleet-api.taxi.yandex.net'),
  YANGO_CLIENT_ID: z.string().default(''),
  YANGO_API_KEY: z.string().default(''),
  YANGO_PARK_ID: z.string().default(''),

  // SMTP
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('noreply@damflotte.ci'),

  // File uploads
  MAX_FILE_SIZE: z.coerce.number().default(10 * 1024 * 1024),
  UPLOAD_DIR: z.string().default('./uploads'),
});

type EnvConfig = z.infer<typeof envSchema>;

function loadConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Configuration invalide:', result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const config = loadConfig();
