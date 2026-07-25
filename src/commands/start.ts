import { bot } from '../bot';
import { getMainMenuKeyboard } from '../utils/keyboard';
import { userService } from '../services';

/**
 * /start command handler
 * Displays welcome message with interactive main menu
 */
bot.start(async (ctx) => {
  let role: 'USER' | 'MODERATOR' | 'ADMIN' | undefined;

  if (ctx.from) {
    const user = await userService.registerOrUpdate({
      telegramId: ctx.from.id,
      username: ctx.from.username ?? null,
      firstName: ctx.from.first_name,
      languageCode: ctx.from.language_code,
    });
    role = user.role;
  }

  const welcomeMessage = `
👋 Добро пожаловать в PSI Network!

Это официальный бот проекта @PsionHQ.

Выберите интересующий вас раздел:
`;

  const keyboard = getMainMenuKeyboard(role);

  await ctx.reply(welcomeMessage, keyboard);
});
