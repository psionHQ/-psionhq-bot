import { bot } from '../bot';
import { ADMIN_CALLBACKS, MENU_CALLBACKS } from '../constants/menu';
import { roleGuard } from '../middleware/roleGuard';
import { identityService } from '../services/admin';
import { userService } from '../services/users';
import { getAdminMenuKeyboard } from '../utils/keyboard';
import { logger } from '../utils/logger';
import type { UserLanguage } from '../types';

const ADMIN_TRANSLATIONS = {
  en: {
    title: '🔐 Admin Panel',
    subtitle: 'Choose an action:',
    usersTitle: '👥 Users',
    statsTitle: '📊 Statistics',
    rolesTitle: '⚙ Roles',
    historyTitle: '📋 Admin History',
    totalUsers: 'Total users',
    activeUsers: 'Active users',
    inactiveUsers: 'Inactive users',
    noActions: 'No admin actions recorded yet.',
    action: 'Action',
    admin: 'Admin ID',
    target: 'Target ID',
    date: 'Date',
    roleInfo:
      'Role hierarchy:\n\n🔴 ADMIN — Full access\n🟡 MODERATOR — Limited admin access\n🟢 USER — Regular user\n\nUse /changerole <telegramId> <ROLE> to change a role.',
  },
  ru: {
    title: '🔐 Панель администратора',
    subtitle: 'Выберите действие:',
    usersTitle: '👥 Пользователи',
    statsTitle: '📊 Статистика',
    rolesTitle: '⚙ Роли',
    historyTitle: '📋 История действий',
    totalUsers: 'Всего пользователей',
    activeUsers: 'Активных',
    inactiveUsers: 'Неактивных',
    noActions: 'Действия администраторов ещё не зарегистрированы.',
    action: 'Действие',
    admin: 'ID администратора',
    target: 'ID цели',
    date: 'Дата',
    roleInfo:
      'Иерархия ролей:\n\n🔴 ADMIN — Полный доступ\n🟡 MODERATOR — Ограниченный доступ\n🟢 USER — Обычный пользователь\n\nИспользуйте /changerole <telegramId> <РОЛЬ> для изменения роли.',
  },
} as const;

function getLang(language: string | undefined): UserLanguage {
  return language === 'ru' ? 'ru' : 'en';
}

function formatActionLabel(action: string): string {
  const labels: Record<string, string> = {
    CHANGE_ROLE: '🔄 CHANGE_ROLE',
    DEACTIVATE_USER: '🔴 DEACTIVATE_USER',
    ACTIVATE_USER: '🟢 ACTIVATE_USER',
  };
  return labels[action] ?? action;
}

/**
 * /admin command — shows admin panel (ADMIN only)
 */
bot.command('admin', roleGuard('ADMIN'), async (ctx) => {
  const user = await userService.getByTelegramId(ctx.from.id);
  const lang = getLang(user?.language);
  const text = ADMIN_TRANSLATIONS[lang];

  logger.info(`Admin panel accessed by user ${ctx.from.id}`);

  await ctx.reply(`${text.title}\n\n${text.subtitle}`, getAdminMenuKeyboard(lang));
});

/**
 * Admin menu button in main menu — same as /admin command
 */
bot.action(MENU_CALLBACKS.ADMIN, roleGuard('ADMIN'), async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery();
    return;
  }

  const user = await userService.getByTelegramId(ctx.from.id);
  const lang = getLang(user?.language);
  const text = ADMIN_TRANSLATIONS[lang];

  await ctx.answerCbQuery();
  await ctx.reply(`${text.title}\n\n${text.subtitle}`, getAdminMenuKeyboard(lang));
});

/**
 * 👥 Users — list all users
 */
bot.action(ADMIN_CALLBACKS.USERS, roleGuard('ADMIN'), async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery();
    return;
  }

  const user = await userService.getByTelegramId(ctx.from.id);
  const lang = getLang(user?.language);
  const text = ADMIN_TRANSLATIONS[lang];

  const allUsers = await userService.getAllUsers();

  const lines = allUsers.slice(0, 20).map((u) => {
    const status = u.isActive ? '✅' : '🔴';
    const name = u.username ? `@${u.username}` : u.firstName;
    return `${status} [${u.id}] ${name} — ${u.role}`;
  });

  const message =
    lines.length > 0
      ? `${text.usersTitle}\n\n${lines.join('\n')}`
      : `${text.usersTitle}\n\n—`;

  await ctx.answerCbQuery();
  await ctx.reply(message);
});

/**
 * 📊 Statistics
 */
bot.action(ADMIN_CALLBACKS.STATISTICS, roleGuard('ADMIN'), async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery();
    return;
  }

  const user = await userService.getByTelegramId(ctx.from.id);
  const lang = getLang(user?.language);
  const text = ADMIN_TRANSLATIONS[lang];

  const allUsers = await userService.getAllUsers();
  const activeCount = allUsers.filter((u) => u.isActive).length;
  const inactiveCount = allUsers.length - activeCount;

  const message = `${text.statsTitle}

👤 ${text.totalUsers}: ${allUsers.length}
✅ ${text.activeUsers}: ${activeCount}
🔴 ${text.inactiveUsers}: ${inactiveCount}`;

  await ctx.answerCbQuery();
  await ctx.reply(message);
});

/**
 * ⚙ Roles — role information
 */
bot.action(ADMIN_CALLBACKS.ROLES, roleGuard('ADMIN'), async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery();
    return;
  }

  const user = await userService.getByTelegramId(ctx.from.id);
  const lang = getLang(user?.language);
  const text = ADMIN_TRANSLATIONS[lang];

  await ctx.answerCbQuery();
  await ctx.reply(`${text.rolesTitle}\n\n${text.roleInfo}`);
});

/**
 * 📋 Admin History — show recent admin actions
 */
bot.action(ADMIN_CALLBACKS.HISTORY, roleGuard('ADMIN'), async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery();
    return;
  }

  const user = await userService.getByTelegramId(ctx.from.id);
  const lang = getLang(user?.language);
  const text = ADMIN_TRANSLATIONS[lang];

  const actions = await identityService.getAllAdminActions(20);

  await ctx.answerCbQuery();

  if (actions.length === 0) {
    await ctx.reply(`${text.historyTitle}\n\n${text.noActions}`);
    return;
  }

  const rows = actions.map((a) => {
    const date = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(a.createdAt);

    const targetPart = a.targetUserId != null ? ` → [${a.targetUserId}]` : '';
    return `${formatActionLabel(a.action)}${targetPart}\n👤 [${a.adminId}] · 📅 ${date}`;
  });

  await ctx.reply(`${text.historyTitle}\n\n${rows.join('\n\n')}`);
});

/**
 * /changerole <telegramId> <ROLE> — change a user's role (ADMIN only)
 */
bot.command('changerole', roleGuard('ADMIN'), async (ctx) => {
  const args = ctx.message.text.split(/\s+/).slice(1);
  const user = await userService.getByTelegramId(ctx.from.id);
  const lang = getLang(user?.language);

  if (args.length < 2) {
    const usage =
      lang === 'ru'
        ? '⚠️ Использование: /changerole <telegramId> <USER|MODERATOR|ADMIN>'
        : '⚠️ Usage: /changerole <telegramId> <USER|MODERATOR|ADMIN>';
    await ctx.reply(usage);
    return;
  }

  const targetId = parseInt(args[0], 10);
  const newRole = args[1].toUpperCase() as 'USER' | 'MODERATOR' | 'ADMIN';

  if (isNaN(targetId) || !['USER', 'MODERATOR', 'ADMIN'].includes(newRole)) {
    const invalid =
      lang === 'ru'
        ? '❌ Неверные параметры. Роль должна быть USER, MODERATOR или ADMIN.'
        : '❌ Invalid parameters. Role must be USER, MODERATOR, or ADMIN.';
    await ctx.reply(invalid);
    return;
  }

  try {
    const updated = await identityService.changeRole(ctx.from.id, targetId, newRole);
    const success =
      lang === 'ru'
        ? `✅ Роль пользователя [${targetId}] изменена на ${updated.role}.`
        : `✅ Role of user [${targetId}] changed to ${updated.role}.`;
    await ctx.reply(success);
  } catch (err) {
    const error =
      lang === 'ru'
        ? `❌ Ошибка: ${err instanceof Error ? err.message : String(err)}`
        : `❌ Error: ${err instanceof Error ? err.message : String(err)}`;
    await ctx.reply(error);
  }
});

logger.info('✅ Admin callbacks registered');
