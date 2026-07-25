export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

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
}
