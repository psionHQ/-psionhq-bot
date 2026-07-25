import { prisma } from '../../database/prisma';
import { walletRepository } from '../wallets';
import { LedgerService } from './ledgerService';
import { PrismaTransactionRepository } from './prismaTransactionRepository';

const transactionRepository = new PrismaTransactionRepository(prisma);

export const ledgerService = new LedgerService(transactionRepository, walletRepository, prisma);

export * from './errors';
export * from './inMemoryTransactionRepository';
export * from './interfaces';
export * from './ledgerService';
export * from './prismaTransactionRepository';
