import type { Wallet } from '../../types';

export interface WalletRepository {
  findByUserId(userId: number): Promise<Wallet | null>;
  create(userId: number, address: string): Promise<Wallet>;
}

export interface WalletServiceContract {
  createForUser(userId: number): Promise<Wallet>;
  getByUserId(userId: number): Promise<Wallet | null>;
}
