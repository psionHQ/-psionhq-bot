import { bot } from "../bot";

bot.command("help", async (ctx) => {
  await ctx.reply(`
📖 Доступные команды:

/start — начало работы
/help — помощь
/about — информация о проекте PSI
  `);
});