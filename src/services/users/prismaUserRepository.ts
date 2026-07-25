import type { PrismaClient } from '@prisma/client';
import type { User, UserLanguage, UserRole } from '../../types';
import type { UserRepository } from './interfaces';

function mapToUser(row: {
  id: number;
  telegramId: bigint;
  username: string | null;
  firstName: string;
  language: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  registeredAt: Date;
}): User {
  return {
    id: row.id,
    telegramId: Number(row.telegramId),
    username: row.username,
    firstName: row.firstName,
    language: row.language as UserLanguage,
    role: row.role as UserRole,
    isActive: row.isActive,
    lastLoginAt: row.lastLoginAt,
    registeredAt: row.registeredAt,
  };
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByTelegramId(telegramId: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    return user ? mapToUser(user) : null;
  }

  async findById(id: number): Promise<User | null> {
    return this.findByTelegramId(id);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(mapToUser);
  }

  async create(entity: User): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        telegramId: BigInt(entity.telegramId),
        username: entity.username,
        firstName: entity.firstName,
        language: entity.language,
        role: entity.role,
        isActive: entity.isActive,
        lastLoginAt: entity.lastLoginAt,
        registeredAt: entity.registeredAt,
      },
    });
    return mapToUser(user);
  }

  async update(id: number, entity: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { telegramId: BigInt(id) },
      data: {
        ...(entity.username !== undefined && { username: entity.username }),
        ...(entity.firstName !== undefined && { firstName: entity.firstName }),
        ...(entity.language !== undefined && { language: entity.language }),
        ...(entity.role !== undefined && { role: entity.role }),
        ...(entity.isActive !== undefined && { isActive: entity.isActive }),
        ...(entity.lastLoginAt !== undefined && { lastLoginAt: entity.lastLoginAt }),
      },
    });
    return mapToUser(user);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { telegramId: BigInt(id) },
      });
      return true;
    } catch {
      return false;
    }
  }
}
