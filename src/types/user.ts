export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type UserLanguage = 'en' | 'ru';

export interface User {
  id?: number;
  telegramId: number;
  username: string | null;
  firstName: string;
  language: UserLanguage;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  registeredAt: Date;
}

export interface TelegramUserRegistrationData {
  telegramId: number;
  username: string | null;
  firstName: string;
  languageCode: string | undefined;
}
