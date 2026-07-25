import { Telegraf } from 'telegraf';
import { logger } from '../utils/logger';

export function setupErrorHandler(bot: Telegraf) {
  bot.catch((err, ctx) => {
    logger.error('Bot error:', {
      error: err instanceof Error ? err.message : String(err),
      updateType: ctx.updateType,
      userId: ctx.from?.id,
    });

    // Attempt to notify user of error (best effort, no await needed for fire-and-forget)
    ctx.reply('❌ An error occurred. Please try again later.').catch(() => {
      logger.error('Failed to send error message to user');
    });
  });
}
