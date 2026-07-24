import { bot } from "../bot";

bot.command("about", async (ctx) => {
  await ctx.reply(`
🧠 PSI Network

⚛️ Quantum Blockchain
🔐 Secure Infrastructure
🌍 Decentralized Ecosystem

Official Bot:
@PsionHQ_bot
  `);
});