import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  API_URL: z.string().url().default('http://localhost:3001'),
  
  DATABASE_URL: z.string().url(),
  
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  REDIS_URL: z.string().url().optional(),
  
  CORS_ORIGIN: z.string().default('*'),
  
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  MAX_FILE_SIZE_MB: z.string().default('5'),
  UPLOAD_DIR: z.string().default('./uploads'),
  
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  MOCK_MODE: z.string().transform((val) => val === 'true').default('true'),
  
  YANGO_API_URL: z.string().url().optional(),
  YANGO_API_KEY: z.string().optional(),
  YANGO_CLIENT_ID: z.string().optional(),
  YANGO_PARTNER_ID: z.string().optional(),
  
  WAVE_API_URL: z.string().url().optional(),
  WAVE_API_KEY: z.string().optional(),
  WAVE_MERCHANT_ID: z.string().optional(),
  
  ORANGE_MONEY_API_URL: z.string().url().optional(),
  ORANGE_MONEY_API_KEY: z.string().optional(),
  ORANGE_MONEY_MERCHANT_ID: z.string().optional(),
  
  MTN_MOMO_API_URL: z.string().url().optional(),
  MTN_MOMO_API_KEY: z.string().optional(),
  
  WHATSAPP_API_URL: z.string().url().optional(),
  WHATSAPP_API_KEY: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  
  UFFIZIO_API_URL: z.string().url().optional(),
  UFFIZIO_API_KEY: z.string().optional(),
  
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  
  SMS_PROVIDER: z.string().optional(),
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER_ID: z.string().optional(),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().default('./logs/app.log'),
  
  BCRYPT_ROUNDS: z.string().default('12'),
});

// Validate and parse environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

const env = parseEnv();

// Export configuration object
export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  apiUrl: env.API_URL,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  database: {
    url: env.DATABASE_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  redis: {
    url: env.REDIS_URL,
  },

  cors: {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  },

  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },

  upload: {
    maxFileSizeMB: parseInt(env.MAX_FILE_SIZE_MB, 10),
    maxFileSizeBytes: parseInt(env.MAX_FILE_SIZE_MB, 10) * 1024 * 1024,
    uploadDir: env.UPLOAD_DIR,
  },

  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
    enabled: Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY),
  },

  integrations: {
    mockMode: env.MOCK_MODE,
    yango: {
      apiUrl: env.YANGO_API_URL,
      apiKey: env.YANGO_API_KEY,
      clientId: env.YANGO_CLIENT_ID,
      partnerId: env.YANGO_PARTNER_ID,
      enabled: Boolean(env.YANGO_API_URL && env.YANGO_API_KEY),
    },
    wave: {
      apiUrl: env.WAVE_API_URL,
      apiKey: env.WAVE_API_KEY,
      merchantId: env.WAVE_MERCHANT_ID,
      enabled: Boolean(env.WAVE_API_URL && env.WAVE_API_KEY),
    },
    orangeMoney: {
      apiUrl: env.ORANGE_MONEY_API_URL,
      apiKey: env.ORANGE_MONEY_API_KEY,
      merchantId: env.ORANGE_MONEY_MERCHANT_ID,
      enabled: Boolean(env.ORANGE_MONEY_API_URL && env.ORANGE_MONEY_API_KEY),
    },
    mtnMomo: {
      apiUrl: env.MTN_MOMO_API_URL,
      apiKey: env.MTN_MOMO_API_KEY,
      enabled: Boolean(env.MTN_MOMO_API_URL && env.MTN_MOMO_API_KEY),
    },
    whatsapp: {
      apiUrl: env.WHATSAPP_API_URL,
      apiKey: env.WHATSAPP_API_KEY,
      phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
      enabled: Boolean(env.WHATSAPP_API_URL && env.WHATSAPP_API_KEY),
    },
    uffizio: {
      apiUrl: env.UFFIZIO_API_URL,
      apiKey: env.UFFIZIO_API_KEY,
      enabled: Boolean(env.UFFIZIO_API_URL && env.UFFIZIO_API_KEY),
    },
  },

  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : undefined,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.SMTP_FROM || 'noreply@damafrica.com',
    enabled: Boolean(env.SMTP_HOST && env.SMTP_USER),
  },

  sms: {
    provider: env.SMS_PROVIDER,
    apiKey: env.SMS_API_KEY,
    senderId: env.SMS_SENDER_ID || 'DAM_AFRICA',
    enabled: Boolean(env.SMS_PROVIDER && env.SMS_API_KEY),
  },

  logging: {
    level: env.LOG_LEVEL,
    filePath: env.LOG_FILE_PATH,
  },

  security: {
    bcryptRounds: parseInt(env.BCRYPT_ROUNDS, 10),
  },
} as const;

export default config;
