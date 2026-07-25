import type { Prisma, PrismaClient } from '@prisma/client';
import type { AdminAction, AdminActionCreateInput } from '../../types';
import type { AdminRepository } from './interfaces';

function mapToAdminAction(row: {
  id: string;
  adminId: number;
  action: string;
  targetUserId: number | null;
  metadata: unknown;
  createdAt: Date;
}): AdminAction {
  return {
    id: row.id,
    adminId: row.adminId,
    action: row.action,
    targetUserId: row.targetUserId,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    createdAt: row.createdAt,
  };
}

export class PrismaAdminRepository implements AdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async recordAction(input: AdminActionCreateInput): Promise<AdminAction> {
    const action = await this.prisma.adminAction.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        targetUserId: input.targetUserId ?? null,
        metadata: input.metadata != null ? (input.metadata as Prisma.InputJsonValue) : undefined,
      },
    });
    return mapToAdminAction(action);
  }

  async findActionsByAdmin(adminId: number, limit = 20): Promise<AdminAction[]> {
    const actions = await this.prisma.adminAction.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return actions.map(mapToAdminAction);
  }

  async findActionsByTarget(targetUserId: number, limit = 20): Promise<AdminAction[]> {
    const actions = await this.prisma.adminAction.findMany({
      where: { targetUserId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return actions.map(mapToAdminAction);
  }

  async findAllActions(limit = 50): Promise<AdminAction[]> {
    const actions = await this.prisma.adminAction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return actions.map(mapToAdminAction);
  }
}
