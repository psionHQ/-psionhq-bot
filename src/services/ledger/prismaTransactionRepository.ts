import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { Transaction, TransactionCreateInput, TransactionStatus, TransactionType } from '../../types';
import type { LedgerDbClient, TransactionRepository } from './interfaces';

function mapToTransaction(row: {
  id: string;
  fromWalletId: number | null;
  toWalletId: number | null;
  amount: { toNumber(): number };
  type: string;
  status: string;
  memo: string | null;
  createdAt: Date;
}): Transaction {
  return {
    id: row.id,
    fromWalletId: row.fromWalletId,
    toWalletId: row.toWalletId,
    amount: row.amount.toNumber(),
    type: row.type as TransactionType,
    status: row.status as TransactionStatus,
    memo: row.memo,
    createdAt: row.createdAt,
  };
}

export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private resolveClient(client?: LedgerDbClient): LedgerDbClient {
    return client ?? this.prisma;
  }

  async create(input: TransactionCreateInput, client?: LedgerDbClient): Promise<Transaction> {
    const transaction = await this.resolveClient(client).transaction.create({
      data: {
        fromWalletId: input.fromWalletId ?? null,
        toWalletId: input.toWalletId ?? null,
        amount: new Prisma.Decimal(input.amount),
        type: input.type,
        status: input.status,
        memo: input.memo ?? null,
      },
    });

    return mapToTransaction(transaction);
  }

  async findByWalletId(walletId: number, limit: number = 10): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [{ fromWalletId: walletId }, { toWalletId: walletId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return transactions.map(mapToTransaction);
  }
}
