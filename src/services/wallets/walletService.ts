import { randomBytes } from 'crypto';
import type { Wallet } from '../../types';
import type { WalletDbClient, WalletRepository, WalletServiceContract } from './interfaces';

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

  async credit(walletId: number, amount: number, client?: WalletDbClient): Promise<Wallet> {
    return this.repository.credit(walletId, amount, client);
  }

  async debit(walletId: number, amount: number, client?: WalletDbClient): Promise<Wallet | null> {
    return this.repository.debit(walletId, amount, client);
  }

  async getBalance(walletId: number, client?: WalletDbClient): Promise<number> {
    return this.repository.getBalance(walletId, client);
  }
}
