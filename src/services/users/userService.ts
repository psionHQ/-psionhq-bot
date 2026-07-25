import type { TelegramUserRegistrationData, User, UserLanguage } from '../../types';
import type { UserRepository, UserServiceContract } from './interfaces';

function normalizeLanguage(languageCode: string | undefined): UserLanguage {
  return languageCode?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export class UserService implements UserServiceContract {
  constructor(private readonly repository: UserRepository) {}

  async registerOrUpdate(data: TelegramUserRegistrationData): Promise<User> {
    const existingUser = await this.repository.findByTelegramId(data.telegramId);

    if (existingUser) {
      return this.repository.update(existingUser.telegramId, {
        username: data.username,
        firstName: data.firstName,
      });
    }

    const user: User = {
      telegramId: data.telegramId,
      username: data.username,
      firstName: data.firstName,
      language: normalizeLanguage(data.languageCode),
      role: 'user',
      registeredAt: new Date(),
    };

    return this.repository.create(user);
  }

  async getByTelegramId(telegramId: number): Promise<User | null> {
    return this.repository.findByTelegramId(telegramId);
  }

  async setLanguage(telegramId: number, language: UserLanguage): Promise<User | null> {
    const existingUser = await this.repository.findByTelegramId(telegramId);

    if (!existingUser) {
      return null;
    }

    return this.repository.update(telegramId, { language });
  }
}
