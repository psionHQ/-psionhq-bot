export type UserRole = 'user' | 'admin';
export type UserLanguage = 'en' | 'ru';

export interface User {
  telegramId: number;
  username: string | null;
  firstName: string;
  language: UserLanguage;
  role: UserRole;
  registeredAt: Date;
}

export interface TelegramUserRegistrationData {
  telegramId: number;
  username: string | null;
  firstName: string;
  languageCode: string | undefined;
}
