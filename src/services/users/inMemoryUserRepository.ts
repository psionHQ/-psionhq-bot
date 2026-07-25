import type { User } from '../../types';
import type { UserRepository } from './interfaces';

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<number, User>();

  async findByTelegramId(telegramId: number): Promise<User | null> {
    return this.users.get(telegramId) ?? null;
  }

  async findById(id: number): Promise<User | null> {
    return this.findByTelegramId(id);
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async create(entity: User): Promise<User> {
    this.users.set(entity.telegramId, entity);
    return entity;
  }

  async update(id: number, entity: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);

    if (!existingUser) {
      throw new Error(`User with telegramId ${id} not found`);
    }

    const updatedUser: User = {
      ...existingUser,
      ...entity,
      telegramId: existingUser.telegramId,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
}
