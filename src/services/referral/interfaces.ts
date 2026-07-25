export interface ReferralStats {
  count: number;
}

export interface ReferralRepository {
  findByReferredId(referredId: number): Promise<boolean>;
  record(referrerId: number, referredId: number): Promise<void>;
  countByReferrerId(referrerId: number): Promise<number>;
}

export interface ReferralServiceContract {
  /**
   * Record a referral relationship between referrer and newly registered user.
   * No-ops if the code is invalid, the referred user is already tracked, or
   * the referrer and referred are the same person.
   */
  processReferral(referredByCode: string, newUserId: number): Promise<void>;

  /** Return the referral link for a user given their referral code. */
  buildLink(referralCode: string): string;

  /** Return the number of users referred by this user. */
  getStats(userId: number): Promise<ReferralStats>;
}
