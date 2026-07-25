import type { Wallet } from '../../types';
import type { WalletDbClient, WalletRepository } from './interfaces';

export class InMemoryWalletRepository implements WalletRepository {
  private readonly wallets = new Map<number, Wallet>();
  private idCounter = 1;

  async findById(id: number, _client?: WalletDbClient): Promise<Wallet | null> {
    for (const wallet of this.wallets.values()) {
      if (wallet.id === id) {
        return wallet;
      }
    }
    return null;
  }

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

  async credit(walletId: number, amount: number, _client?: WalletDbClient): Promise<Wallet> {
    const wallet = await this.findById(walletId);
    if (!wallet) {
      throw new Error(`Wallet with id ${walletId} not found`);
    }
    wallet.balance += amount;
    return wallet;
  }

  async debit(walletId: number, amount: number, _client?: WalletDbClient): Promise<Wallet | null> {
    const wallet = await this.findById(walletId);
    if (!wallet || wallet.balance < amount) {
      return null;
    }
    wallet.balance -= amount;
    return wallet;
  }

  async getBalance(walletId: number, _client?: WalletDbClient): Promise<number> {
    const wallet = await this.findById(walletId);
    if (!wallet) {
      throw new Error(`Wallet with id ${walletId} not found`);
    }
    return wallet.balance;
  }
}
