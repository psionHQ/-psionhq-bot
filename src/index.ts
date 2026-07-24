import "./config/env";
import "./bot";

import "./commands/start";
import "./commands/help";
import "./commands/about";
import "./commands/menu";

import { bot } from "./bot";
import { setupErrorHandler } from "./middleware/errorHandler";

setupErrorHandler(bot);

bot.launch();

console.log("🚀 PSI Bot is running...");
