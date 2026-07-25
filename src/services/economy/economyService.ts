import type { PrismaClient } from '@prisma/client';
import type { EconomyConfig } from '../../types/config';
import type { Transaction } from '../../types';
import type { LedgerServiceContract } from '../ledger/interfaces';
import type { WalletRepository } from '../wallets/interfaces';
import type {
  DailyRewardClaimRepository,
  EconomyServiceContract,
  TransferWithFeeResult,
} from './interfaces';
import {
  DailyRewardAlreadyClaimedError,
  EconomyNotInitializedError,
  MaxSupplyExceededError,
  RewardPoolExhaustedError,
} from './errors';

const TREASURY_SYSTEM_TELEGRAM_ID = BigInt(-1);
const REWARD_POOL_SYSTEM_TELEGRAM_ID = BigInt(-2);

const DAILY_REWARD_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Localization strings
// ---------------------------------------------------------------------------

export const ECONOMY_TRANSLATIONS = {
  en: {
    dailyRewardMemo: 'Daily PSI reward',
    transferFeeMemo: 'Transfer fee',
    initialSupplyMemo: 'Initial reward pool supply',
    alreadyClaimed: 'You have already claimed your daily reward. Try again in {hours}h {minutes}m.',
    rewardPoolExhausted: 'The reward pool is temporarily empty. Please try again later.',
    maxSupplyExceeded: 'This operation would exceed the maximum PSI supply.',
    dailyRewardClaimed: '🎁 You received {amount} PSI as your daily reward!',
    notInitialized: 'Economy service is not ready.',
  },
  ru: {
    dailyRewardMemo: 'Ежедневная награда PSI',
    transferFeeMemo: 'Комиссия перевода',
    initialSupplyMemo: 'Начальное пополнение пула наград',
    alreadyClaimed: 'Вы уже получили ежедневную награду. Попробуйте снова через {hours}ч {minutes}м.',
    rewardPoolExhausted: 'Пул наград временно пуст. Повторите попытку позже.',
    maxSupplyExceeded: 'Эта операция превысит максимальный объём эмиссии PSI.',
    dailyRewardClaimed: '🎁 Вы получили {amount} PSI в качестве ежедневной награды!',
    notInitialized: 'Экономический сервис не готов.',
  },
} as const;

// ---------------------------------------------------------------------------
// Service implementation
// ---------------------------------------------------------------------------

export class EconomyService implements EconomyServiceContract {
  private treasuryWalletId: number | null = null;
  private rewardPoolWalletId: number | null = null;

  constructor(
    private readonly ledgerService: LedgerServiceContract,
    private readonly walletRepository: WalletRepository,
    private readonly dailyRewardClaimRepository: DailyRewardClaimRepository,
    private readonly config: EconomyConfig,
    private readonly prisma: PrismaClient,
  ) {}

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  async initialize(): Promise<void> {
    this.treasuryWalletId = await this.ensureSystemWallet(
      TREASURY_SYSTEM_TELEGRAM_ID,
      'Economy Treasury',
      this.config.treasuryWalletAddress,
    );

    this.rewardPoolWalletId = await this.ensureSystemWallet(
      REWARD_POOL_SYSTEM_TELEGRAM_ID,
      'Reward Pool',
      this.config.rewardPoolAddress,
    );

    if (this.config.initialSupply > 0) {
      const currentBalance = await this.walletRepository.getBalance(this.rewardPoolWalletId);
      if (currentBalance === 0) {
        await this.validateMaxSupply(this.config.initialSupply);
        await this.ledgerService.mint(
          this.rewardPoolWalletId,
          this.config.initialSupply,
          ECONOMY_TRANSLATIONS.en.initialSupplyMemo,
        );
      }
    }
  }

  private async ensureSystemWallet(telegramId: bigint, firstName: string, address: string): Promise<number> {
    // Look up wallet by address
    const existing = await this.prisma.wallet.findUnique({ where: { address } });
    if (existing) {
      return existing.id;
    }

    // Create system user if needed
    let user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId,
          firstName,
          language: 'en',
          role: 'USER',
          isActive: true,
        },
      });
    }

    // Create wallet for system user
    const wallet = await this.prisma.wallet.create({
      data: { userId: user.id, address },
    });

    return wallet.id;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  async claimDailyReward(walletId: number): Promise<Transaction> {
    this.assertInitialized();
    const rewardPoolId = this.rewardPoolWalletId!;

    // Check cooldown
    const existing = await this.dailyRewardClaimRepository.findByWalletId(walletId);
    if (existing) {
      const elapsed = Date.now() - existing.claimedAt.getTime();
      if (elapsed < DAILY_REWARD_COOLDOWN_MS) {
        const nextClaimAt = new Date(existing.claimedAt.getTime() + DAILY_REWARD_COOLDOWN_MS);
        throw new DailyRewardAlreadyClaimedError(walletId, nextClaimAt);
      }
    }

    // Check reward pool balance
    const poolBalance = await this.walletRepository.getBalance(rewardPoolId);
    if (poolBalance < this.config.dailyRewardAmount) {
      throw new RewardPoolExhaustedError();
    }

    // Transfer reward from pool to user wallet
    const transaction = await this.ledgerService.transfer(
      rewardPoolId,
      walletId,
      this.config.dailyRewardAmount,
      ECONOMY_TRANSLATIONS.en.dailyRewardMemo,
    );

    // Record claim
    await this.dailyRewardClaimRepository.upsert(walletId, new Date());

    return transaction;
  }

  async transferWithFee(
    fromWalletId: number,
    toWalletId: number,
    amount: number,
    memo?: string | null,
  ): Promise<TransferWithFeeResult> {
    this.assertInitialized();
    const treasuryId = this.treasuryWalletId!;

    const fee = this.calculateFee(amount);
    const netAmount = round8(amount - fee);

    const transfer = await this.ledgerService.transfer(fromWalletId, toWalletId, netAmount, memo ?? null);

    let feeTransaction: Transaction | null = null;
    if (fee > 0) {
      feeTransaction = await this.ledgerService.transfer(
        fromWalletId,
        treasuryId,
        fee,
        ECONOMY_TRANSLATIONS.en.transferFeeMemo,
      );
    }

    return { transfer, fee: feeTransaction };
  }

  async getTotalSupply(): Promise<number> {
    const result = await this.prisma.wallet.aggregate({ _sum: { balance: true } });
    const raw = result._sum.balance;
    if (!raw) return 0;
    return (raw as unknown as { toNumber(): number }).toNumber();
  }

  async validateMaxSupply(additionalAmount: number): Promise<void> {
    const current = await this.getTotalSupply();
    if (current + additionalAmount > this.config.maxSupply) {
      throw new MaxSupplyExceededError(current, additionalAmount, this.config.maxSupply);
    }
  }

  async getTreasuryBalance(): Promise<number> {
    this.assertInitialized();
    return this.walletRepository.getBalance(this.treasuryWalletId!);
  }

  async getRewardPoolBalance(): Promise<number> {
    this.assertInitialized();
    return this.walletRepository.getBalance(this.rewardPoolWalletId!);
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private assertInitialized(): void {
    if (this.treasuryWalletId === null || this.rewardPoolWalletId === null) {
      throw new EconomyNotInitializedError();
    }
  }

  private calculateFee(amount: number): number {
    return round8((amount * this.config.transferFeePercent) / 100);
  }
}

/** Round to 8 decimal places (matches Decimal(18,8) precision). */
function round8(value: number): number {
  return Math.round(value * 1e8) / 1e8;
}
