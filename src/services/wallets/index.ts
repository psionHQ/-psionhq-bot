import { prisma } from '../../database/prisma';
import { PrismaWalletRepository } from './prismaWalletRepository';
import { WalletService } from './walletService';

const walletRepository = new PrismaWalletRepository(prisma);

export const walletService = new WalletService(walletRepository);

export * from './interfaces';
export * from './walletService';
