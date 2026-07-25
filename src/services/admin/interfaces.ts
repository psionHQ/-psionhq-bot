import type { AdminAction, AdminActionCreateInput } from '../../types';

export interface AdminRepository {
  recordAction(input: AdminActionCreateInput): Promise<AdminAction>;
  findActionsByAdmin(adminId: number, limit?: number): Promise<AdminAction[]>;
  findActionsByTarget(targetUserId: number, limit?: number): Promise<AdminAction[]>;
  findAllActions(limit?: number): Promise<AdminAction[]>;
}
