import type { PrismaClient } from '@prisma/client';
import type { Wallet } from '../../types';
import type { WalletRepository } from './interfaces';

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
}
