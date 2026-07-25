export class LedgerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidAmountError extends LedgerError {
  constructor(amount: number) {
    super(`Invalid amount: ${amount}. Amount must be greater than zero.`, 'INVALID_AMOUNT');
  }
}

export class WalletNotFoundError extends LedgerError {
  constructor(walletId: number) {
    super(`Wallet with id ${walletId} not found.`, 'WALLET_NOT_FOUND');
  }
}

export class InsufficientBalanceError extends LedgerError {
  constructor(walletId: number, amount: number) {
    super(`Insufficient balance in wallet ${walletId} for amount ${amount}.`, 'INSUFFICIENT_BALANCE');
  }
}

export class SameWalletTransferError extends LedgerError {
  constructor(walletId: number) {
    super(`Transfer source and destination cannot be the same wallet: ${walletId}.`, 'SAME_WALLET_TRANSFER');
  }
}
