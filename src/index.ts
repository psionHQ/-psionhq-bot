import "./config/env";
import "./bot";

import "./commands/start";
import "./commands/help";
import "./commands/about";
import "./commands/menu";

import { bot } from "./bot";
import { setupErrorHandler } from "./middleware/errorHandler";

setupErrorHandler(bot);

// Graceful shutdown handlers
process.once('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  bot.stop('SIGTERM');
});

bot.launch();

console.log("🚀 PSI Bot is running...");
