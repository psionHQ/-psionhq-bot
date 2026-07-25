import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';
import type { Transaction } from '../../types';
import type { LedgerServiceContract } from '../ledger/interfaces';
import { InMemoryWalletRepository } from '../wallets/inMemoryWalletRepository';
import { InMemoryDailyRewardClaimRepository } from './inMemoryDailyRewardClaimRepository';
import { EconomyService } from './economyService';
import {
  DailyRewardAlreadyClaimedError,
  MaxSupplyExceededError,
  RewardPoolExhaustedError,
  EconomyNotInitializedError,
} from './errors';
import type { EconomyConfig } from '../../types/config';

// ---------------------------------------------------------------------------
// Minimal fake LedgerService backed by InMemoryWalletRepository
// ---------------------------------------------------------------------------

class FakeLedgerService implements LedgerServiceContract {
  constructor(private readonly walletRepo: InMemoryWalletRepository) {}

  async transfer(fromId: number, toId: number, amount: number, memo?: string | null): Promise<Transaction> {
    const debited = await this.walletRepo.debit(fromId, amount);
    if (!debited) {
      const { InsufficientBalanceError } = await import('../ledger/errors');
      throw new InsufficientBalanceError(fromId, amount);
    }
    await this.walletRepo.credit(toId, amount);
    return this.makeTx({ fromWalletId: fromId, toWalletId: toId, amount, type: 'TRANSFER', memo });
  }

  async mint(toId: number, amount: number, memo?: string | null): Promise<Transaction> {
    await this.walletRepo.credit(toId, amount);
    return this.makeTx({ fromWalletId: null, toWalletId: toId, amount, type: 'MINT', memo });
  }

  async burn(fromId: number, amount: number, memo?: string | null): Promise<Transaction> {
    await this.walletRepo.debit(fromId, amount);
    return this.makeTx({ fromWalletId: fromId, toWalletId: null, amount, type: 'BURN', memo });
  }

  async reward(toId: number, amount: number, memo?: string | null): Promise<Transaction> {
    await this.walletRepo.credit(toId, amount);
    return this.makeTx({ fromWalletId: null, toWalletId: toId, amount, type: 'REWARD', memo });
  }

  async getHistory(_walletId: number, _limit?: number): Promise<Transaction[]> {
    return [];
  }

  private makeTx(fields: {
    fromWalletId: number | null;
    toWalletId: number | null;
    amount: number;
    type: Transaction['type'];
    memo?: string | null;
  }): Transaction {
    return {
      id: randomUUID(),
      fromWalletId: fields.fromWalletId,
      toWalletId: fields.toWalletId,
      amount: fields.amount,
      type: fields.type,
      status: 'COMPLETED',
      memo: fields.memo ?? null,
      createdAt: new Date(),
    };
  }
}

// ---------------------------------------------------------------------------
// Minimal fake PrismaClient (only what EconomyService uses)
// ---------------------------------------------------------------------------

function makeFakePrisma(walletRepo: InMemoryWalletRepository) {
  let userIdCounter = 100;

  return {
    user: {
      findUnique: async (_args: { where: { telegramId: bigint } }) => null,
      create: async (args: { data: { telegramId: bigint; firstName: string; language: string; role: string; isActive: boolean } }) => ({
        id: userIdCounter++,
        ...args.data,
        registeredAt: new Date(),
      }),
    },
    wallet: {
      findUnique: async (_args: { where: { address: string } }) => null,
      create: async (args: { data: { userId: number; address: string } }) => {
        const w = await walletRepo.create(args.data.userId, args.data.address);
        return { id: w.id, userId: w.userId, address: w.address, balance: { toNumber: () => w.balance }, createdAt: w.createdAt };
      },
      aggregate: async (_args: unknown) => ({
        _sum: {
          balance: {
            toNumber: () => {
              let total = 0;
              return total;
            },
          },
        },
      }),
    },
  } as unknown as import('@prisma/client').PrismaClient;
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const DEFAULT_ECONOMY_CONFIG: EconomyConfig = {
  maxSupply: 1_000_000,
  initialSupply: 0,
  treasuryWalletAddress: 'PSI_TREASURY_TEST',
  rewardPoolAddress: 'PSI_REWARD_POOL_TEST',
  transferFeePercent: 1,
  dailyRewardAmount: 50,
};

interface TestContext {
  walletRepo: InMemoryWalletRepository;
  ledger: FakeLedgerService;
  claimRepo: InMemoryDailyRewardClaimRepository;
  prisma: ReturnType<typeof makeFakePrisma>;
  service: EconomyService;
  treasuryWalletId: number;
  rewardPoolWalletId: number;
  userWalletId: number;
}

async function createTestContext(overrides: Partial<EconomyConfig> = {}): Promise<TestContext> {
  const walletRepo = new InMemoryWalletRepository();
  const ledger = new FakeLedgerService(walletRepo);
  const claimRepo = new InMemoryDailyRewardClaimRepository();

  // Pre-create treasury and reward-pool wallets (simulating initialize)
  const treasuryWallet = await walletRepo.create(1000, 'PSI_TREASURY_TEST');
  const rewardPoolWallet = await walletRepo.create(1001, 'PSI_REWARD_POOL_TEST');
  const userWallet = await walletRepo.create(1, 'USER_WALLET_1');

  const prisma = {
    user: {
      findUnique: async (_args: unknown) => null,
      create: async (_args: unknown) => ({ id: 999 }),
    },
    wallet: {
      findUnique: async (args: { where: { address: string } }) => {
        if (args.where.address === 'PSI_TREASURY_TEST') {
          return { id: treasuryWallet.id };
        }
        if (args.where.address === 'PSI_REWARD_POOL_TEST') {
          return { id: rewardPoolWallet.id };
        }
        return null;
      },
      create: async (_args: unknown) => ({ id: 999 }),
      aggregate: async (_args: unknown) => {
        let total = 0;
        const wallets = [treasuryWallet, rewardPoolWallet, userWallet];
        for (const w of wallets) {
          total += (await walletRepo.getBalance(w.id));
        }
        return { _sum: { balance: { toNumber: () => total } } };
      },
    },
  } as unknown as import('@prisma/client').PrismaClient;

  const config: EconomyConfig = { ...DEFAULT_ECONOMY_CONFIG, ...overrides };
  const service = new EconomyService(ledger, walletRepo, claimRepo, config, prisma);

  await service.initialize();

  return {
    walletRepo,
    ledger,
    claimRepo,
    prisma,
    service,
    treasuryWalletId: treasuryWallet.id,
    rewardPoolWalletId: rewardPoolWallet.id,
    userWalletId: userWallet.id,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EconomyService', () => {
  describe('initialize()', () => {
    it('resolves wallet IDs for treasury and reward pool', async () => {
      const ctx = await createTestContext();
      // getTreasuryBalance should not throw (i.e., initialized)
      await expect(ctx.service.getTreasuryBalance()).resolves.toBeTypeOf('number');
      await expect(ctx.service.getRewardPoolBalance()).resolves.toBeTypeOf('number');
    });

    it('throws EconomyNotInitializedError when methods are called before initialize()', async () => {
      const walletRepo = new InMemoryWalletRepository();
      const ledger = new FakeLedgerService(walletRepo);
      const claimRepo = new InMemoryDailyRewardClaimRepository();
      const prisma = makeFakePrisma(walletRepo);
      const svc = new EconomyService(ledger, walletRepo, claimRepo, DEFAULT_ECONOMY_CONFIG, prisma);

      await expect(svc.getTreasuryBalance()).rejects.toBeInstanceOf(EconomyNotInitializedError);
      await expect(svc.getRewardPoolBalance()).rejects.toBeInstanceOf(EconomyNotInitializedError);
      await expect(svc.claimDailyReward(1)).rejects.toBeInstanceOf(EconomyNotInitializedError);
      await expect(svc.transferWithFee(1, 2, 10)).rejects.toBeInstanceOf(EconomyNotInitializedError);
    });
  });

  describe('claimDailyReward()', () => {
    it('transfers dailyRewardAmount from reward pool to user wallet', async () => {
      const ctx = await createTestContext();

      // Seed the reward pool
      await ctx.walletRepo.credit(ctx.rewardPoolWalletId, 1000);

      const initialUserBalance = await ctx.walletRepo.getBalance(ctx.userWalletId);
      const initialPoolBalance = await ctx.walletRepo.getBalance(ctx.rewardPoolWalletId);

      await ctx.service.claimDailyReward(ctx.userWalletId);

      const afterUserBalance = await ctx.walletRepo.getBalance(ctx.userWalletId);
      const afterPoolBalance = await ctx.walletRepo.getBalance(ctx.rewardPoolWalletId);

      expect(afterUserBalance).toBe(initialUserBalance + DEFAULT_ECONOMY_CONFIG.dailyRewardAmount);
      expect(afterPoolBalance).toBe(initialPoolBalance - DEFAULT_ECONOMY_CONFIG.dailyRewardAmount);
    });

    it('returns a transaction record', async () => {
      const ctx = await createTestContext();
      await ctx.walletRepo.credit(ctx.rewardPoolWalletId, 1000);

      const tx = await ctx.service.claimDailyReward(ctx.userWalletId);

      expect(tx.type).toBe('TRANSFER');
      expect(tx.status).toBe('COMPLETED');
      expect(tx.amount).toBe(DEFAULT_ECONOMY_CONFIG.dailyRewardAmount);
      expect(tx.fromWalletId).toBe(ctx.rewardPoolWalletId);
      expect(tx.toWalletId).toBe(ctx.userWalletId);
    });

    it('throws DailyRewardAlreadyClaimedError on second claim within 24 h', async () => {
      const ctx = await createTestContext();
      await ctx.walletRepo.credit(ctx.rewardPoolWalletId, 10000);

      await ctx.service.claimDailyReward(ctx.userWalletId);
      await expect(ctx.service.claimDailyReward(ctx.userWalletId)).rejects.toBeInstanceOf(
        DailyRewardAlreadyClaimedError,
      );
    });

    it('allows a second claim after the cooldown has elapsed', async () => {
      const ctx = await createTestContext();
      await ctx.walletRepo.credit(ctx.rewardPoolWalletId, 10000);

      // First claim with a timestamp 25 hours ago
      const pastDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
      await ctx.claimRepo.upsert(ctx.userWalletId, pastDate);

      await expect(ctx.service.claimDailyReward(ctx.userWalletId)).resolves.toBeDefined();
    });

    it('throws RewardPoolExhaustedError when pool has insufficient funds', async () => {
      const ctx = await createTestContext();
      // Pool starts at 0

      await expect(ctx.service.claimDailyReward(ctx.userWalletId)).rejects.toBeInstanceOf(RewardPoolExhaustedError);
    });
  });

  describe('transferWithFee()', () => {
    it('sends net amount to recipient and fee to treasury', async () => {
      const ctx = await createTestContext();
      const amount = 100;
      const expectedFee = Math.round(amount * DEFAULT_ECONOMY_CONFIG.transferFeePercent * 1e6) / 1e8;
      const expectedNet = Math.round((amount - expectedFee) * 1e8) / 1e8;

      await ctx.walletRepo.credit(ctx.userWalletId, 200);

      const recipientWallet = await ctx.walletRepo.create(2, 'RECIPIENT_WALLET');

      const result = await ctx.service.transferWithFee(ctx.userWalletId, recipientWallet.id, amount);

      const recipientBalance = await ctx.walletRepo.getBalance(recipientWallet.id);
      const treasuryBalance = await ctx.walletRepo.getBalance(ctx.treasuryWalletId);

      expect(recipientBalance).toBeCloseTo(expectedNet, 7);
      expect(treasuryBalance).toBeCloseTo(expectedFee, 7);
      expect(result.transfer).toBeDefined();
      expect(result.fee).toBeDefined();
    });

    it('returns null fee when feePercent is 0', async () => {
      const ctx = await createTestContext({ transferFeePercent: 0 });
      await ctx.walletRepo.credit(ctx.userWalletId, 200);

      const recipientWallet = await ctx.walletRepo.create(2, 'RECIPIENT_WALLET_2');
      const result = await ctx.service.transferWithFee(ctx.userWalletId, recipientWallet.id, 100);

      expect(result.fee).toBeNull();
      expect(result.transfer.amount).toBe(100);
    });
  });

  describe('validateMaxSupply()', () => {
    it('resolves when additional amount does not exceed max supply', async () => {
      const ctx = await createTestContext({ maxSupply: 1_000_000 });
      await expect(ctx.service.validateMaxSupply(100)).resolves.toBeUndefined();
    });

    it('throws MaxSupplyExceededError when additional amount exceeds max supply', async () => {
      const ctx = await createTestContext({ maxSupply: 100 });

      // Seed wallets so total supply > 100
      await ctx.walletRepo.credit(ctx.rewardPoolWalletId, 80);
      await ctx.walletRepo.credit(ctx.userWalletId, 80);

      await expect(ctx.service.validateMaxSupply(50)).rejects.toBeInstanceOf(MaxSupplyExceededError);
    });
  });

  describe('getTotalSupply()', () => {
    it('returns the sum of all wallet balances', async () => {
      const ctx = await createTestContext();
      await ctx.walletRepo.credit(ctx.rewardPoolWalletId, 500);
      await ctx.walletRepo.credit(ctx.userWalletId, 250);

      const supply = await ctx.service.getTotalSupply();
      expect(supply).toBe(750);
    });
  });

  describe('getTreasuryBalance() / getRewardPoolBalance()', () => {
    it('returns correct balances', async () => {
      const ctx = await createTestContext();
      await ctx.walletRepo.credit(ctx.treasuryWalletId, 123);
      await ctx.walletRepo.credit(ctx.rewardPoolWalletId, 456);

      expect(await ctx.service.getTreasuryBalance()).toBe(123);
      expect(await ctx.service.getRewardPoolBalance()).toBe(456);
    });
  });
});
