import { bot } from '../bot';
import { getMainMenuKeyboard } from '../utils/keyboard';
import { userService } from '../services';

/**
 * /start command handler
 * Displays welcome message with interactive main menu.
 * Accepts an optional referral code as the start payload:
 *   https://t.me/PsionHQ_bot?start=<referralCode>
 */
bot.start(async (ctx) => {
  let role: 'USER' | 'MODERATOR' | 'ADMIN' | undefined;

  if (ctx.from) {
    const referredByCode = ctx.startPayload?.trim() || undefined;

    const user = await userService.registerOrUpdate({
      telegramId: ctx.from.id,
      username: ctx.from.username ?? null,
      firstName: ctx.from.first_name,
      languageCode: ctx.from.language_code,
      referredByCode: referredByCode ?? null,
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
