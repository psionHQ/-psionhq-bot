import dotenv from "dotenv";
import { Telegraf } from "telegraf";

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN not found in .env");
}

const bot = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply(
    "👋 Добро пожаловать в PsionHQ!\n\n" +
    "Это официальный бот проекта PSI."
  );
});

bot.help((ctx) => {
  ctx.reply(
    "Доступные команды:\n" +
    "/start — Запуск\n" +
    "/help — Помощь\n" +
    "/about — О проекте"
  );
});

bot.command("about", (ctx) => {
  ctx.reply(
    "🚀 PsionHQ\n\n" +
    "Экосистема нового поколения."
  );
});

bot.launch();

console.log("✅ PsionHQ Bot запущен!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));