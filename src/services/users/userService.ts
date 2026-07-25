import type { TelegramUserRegistrationData, User, UserLanguage } from '../../types';
import type { UserRepository, UserServiceContract } from './interfaces';
import type { WalletServiceContract } from '../wallets/interfaces';
import type { ReferralServiceContract } from '../referral/interfaces';

function normalizeLanguage(languageCode: string | undefined): UserLanguage {
  return languageCode?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export class UserService implements UserServiceContract {
  constructor(
    private readonly repository: UserRepository,
    private readonly walletService: WalletServiceContract,
    private readonly referralService: ReferralServiceContract,
  ) {}

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
      role: 'USER',
      isActive: true,
      lastLoginAt: null,
      registeredAt: new Date(),
      referralCode: data.telegramId.toString(),
    };

    const createdUser = await this.repository.create(user);

    if (createdUser.id !== undefined) {
      await this.walletService.createForUser(createdUser.id);

      if (data.referredByCode) {
        await this.referralService.processReferral(data.referredByCode, createdUser.id);
      }
    }

    return createdUser;
  }

  async getByTelegramId(telegramId: number): Promise<User | null> {
    return this.repository.findByTelegramId(telegramId);
  }

  async getAllUsers(): Promise<User[]> {
    return this.repository.findAll();
  }

  async setLanguage(telegramId: number, language: UserLanguage): Promise<User | null> {
    const existingUser = await this.repository.findByTelegramId(telegramId);

    if (!existingUser) {
      return null;
    }

    return this.repository.update(telegramId, { language });
  }
}
