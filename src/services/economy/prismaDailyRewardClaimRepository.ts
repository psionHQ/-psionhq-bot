import type { PrismaClient } from '@prisma/client';
import type { DailyRewardClaim, DailyRewardClaimRepository } from './interfaces';

export class PrismaDailyRewardClaimRepository implements DailyRewardClaimRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByWalletId(walletId: number): Promise<DailyRewardClaim | null> {
    const record = await this.prisma.dailyRewardClaim.findUnique({
      where: { walletId },
    });
    return record ?? null;
  }

  async upsert(walletId: number, claimedAt: Date): Promise<DailyRewardClaim> {
    return this.prisma.dailyRewardClaim.upsert({
      where: { walletId },
      create: { walletId, claimedAt },
      update: { claimedAt },
    });
  }
}
