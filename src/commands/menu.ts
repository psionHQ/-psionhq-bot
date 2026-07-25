import { bot } from '../bot';
import { LANGUAGE_CALLBACKS, MENU_CALLBACKS } from '../constants/menu';
import { getLanguageSelectionKeyboard, getMenuItemByCallback } from '../utils/keyboard';
import { logger } from '../utils/logger';
import { ledgerService, userService, walletService } from '../services';
import type { Transaction, User, UserLanguage, Wallet } from '../types';

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

const HISTORY_TRANSLATIONS = {
  en: {
    title: '📜 Transaction History',
    empty: 'No transactions yet.',
    amount: 'Amount',
    date: 'Date',
    incoming: 'Incoming',
    outgoing: 'Outgoing',
    mint: 'Mint',
    burn: 'Burn',
    reward: 'Reward',
    fee: 'Fee',
    transfer: 'Transfer',
    failed: 'Failed',
    pending: 'Pending',
    completed: 'Completed',
  },
  ru: {
    title: '📜 История транзакций',
    empty: 'Транзакций пока нет.',
    amount: 'Сумма',
    date: 'Дата',
    incoming: 'Входящая',
    outgoing: 'Исходящая',
    mint: 'Минт',
    burn: 'Сжигание',
    reward: 'Награда',
    fee: 'Комиссия',
    transfer: 'Перевод',
    failed: 'Ошибка',
    pending: 'В ожидании',
    completed: 'Выполнено',
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

function formatHistoryTimestamp(date: Date, language: UserLanguage): string {
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function getTransactionTypeLabel(transaction: Transaction, language: UserLanguage): string {
  const text = HISTORY_TRANSLATIONS[language];

  switch (transaction.type) {
    case 'MINT':
      return text.mint;
    case 'BURN':
      return text.burn;
    case 'REWARD':
      return text.reward;
    case 'FEE':
      return text.fee;
    default:
      return text.transfer;
  }
}

function getTransactionStatusLabel(transaction: Transaction, language: UserLanguage): string {
  const text = HISTORY_TRANSLATIONS[language];

  switch (transaction.status) {
    case 'FAILED':
      return text.failed;
    case 'PENDING':
      return text.pending;
    default:
      return text.completed;
  }
}

function formatHistoryMessage(user: User, wallet: Wallet, transactions: Transaction[]): string {
  const language: UserLanguage = user.language;
  const text = HISTORY_TRANSLATIONS[language];

  if (transactions.length === 0) {
    return `${text.title}\n\n${text.empty}`;
  }

  const rows = transactions.map((transaction) => {
    const isIncoming = transaction.toWalletId === wallet.id;
    const directionIcon = isIncoming ? '📥' : '📤';
    const directionLabel = isIncoming ? text.incoming : text.outgoing;
    const typeLabel = getTransactionTypeLabel(transaction, language);
    const statusLabel = getTransactionStatusLabel(transaction, language);
    const timestamp = formatHistoryTimestamp(transaction.createdAt, language);

    return `${directionIcon} ${directionLabel} · ${typeLabel} · ${statusLabel}
💎 ${text.amount}: ${transaction.amount} PSI
📅 ${text.date}: ${timestamp}`;
  });

  return `${text.title}\n\n${rows.join('\n\n')}`;
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

bot.action(MENU_CALLBACKS.HISTORY, async (ctx) => {
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

  const history = await ledgerService.getHistory(wallet.id, 10);
  await ctx.reply(formatHistoryMessage(user, wallet, history));
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
