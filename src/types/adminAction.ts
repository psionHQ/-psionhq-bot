export interface AdminAction {
  id: string;
  adminId: number;
  action: string;
  targetUserId: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface AdminActionCreateInput {
  adminId: number;
  action: string;
  targetUserId?: number | null;
  metadata?: Record<string, unknown> | null;
}
