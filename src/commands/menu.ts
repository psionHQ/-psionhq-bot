import { bot } from '../bot';
import { MENU_CALLBACKS } from '../constants/menu';
import { getMenuItemByCallback } from '../utils/keyboard';

/**
 * Development message for menu items under development
 */
const DEVELOPMENT_MESSAGE = '🚧 This section is under development.\n\nStay tuned for updates!';

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

    console.log(`📌 User accessed: ${itemName} (${callback})`);

    // Answer the callback query (remove loading state)
    ctx.answerCbQuery();

    // Send development message
    await ctx.reply(DEVELOPMENT_MESSAGE);
  });
}

/**
 * Register all menu callbacks
 * When adding new menu items, register their callbacks here
 */

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

console.log('✅ Menu callbacks registered');
