import { bot } from '../bot';
import { getMainMenuKeyboard } from '../utils/keyboard';

/**
 * /start command handler
 * Displays welcome message with interactive main menu
 */
bot.start(async (ctx) => {
  const welcomeMessage = `
👋 Добро пожаловать в PSI Network!

Это официальный бот проекта @PsionHQ.

Выберите интересующий вас раздел:
`;

  const keyboard = getMainMenuKeyboard();

  await ctx.reply(welcomeMessage, keyboard);
});
