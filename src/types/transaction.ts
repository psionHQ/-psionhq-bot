export type TransactionType = 'TRANSFER' | 'MINT' | 'BURN' | 'REWARD' | 'FEE';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Transaction {
  id: string;
  fromWalletId: number | null;
  toWalletId: number | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  memo: string | null;
  createdAt: Date;
}

export interface TransactionCreateInput {
  fromWalletId?: number | null;
  toWalletId?: number | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  memo?: string | null;
}
