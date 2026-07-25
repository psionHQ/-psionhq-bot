import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { Wallet } from '../../types';
import type { WalletDbClient, WalletRepository } from './interfaces';

function mapToWallet(row: {
  id: number;
  userId: number;
  address: string;
  balance: { toNumber(): number };
  createdAt: Date;
}): Wallet {
  return {
    id: row.id,
    userId: row.userId,
    address: row.address,
    balance: row.balance.toNumber(),
    createdAt: row.createdAt,
  };
}

export class PrismaWalletRepository implements WalletRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private resolveClient(client?: WalletDbClient): WalletDbClient {
    return client ?? this.prisma;
  }

  async findById(id: number, client?: WalletDbClient): Promise<Wallet | null> {
    const wallet = await this.resolveClient(client).wallet.findUnique({
      where: { id },
    });
    return wallet ? mapToWallet(wallet) : null;
  }

  async findByUserId(userId: number): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    return wallet ? mapToWallet(wallet) : null;
  }

  async create(userId: number, address: string): Promise<Wallet> {
    const wallet = await this.prisma.wallet.create({
      data: { userId, address },
    });
    return mapToWallet(wallet);
  }

  async credit(walletId: number, amount: number, client?: WalletDbClient): Promise<Wallet> {
    const wallet = await this.resolveClient(client).wallet.update({
      where: { id: walletId },
      data: {
        balance: {
          increment: new Prisma.Decimal(amount),
        },
      },
    });

    return mapToWallet(wallet);
  }

  async debit(walletId: number, amount: number, client?: WalletDbClient): Promise<Wallet | null> {
    const updateResult = await this.resolveClient(client).wallet.updateMany({
      where: {
        id: walletId,
        balance: {
          gte: new Prisma.Decimal(amount),
        },
      },
      data: {
        balance: {
          decrement: new Prisma.Decimal(amount),
        },
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    const wallet = await this.resolveClient(client).wallet.findUnique({
      where: { id: walletId },
    });

    return wallet ? mapToWallet(wallet) : null;
  }

  async getBalance(walletId: number, client?: WalletDbClient): Promise<number> {
    const wallet = await this.findById(walletId, client);
    if (!wallet) {
      throw new Error(`Wallet with id ${walletId} not found`);
    }
    return wallet.balance;
  }
}
