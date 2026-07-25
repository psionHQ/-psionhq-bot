import { bot } from '../bot';
import { getMainMenuKeyboard } from '../utils/keyboard';
import { userService } from '../services';

/**
 * /start command handler
 * Displays welcome message with interactive main menu
 */
bot.start(async (ctx) => {
  if (ctx.from) {
    await userService.registerOrUpdate({
      telegramId: ctx.from.id,
      username: ctx.from.username ?? null,
      firstName: ctx.from.first_name,
      languageCode: ctx.from.language_code,
    });
  }

  const welcomeMessage = `
👋 Добро пожаловать в PSI Network!

Это официальный бот проекта @PsionHQ.

Выберите интересующий вас раздел:
`;

  const keyboard = getMainMenuKeyboard();

  await ctx.reply(welcomeMessage, keyboard);
});
