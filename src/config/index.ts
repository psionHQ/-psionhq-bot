import dotenv from 'dotenv';
import type { AppConfig, LogLevel } from '../types/config';

dotenv.config();

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  throw new Error('BOT_TOKEN environment variable is not set');
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const logLevel = (process.env.LOG_LEVEL ?? 'info') as LogLevel;

function parsePositiveFloat(value: string | undefined, name: string, defaultValue: number): number {
  if (value === undefined || value === '') return defaultValue;
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative finite number, got: ${value}`);
  }
  return parsed;
}

export const config: AppConfig = {
  app: {
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  },
  bot: {
    token: botToken,
  },
  database: {
    url: databaseUrl,
  },
  logger: {
    level: logLevel,
  },
  economy: {
    maxSupply: parsePositiveFloat(process.env.PSI_MAX_SUPPLY, 'PSI_MAX_SUPPLY', 1_000_000_000),
    initialSupply: parsePositiveFloat(process.env.PSI_INITIAL_SUPPLY, 'PSI_INITIAL_SUPPLY', 0),
    treasuryWalletAddress: process.env.TREASURY_WALLET ?? 'PSI_TREASURY',
    rewardPoolAddress: process.env.REWARD_POOL ?? 'PSI_REWARD_POOL',
    transferFeePercent: parsePositiveFloat(process.env.TRANSFER_FEE_PERCENT, 'TRANSFER_FEE_PERCENT', 0.5),
    dailyRewardAmount: parsePositiveFloat(process.env.DAILY_REWARD_AMOUNT, 'DAILY_REWARD_AMOUNT', 10),
  },
};
