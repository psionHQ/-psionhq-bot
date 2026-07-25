import { bot } from '../bot';
import { LANGUAGE_CALLBACKS, MENU_CALLBACKS } from '../constants/menu';
import { getLanguageSelectionKeyboard, getMenuItemByCallback } from '../utils/keyboard';
import { logger } from '../utils/logger';
import { userService, walletService } from '../services';
import type { User, UserLanguage, Wallet } from '../types';

/**
 * Development message for menu items under development
 */
const DEVELOPMENT_MESSAGE = '🚧 This section is under development.\n\nStay tuned for updates!';

const TRANSLATIONS = {
  en: {
    profileTitle: '👤 Your Profile',
    telegramId: 'Telegram ID',
    username: 'Username',
    firstName: 'First name',
    language: 'Language',
    role: 'Role',
    registeredAt: 'Registered',
    notSet: 'not set',
    languagePrompt: '🌍 Choose your preferred language:',
    languageUpdated: 'Language updated to English.',
  },
  ru: {
    profileTitle: '👤 Ваш профиль',
    telegramId: 'Telegram ID',
    username: 'Username',
    firstName: 'Имя',
    language: 'Язык',
    role: 'Роль',
    registeredAt: 'Дата регистрации',
    notSet: 'не указано',
    languagePrompt: '🌍 Выберите предпочитаемый язык:',
    languageUpdated: 'Язык изменен на русский.',
  },
} as const;

function formatProfileMessage(user: User): string {
  const language: UserLanguage = user.language;
  const text = TRANSLATIONS[language];
  const registrationDate = user.registeredAt.toISOString();
  const profileLanguage = language === 'ru' ? 'Русский' : 'English';

  return `
${text.profileTitle}

🆔 ${text.telegramId}: ${user.telegramId}
🏷️ ${text.username}: ${user.username ?? text.notSet}
👋 ${text.firstName}: ${user.firstName}
🗣️ ${text.language}: ${profileLanguage}
🎭 ${text.role}: ${user.role}
📅 ${text.registeredAt}: ${registrationDate}
  `.trim();
}

const WALLET_TRANSLATIONS = {
  en: {
    walletTitle: '💰 Your Wallet',
    address: 'Address',
    balance: 'Balance',
    registeredAt: 'Registered',
  },
  ru: {
    walletTitle: '💰 Ваш кошелёк',
    address: 'Адрес',
    balance: 'Баланс',
    registeredAt: 'Дата регистрации',
  },
} as const;

function formatWalletMessage(user: User, wallet: Wallet): string {
  const language: UserLanguage = user.language;
  const text = WALLET_TRANSLATIONS[language];

  return `
${text.walletTitle}

🏠 ${text.address}: ${wallet.address}
💎 ${text.balance}: ${wallet.balance} PSI
📅 ${text.registeredAt}: ${user.registeredAt.toISOString()}
  `.trim();
}

/**
 * Generic handler for menu items under development
 * This function can be reused for all menu callbacks
 *
 * @param callback - The callback action identifier for logging
 */
function handleMenuItemUnderDevelopment(callback: string) {
  return bot.action(callback, async (ctx) => {
    // Get menu item details for logging
    const menuItem = getMenuItemByCallback(callback);
    const itemName = menuItem?.label || 'Unknown';

    logger.info(`📌 User accessed: ${itemName} (${callback})`);

    // Answer the callback query (remove loading state)
    ctx.answerCbQuery();

    // Send development message
    await ctx.reply(DEVELOPMENT_MESSAGE);
  });
}

bot.action(MENU_CALLBACKS.PROFILE, async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery();
    return;
  }

  const user =
    (await userService.getByTelegramId(ctx.from.id)) ??
    (await userService.registerOrUpdate({
      telegramId: ctx.from.id,
      username: ctx.from.username ?? null,
      firstName: ctx.from.first_name,
      languageCode: ctx.from.language_code,
    }));

  await ctx.answerCbQuery();
  await ctx.reply(formatProfileMessage(user));
});

bot.action(MENU_CALLBACKS.LANGUAGE, async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery();
    return;
  }

  const user =
    (await userService.getByTelegramId(ctx.from.id)) ??
    (await userService.registerOrUpdate({
      telegramId: ctx.from.id,
      username: ctx.from.username ?? null,
      firstName: ctx.from.first_name,
      languageCode: ctx.from.language_code,
    }));

  await ctx.answerCbQuery();
  await ctx.reply(TRANSLATIONS[user.language].languagePrompt, getLanguageSelectionKeyboard());
});

bot.action(LANGUAGE_CALLBACKS.ENGLISH, async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery();
    return;
  }

  await userService.setLanguage(ctx.from.id, 'en');
  await ctx.answerCbQuery();
  await ctx.reply(TRANSLATIONS.en.languageUpdated);
});

bot.action(LANGUAGE_CALLBACKS.RUSSIAN, async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery();
    return;
  }

  await userService.setLanguage(ctx.from.id, 'ru');
  await ctx.answerCbQuery();
  await ctx.reply(TRANSLATIONS.ru.languageUpdated);
});

/**
 * Register all menu callbacks
 * When adding new menu items, register their callbacks here
 */

// Wallet menu item
bot.action(MENU_CALLBACKS.WALLET, async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery();
    return;
  }

  const user =
    (await userService.getByTelegramId(ctx.from.id)) ??
    (await userService.registerOrUpdate({
      telegramId: ctx.from.id,
      username: ctx.from.username ?? null,
      firstName: ctx.from.first_name,
      languageCode: ctx.from.language_code,
    }));

  let wallet = user.id !== undefined ? await walletService.getByUserId(user.id) : null;
  if (!wallet && user.id !== undefined) {
    wallet = await walletService.createForUser(user.id);
  }

  await ctx.answerCbQuery();

  if (!wallet) {
    await ctx.reply('⚠️ Wallet not available. Please try again later.');
    return;
  }

  await ctx.reply(formatWalletMessage(user, wallet));
});

// News menu item
handleMenuItemUnderDevelopment(MENU_CALLBACKS.NEWS);

// PSI Token menu item
handleMenuItemUnderDevelopment(MENU_CALLBACKS.TOKEN);

// Whitepaper menu item
handleMenuItemUnderDevelopment(MENU_CALLBACKS.WHITEPAPER);

// Roadmap menu item
handleMenuItemUnderDevelopment(MENU_CALLBACKS.ROADMAP);

// Website menu item
handleMenuItemUnderDevelopment(MENU_CALLBACKS.WEBSITE);

// Community menu item
handleMenuItemUnderDevelopment(MENU_CALLBACKS.COMMUNITY);

// About menu item
handleMenuItemUnderDevelopment(MENU_CALLBACKS.ABOUT);

logger.info('✅ Menu callbacks registered');
