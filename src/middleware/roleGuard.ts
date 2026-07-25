import type { Context, MiddlewareFn } from 'telegraf';
import type { UserRole } from '../types';
import { userService } from '../services/users';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
};

const ACCESS_DENIED = {
  en: '🚫 Access denied. You do not have permission to perform this action.',
  ru: '🚫 Доступ запрещён. У вас недостаточно прав для выполнения этого действия.',
};

/**
 * Returns a Telegraf middleware that requires the user to have at least the given role.
 * If the user does not have the required role, replies with an access denied message and stops.
 */
export function roleGuard(requiredRole: UserRole): MiddlewareFn<Context> {
  return async (ctx, next) => {
    if (!ctx.from) {
      if ('answerCbQuery' in ctx) await (ctx as Context & { answerCbQuery(): Promise<void> }).answerCbQuery();
      return;
    }

    const user = await userService.getByTelegramId(ctx.from.id);

    if (!user || !user.isActive) {
      const message = ACCESS_DENIED.en;
      if ('answerCbQuery' in ctx) {
        await (ctx as Context & { answerCbQuery(): Promise<void> }).answerCbQuery();
      }
      await ctx.reply(message);
      return;
    }

    const userLevel = ROLE_HIERARCHY[user.role];
    const requiredLevel = ROLE_HIERARCHY[requiredRole];

    if (userLevel < requiredLevel) {
      const message = user.language === 'ru' ? ACCESS_DENIED.ru : ACCESS_DENIED.en;
      if ('answerCbQuery' in ctx) {
        await (ctx as Context & { answerCbQuery(): Promise<void> }).answerCbQuery();
      }
      await ctx.reply(message);
      return;
    }

    return next();
  };
}
