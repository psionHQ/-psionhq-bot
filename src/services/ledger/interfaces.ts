import type { Prisma, PrismaClient } from '@prisma/client';
import type { Transaction, TransactionCreateInput } from '../../types';

export type LedgerDbClient = PrismaClient | Prisma.TransactionClient;

export interface TransactionRepository {
  create(input: TransactionCreateInput, client?: LedgerDbClient): Promise<Transaction>;
  findByWalletId(walletId: number, limit?: number): Promise<Transaction[]>;
}

export interface LedgerServiceContract {
  transfer(fromWalletId: number, toWalletId: number, amount: number, memo?: string | null): Promise<Transaction>;
  mint(toWalletId: number, amount: number, memo?: string | null): Promise<Transaction>;
  burn(fromWalletId: number, amount: number, memo?: string | null): Promise<Transaction>;
  reward(toWalletId: number, amount: number, memo?: string | null): Promise<Transaction>;
  getHistory(walletId: number, limit?: number): Promise<Transaction[]>;
}
