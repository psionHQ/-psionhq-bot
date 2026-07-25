import { Markup } from 'telegraf';
import { LANGUAGE_CALLBACKS, MENU_ITEMS } from '../constants/menu';

/**
 * Generate main menu keyboard with inline buttons
 * Buttons are arranged in 2-column layout for better UX
 * Easy to modify layout by changing the chunking logic
 *
 * @returns Telegram inline keyboard markup
 */
export function getMainMenuKeyboard() {
  // Create button array with emoji + label format
  const buttons = MENU_ITEMS.map((item) =>
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
  return MENU_ITEMS.find((item) => item.callback === callback);
}

export function getLanguageSelectionKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇺🇸 English', LANGUAGE_CALLBACKS.ENGLISH),
      Markup.button.callback('🇷🇺 Русский', LANGUAGE_CALLBACKS.RUSSIAN),
    ],
  ]);
}
