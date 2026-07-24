import "./config/env";
import "./bot";

import "./commands/start";
import "./commands/help";
import "./commands/about";

import { bot } from "./bot";

bot.launch();

console.log("🚀 PSI Bot is running...");