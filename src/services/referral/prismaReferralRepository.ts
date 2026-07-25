import type { PrismaClient } from '@prisma/client';
import type { ReferralRepository } from './interfaces';

export class PrismaReferralRepository implements ReferralRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByReferredId(referredId: number): Promise<boolean> {
    const referral = await this.prisma.referral.findUnique({
      where: { referredId },
    });
    return referral !== null;
  }

  async record(referrerId: number, referredId: number): Promise<void> {
    await this.prisma.referral.create({
      data: { referrerId, referredId },
    });
  }

  async countByReferrerId(referrerId: number): Promise<number> {
    return this.prisma.referral.count({
      where: { referrerId },
    });
  }
}
