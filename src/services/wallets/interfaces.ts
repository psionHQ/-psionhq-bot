import type { Prisma, PrismaClient } from '@prisma/client';
import type { Wallet } from '../../types';

export type WalletDbClient = PrismaClient | Prisma.TransactionClient;

export interface WalletRepository {
  findById(id: number, client?: WalletDbClient): Promise<Wallet | null>;
  findByUserId(userId: number): Promise<Wallet | null>;
  create(userId: number, address: string): Promise<Wallet>;
  credit(walletId: number, amount: number, client?: WalletDbClient): Promise<Wallet>;
  debit(walletId: number, amount: number, client?: WalletDbClient): Promise<Wallet | null>;
  getBalance(walletId: number, client?: WalletDbClient): Promise<number>;
}

export interface WalletServiceContract {
  createForUser(userId: number): Promise<Wallet>;
  getByUserId(userId: number): Promise<Wallet | null>;
  credit(walletId: number, amount: number, client?: WalletDbClient): Promise<Wallet>;
  debit(walletId: number, amount: number, client?: WalletDbClient): Promise<Wallet | null>;
  getBalance(walletId: number, client?: WalletDbClient): Promise<number>;
}
