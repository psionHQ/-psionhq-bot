import { randomBytes } from 'crypto';
import type { Wallet } from '../../types';
import type { WalletRepository, WalletServiceContract } from './interfaces';

function generateWalletAddress(): string {
  return 'PSI' + randomBytes(16).toString('hex').toUpperCase();
}

export class WalletService implements WalletServiceContract {
  constructor(private readonly repository: WalletRepository) {}

  async createForUser(userId: number): Promise<Wallet> {
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      return existing;
    }
    const address = generateWalletAddress();
    return this.repository.create(userId, address);
  }

  async getByUserId(userId: number): Promise<Wallet | null> {
    return this.repository.findByUserId(userId);
  }
}
