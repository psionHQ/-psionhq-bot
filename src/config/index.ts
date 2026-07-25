import dotenv from 'dotenv';
import type { AppConfig, LogLevel } from '../types/config';

dotenv.config();

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  throw new Error('BOT_TOKEN environment variable is not set');
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const logLevel = (process.env.LOG_LEVEL ?? 'info') as LogLevel;

export const config: AppConfig = {
  app: {
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  },
  bot: {
    token: botToken,
  },
  logger: {
    level: logLevel,
  },
};
