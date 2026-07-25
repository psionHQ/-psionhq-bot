import type { Transaction } from '../../types';

// ---------------------------------------------------------------------------
// Daily reward claim
// ---------------------------------------------------------------------------

export interface DailyRewardClaim {
  id: number;
  walletId: number;
  claimedAt: Date;
}

export interface DailyRewardClaimRepository {
  findByWalletId(walletId: number): Promise<DailyRewardClaim | null>;
  upsert(walletId: number, claimedAt: Date): Promise<DailyRewardClaim>;
}

// ---------------------------------------------------------------------------
// Economy service contract
// ---------------------------------------------------------------------------

export interface TransferWithFeeResult {
  transfer: Transaction;
  fee: Transaction | null;
}

export interface EconomyServiceContract {
  /** Ensure system wallets exist and seed reward pool if needed. */
  initialize(): Promise<void>;

  /** Claim the daily PSI reward for the given wallet. */
  claimDailyReward(walletId: number): Promise<Transaction>;

  /**
   * Execute a transfer from `fromWalletId` to `toWalletId` with automatic
   * fee deduction.  The fee is sent to the treasury wallet.
   */
  transferWithFee(
    fromWalletId: number,
    toWalletId: number,
    amount: number,
    memo?: string | null,
  ): Promise<TransferWithFeeResult>;

  /** Return the sum of all wallet balances (circulating supply). */
  getTotalSupply(): Promise<number>;

  /** Validate that minting `additionalAmount` would not exceed MAX_SUPPLY. */
  validateMaxSupply(additionalAmount: number): Promise<void>;

  /** Return the current treasury wallet balance. */
  getTreasuryBalance(): Promise<number>;

  /** Return the current reward pool balance. */
  getRewardPoolBalance(): Promise<number>;
}

// ---------------------------------------------------------------------------
// Extension-point interfaces (reserved for future phases)
// ---------------------------------------------------------------------------

/** Staking – Phase N */
export interface StakingExtension {
  stake(walletId: number, amount: number): Promise<Transaction>;
  unstake(walletId: number, amount: number): Promise<Transaction>;
  getStakedBalance(walletId: number): Promise<number>;
  distributeStakingReward(walletId: number): Promise<Transaction>;
}

/** Referral rewards – Phase N */
export interface ReferralExtension {
  trackReferral(referrerWalletId: number, referredWalletId: number): Promise<void>;
  distributeReferralReward(referrerWalletId: number): Promise<Transaction>;
}

/** Validator rewards – Phase N */
export interface ValidatorExtension {
  registerValidator(walletId: number): Promise<void>;
  distributeValidatorReward(validatorWalletId: number): Promise<Transaction>;
}
