export class EconomyError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class DailyRewardAlreadyClaimedError extends EconomyError {
  constructor(walletId: number, nextClaimAt: Date) {
    super(
      `Wallet ${walletId} already claimed the daily reward. Next claim available at ${nextClaimAt.toISOString()}.`,
      'DAILY_REWARD_ALREADY_CLAIMED',
    );
  }
}

export class RewardPoolExhaustedError extends EconomyError {
  constructor() {
    super('The reward pool has insufficient funds to distribute the daily reward.', 'REWARD_POOL_EXHAUSTED');
  }
}

export class MaxSupplyExceededError extends EconomyError {
  constructor(currentSupply: number, additionalAmount: number, maxSupply: number) {
    super(
      `Minting ${additionalAmount} PSI would exceed the maximum supply of ${maxSupply} PSI (current: ${currentSupply} PSI).`,
      'MAX_SUPPLY_EXCEEDED',
    );
  }
}

export class EconomyNotInitializedError extends EconomyError {
  constructor() {
    super('EconomyService has not been initialized. Call initialize() first.', 'ECONOMY_NOT_INITIALIZED');
  }
}
