import { randomUUID } from 'crypto';
import type { Transaction, TransactionCreateInput } from '../../types';
import type { LedgerDbClient, TransactionRepository } from './interfaces';

export class InMemoryTransactionRepository implements TransactionRepository {
  private readonly transactions: Transaction[] = [];

  async create(input: TransactionCreateInput, _client?: LedgerDbClient): Promise<Transaction> {
    const transaction: Transaction = {
      id: randomUUID(),
      fromWalletId: input.fromWalletId ?? null,
      toWalletId: input.toWalletId ?? null,
      amount: input.amount,
      type: input.type,
      status: input.status,
      memo: input.memo ?? null,
      createdAt: new Date(),
    };

    this.transactions.push(transaction);
    return transaction;
  }

  async findByWalletId(walletId: number, limit: number = 10): Promise<Transaction[]> {
    return this.transactions
      .filter((transaction) => transaction.fromWalletId === walletId || transaction.toWalletId === walletId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
