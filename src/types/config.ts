export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface EconomyConfig {
  maxSupply: number;
  initialSupply: number;
  treasuryWalletAddress: string;
  rewardPoolAddress: string;
  transferFeePercent: number;
  dailyRewardAmount: number;
}

export interface AppConfig {
  app: {
    nodeEnv: string;
    isDevelopment: boolean;
    isProduction: boolean;
  };
  bot: {
    token: string;
  };
  database: {
    url: string;
  };
  logger: {
    level: LogLevel;
  };
  economy: EconomyConfig;
}
