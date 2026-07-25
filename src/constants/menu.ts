/**
 * Callback action identifiers for the main menu
 * Centralized constants to avoid hardcoding callback names across files
 * Easy to extend with new menu items
 */

export const MENU_CALLBACKS = {
  NEWS: 'menu_news',
  TOKEN: 'menu_token',
  WHITEPAPER: 'menu_whitepaper',
  ROADMAP: 'menu_roadmap',
  WEBSITE: 'menu_website',
  COMMUNITY: 'menu_community',
  ABOUT: 'menu_about',
  PROFILE: 'menu_profile',
  LANGUAGE: 'menu_language',
  WALLET: 'menu_wallet',
} as const;

export const LANGUAGE_CALLBACKS = {
  ENGLISH: 'lang_en',
  RUSSIAN: 'lang_ru',
} as const;

/**
 * Menu item metadata for rendering and extensibility
 */
export interface MenuItem {
  label: string;
  emoji: string;
  callback: string;
  description?: string;
}

/**
 * Menu items configuration - easy to add new items
 */
export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'News',
    emoji: '🚀',
    callback: MENU_CALLBACKS.NEWS,
    description: 'Latest news and updates',
  },
  {
    label: 'PSI Token',
    emoji: '🪙',
    callback: MENU_CALLBACKS.TOKEN,
    description: 'PSI token information',
  },
  {
    label: 'Whitepaper',
    emoji: '📄',
    callback: MENU_CALLBACKS.WHITEPAPER,
    description: 'Project whitepaper',
  },
  {
    label: 'Roadmap',
    emoji: '🗺',
    callback: MENU_CALLBACKS.ROADMAP,
    description: 'Development roadmap',
  },
  {
    label: 'Website',
    emoji: '🌐',
    callback: MENU_CALLBACKS.WEBSITE,
    description: 'Official website',
  },
  {
    label: 'Community',
    emoji: '💬',
    callback: MENU_CALLBACKS.COMMUNITY,
    description: 'Join our community',
  },
  {
    label: 'About',
    emoji: 'ℹ️',
    callback: MENU_CALLBACKS.ABOUT,
    description: 'About PSI Network',
  },
  {
    label: 'Profile',
    emoji: '👤',
    callback: MENU_CALLBACKS.PROFILE,
    description: 'Your profile details',
  },
  {
    label: 'Wallet',
    emoji: '💰',
    callback: MENU_CALLBACKS.WALLET,
    description: 'Your PSI wallet',
  },
  {
    label: 'Language',
    emoji: '🌍',
    callback: MENU_CALLBACKS.LANGUAGE,
    description: 'Language settings',
  },
];
