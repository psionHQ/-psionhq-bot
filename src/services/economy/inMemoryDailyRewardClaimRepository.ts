import type { DailyRewardClaim, DailyRewardClaimRepository } from './interfaces';

export class InMemoryDailyRewardClaimRepository implements DailyRewardClaimRepository {
  private readonly claims = new Map<number, DailyRewardClaim>();
  private idCounter = 1;

  async findByWalletId(walletId: number): Promise<DailyRewardClaim | null> {
    return this.claims.get(walletId) ?? null;
  }

  async upsert(walletId: number, claimedAt: Date): Promise<DailyRewardClaim> {
    const existing = this.claims.get(walletId);
    if (existing) {
      existing.claimedAt = claimedAt;
      return existing;
    }
    const claim: DailyRewardClaim = { id: this.idCounter++, walletId, claimedAt };
    this.claims.set(walletId, claim);
    return claim;
  }
}
