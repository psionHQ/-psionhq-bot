import type { PrismaClient } from '@prisma/client';
import type { Transaction, TransactionCreateInput } from '../../types';
import type { WalletRepository } from '../wallets/interfaces';
import {
  InsufficientBalanceError,
  InvalidAmountError,
  LedgerError,
  SameWalletTransferError,
  WalletNotFoundError,
} from './errors';
import type { LedgerServiceContract, TransactionRepository } from './interfaces';

export class LedgerService implements LedgerServiceContract {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly walletRepository: WalletRepository,
    private readonly prisma: PrismaClient,
  ) {}

  private validateAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new InvalidAmountError(amount);
    }
  }

  private async ensureWalletExists(walletId: number, client: Parameters<WalletRepository['findById']>[1]): Promise<void> {
    const wallet = await this.walletRepository.findById(walletId, client);
    if (!wallet) {
      throw new WalletNotFoundError(walletId);
    }
  }

  private async safelyCreateFailedTransaction(input: TransactionCreateInput): Promise<void> {
    try {
      await this.transactionRepository.create(input);
    } catch {
      // Best-effort failure tracking
    }
  }

  async transfer(
    fromWalletId: number,
    toWalletId: number,
    amount: number,
    memo?: string | null,
  ): Promise<Transaction> {
    if (fromWalletId === toWalletId) {
      throw new SameWalletTransferError(fromWalletId);
    }

    this.validateAmount(amount);

    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.ensureWalletExists(fromWalletId, tx);
        await this.ensureWalletExists(toWalletId, tx);

        const debitedWallet = await this.walletRepository.debit(fromWalletId, amount, tx);
        if (!debitedWallet) {
          throw new InsufficientBalanceError(fromWalletId, amount);
        }

        await this.walletRepository.credit(toWalletId, amount, tx);

        return this.transactionRepository.create(
          {
            fromWalletId,
            toWalletId,
            amount,
            type: 'TRANSFER',
            status: 'COMPLETED',
            memo: memo ?? null,
          },
          tx,
        );
      });
    } catch (error) {
      if (error instanceof LedgerError) {
        await this.safelyCreateFailedTransaction({
          fromWalletId,
          toWalletId,
          amount,
          type: 'TRANSFER',
          status: 'FAILED',
          memo: memo ?? null,
        });
      }
      throw error;
    }
  }

  async mint(toWalletId: number, amount: number, memo?: string | null): Promise<Transaction> {
    this.validateAmount(amount);

    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.ensureWalletExists(toWalletId, tx);
        await this.walletRepository.credit(toWalletId, amount, tx);

        return this.transactionRepository.create(
          {
            fromWalletId: null,
            toWalletId,
            amount,
            type: 'MINT',
            status: 'COMPLETED',
            memo: memo ?? null,
          },
          tx,
        );
      });
    } catch (error) {
      if (error instanceof LedgerError) {
        await this.safelyCreateFailedTransaction({
          fromWalletId: null,
          toWalletId,
          amount,
          type: 'MINT',
          status: 'FAILED',
          memo: memo ?? null,
        });
      }
      throw error;
    }
  }

  async burn(fromWalletId: number, amount: number, memo?: string | null): Promise<Transaction> {
    this.validateAmount(amount);

    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.ensureWalletExists(fromWalletId, tx);

        const debitedWallet = await this.walletRepository.debit(fromWalletId, amount, tx);
        if (!debitedWallet) {
          throw new InsufficientBalanceError(fromWalletId, amount);
        }

        return this.transactionRepository.create(
          {
            fromWalletId,
            toWalletId: null,
            amount,
            type: 'BURN',
            status: 'COMPLETED',
            memo: memo ?? null,
          },
          tx,
        );
      });
    } catch (error) {
      if (error instanceof LedgerError) {
        await this.safelyCreateFailedTransaction({
          fromWalletId,
          toWalletId: null,
          amount,
          type: 'BURN',
          status: 'FAILED',
          memo: memo ?? null,
        });
      }
      throw error;
    }
  }

  async reward(toWalletId: number, amount: number, memo?: string | null): Promise<Transaction> {
    this.validateAmount(amount);

    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.ensureWalletExists(toWalletId, tx);
        await this.walletRepository.credit(toWalletId, amount, tx);

        return this.transactionRepository.create(
          {
            fromWalletId: null,
            toWalletId,
            amount,
            type: 'REWARD',
            status: 'COMPLETED',
            memo: memo ?? null,
          },
          tx,
        );
      });
    } catch (error) {
      if (error instanceof LedgerError) {
        await this.safelyCreateFailedTransaction({
          fromWalletId: null,
          toWalletId,
          amount,
          type: 'REWARD',
          status: 'FAILED',
          memo: memo ?? null,
        });
      }
      throw error;
    }
  }

  async getHistory(walletId: number, limit: number = 10): Promise<Transaction[]> {
    await this.ensureWalletExists(walletId, undefined);
    return this.transactionRepository.findByWalletId(walletId, limit);
  }
}
