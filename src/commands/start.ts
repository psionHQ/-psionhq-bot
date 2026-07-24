import { bot } from '../bot';
import { getMainMenuKeyboard } from '../utils/keyboard';
import { MENU_ITEMS } from '../constants/menu';

/**
 * /start command handler
 * Displays welcome message with interactive main menu
 */
bot.start((ctx) => {
  const welcomeMessage = `
👋 Добро пожаловать в PSI Network!

Это официальный бот проекта @PsionHQ.

Выберите интересующий вас раздел:
`;

  const keyboard = getMainMenuKeyboard();
  
  // DEBUG LOGGING - TEMPORARY
  console.log('\n========== DEBUG: KEYBOARD OBJECT INSPECTION ==========');
  console.log('1. MENU_ITEMS.length:', MENU_ITEMS.length);
  console.log('\n2. MENU_ITEMS:');
  console.log(MENU_ITEMS);
  console.log('\n3. getMainMenuKeyboard() full object:');
  console.log(keyboard);
  console.log('\n4. getMainMenuKeyboard().reply_markup:');
  console.log(keyboard.reply_markup);
  console.log('\n5. Second argument passed to ctx.reply():');
  console.log(keyboard);
  console.log('========================================================\n');

  ctx.reply(welcomeMessage, keyboard);
});
