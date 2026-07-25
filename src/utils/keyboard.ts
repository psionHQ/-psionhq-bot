import { Markup } from 'telegraf';
import { ADMIN_CALLBACKS, ADMIN_MENU_ITEM, LANGUAGE_CALLBACKS, MENU_ITEMS } from '../constants/menu';
import type { UserRole } from '../types';

/**
 * Generate main menu keyboard with inline buttons.
 * Appends an Admin button for ADMIN users.
 * Buttons are arranged in 2-column layout for better UX.
 *
 * @param role - Optional user role; ADMIN users see an extra admin button
 * @returns Telegram inline keyboard markup
 */
export function getMainMenuKeyboard(role?: UserRole) {
  const items = role === 'ADMIN' ? [...MENU_ITEMS, ADMIN_MENU_ITEM] : MENU_ITEMS;

  // Create button array with emoji + label format
  const buttons = items.map((item) =>
    Markup.button.callback(`${item.emoji} ${item.label}`, item.callback)
  );

  // Arrange buttons in 2-column layout
  const rows: (typeof buttons)[] = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }

  return Markup.inlineKeyboard(rows);
}

/**
 * Get menu item by callback action
 * Useful for displaying item details or logging
 *
 * @param callback - The callback action identifier
 * @returns Menu item or undefined if not found
 */
export function getMenuItemByCallback(callback: string) {
  return [...MENU_ITEMS, ADMIN_MENU_ITEM].find((item) => item.callback === callback);
}

export function getLanguageSelectionKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇺🇸 English', LANGUAGE_CALLBACKS.ENGLISH),
      Markup.button.callback('🇷🇺 Русский', LANGUAGE_CALLBACKS.RUSSIAN),
    ],
  ]);
}

export function getAdminMenuKeyboard(language: 'en' | 'ru' = 'en') {
  const labels =
    language === 'ru'
      ? { users: '👥 Пользователи', statistics: '📊 Статистика', roles: '⚙ Роли', history: '📋 История' }
      : { users: '👥 Users', statistics: '📊 Statistics', roles: '⚙ Roles', history: '📋 History' };

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(labels.users, ADMIN_CALLBACKS.USERS),
      Markup.button.callback(labels.statistics, ADMIN_CALLBACKS.STATISTICS),
    ],
    [
      Markup.button.callback(labels.roles, ADMIN_CALLBACKS.ROLES),
      Markup.button.callback(labels.history, ADMIN_CALLBACKS.HISTORY),
    ],
  ]);
}
