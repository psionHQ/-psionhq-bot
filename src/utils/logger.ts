import { config } from '../config';

type LogMethod = 'log' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
} as const;

class Logger {
  private readonly level = config.logger.level;

  private shouldLog(level: keyof typeof LOG_LEVEL_PRIORITY): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }

  private write(method: LogMethod, level: keyof typeof LOG_LEVEL_PRIORITY, ...args: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    console[method](...args);
  }

  debug(...args: unknown[]): void {
    this.write('log', 'debug', ...args);
  }

  info(...args: unknown[]): void {
    this.write('log', 'info', ...args);
  }

  warn(...args: unknown[]): void {
    this.write('warn', 'warn', ...args);
  }

  error(...args: unknown[]): void {
    this.write('error', 'error', ...args);
  }
}

export const logger = new Logger();
