import type { AdminAction, AdminActionCreateInput } from '../../types';
import type { AdminRepository } from './interfaces';
import { randomUUID } from 'crypto';

export class InMemoryAdminRepository implements AdminRepository {
  private readonly actions: AdminAction[] = [];

  async recordAction(input: AdminActionCreateInput): Promise<AdminAction> {
    const action: AdminAction = {
      id: randomUUID(),
      adminId: input.adminId,
      action: input.action,
      targetUserId: input.targetUserId ?? null,
      metadata: input.metadata ?? null,
      createdAt: new Date(),
    };
    this.actions.push(action);
    return action;
  }

  async findActionsByAdmin(adminId: number, limit = 20): Promise<AdminAction[]> {
    return this.actions
      .filter((a) => a.adminId === adminId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async findActionsByTarget(targetUserId: number, limit = 20): Promise<AdminAction[]> {
    return this.actions
      .filter((a) => a.targetUserId === targetUserId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async findAllActions(limit = 50): Promise<AdminAction[]> {
    return [...this.actions]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
