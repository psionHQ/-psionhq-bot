import type { Repository } from '../../database';
import type { TelegramUserRegistrationData, User, UserLanguage } from '../../types';

export interface UserRepository extends Repository<User, number> {
  findByTelegramId(telegramId: number): Promise<User | null>;
}

export interface UserServiceContract {
  registerOrUpdate(data: TelegramUserRegistrationData): Promise<User>;
  getByTelegramId(telegramId: number): Promise<User | null>;
  setLanguage(telegramId: number, language: UserLanguage): Promise<User | null>;
}
