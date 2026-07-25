import type { PrismaClient } from '@prisma/client';
import type { ReferralRepository, ReferralServiceContract, ReferralStats } from './interfaces';

const BOT_LINK_BASE = 'https://t.me/PsionHQ_bot?start=';

export class ReferralService implements ReferralServiceContract {
  constructor(
    private readonly repository: ReferralRepository,
    private readonly prisma: PrismaClient,
  ) {}

  buildLink(referralCode: string): string {
    return `${BOT_LINK_BASE}${referralCode}`;
  }

  async processReferral(referredByCode: string, newUserId: number): Promise<void> {
    // Find the referrer by their referral code
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode: referredByCode },
      select: { id: true },
    });

    if (!referrer) {
      return;
    }

    // Prevent self-referral
    if (referrer.id === newUserId) {
      return;
    }

    // Prevent duplicate referral
    const alreadyReferred = await this.repository.findByReferredId(newUserId);
    if (alreadyReferred) {
      return;
    }

    await this.repository.record(referrer.id, newUserId);
  }

  async getStats(userId: number): Promise<ReferralStats> {
    const count = await this.repository.countByReferrerId(userId);
    return { count };
  }
}
