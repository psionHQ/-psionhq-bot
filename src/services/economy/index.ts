import { prisma } from '../../database/prisma';
import { config } from '../../config';
import { ledgerService } from '../ledger';
import { walletRepository } from '../wallets';
import { EconomyService } from './economyService';
import { PrismaDailyRewardClaimRepository } from './prismaDailyRewardClaimRepository';

const dailyRewardClaimRepository = new PrismaDailyRewardClaimRepository(prisma);

export const economyService = new EconomyService(
  ledgerService,
  walletRepository,
  dailyRewardClaimRepository,
  config.economy,
  prisma,
);

export * from './economyService';
export * from './errors';
export * from './inMemoryDailyRewardClaimRepository';
export * from './interfaces';
export * from './prismaDailyRewardClaimRepository';
