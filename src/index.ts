import "./config";
import "./bot";

import "./commands/start";
import "./commands/help";
import "./commands/about";
import "./commands/menu";

import { bot } from "./bot";
import { setupErrorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

setupErrorHandler(bot);

// Graceful shutdown handlers
process.once('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  bot.stop('SIGTERM');
});

bot.launch();

logger.info("🚀 PSI Bot is running...");
