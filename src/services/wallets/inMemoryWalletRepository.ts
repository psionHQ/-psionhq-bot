import type { Wallet } from '../../types';
import type { WalletRepository } from './interfaces';

export class InMemoryWalletRepository implements WalletRepository {
  private readonly wallets = new Map<number, Wallet>();
  private idCounter = 1;

  async findByUserId(userId: number): Promise<Wallet | null> {
    return this.wallets.get(userId) ?? null;
  }

  async create(userId: number, address: string): Promise<Wallet> {
    const wallet: Wallet = {
      id: this.idCounter++,
      userId,
      address,
      balance: 0,
      createdAt: new Date(),
    };
    this.wallets.set(userId, wallet);
    return wallet;
  }
}
