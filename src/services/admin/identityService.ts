import type { AdminAction, User, UserRole } from '../../types';
import type { UserRepository } from '../users/interfaces';
import type { AdminRepository } from './interfaces';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
};

export class IdentityService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  /**
   * Returns true if the user has at least the given role.
   */
  async hasRole(telegramId: number, role: UserRole): Promise<boolean> {
    const user = await this.userRepository.findByTelegramId(telegramId);
    if (!user || !user.isActive) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[role];
  }

  /**
   * Throws an error if the user does not have at least the given role.
   */
  async requireRole(telegramId: number, role: UserRole): Promise<void> {
    const allowed = await this.hasRole(telegramId, role);
    if (!allowed) {
      throw new Error(`Access denied: requires role ${role}`);
    }
  }

  /**
   * Changes the role of a target user. Records the action.
   */
  async changeRole(adminTelegramId: number, targetTelegramId: number, newRole: UserRole): Promise<User> {
    await this.requireRole(adminTelegramId, 'ADMIN');

    const admin = await this.userRepository.findByTelegramId(adminTelegramId);
    const target = await this.userRepository.findByTelegramId(targetTelegramId);

    if (!admin?.id) throw new Error('Admin user not found');
    if (!target?.id) throw new Error('Target user not found');

    const oldRole = target.role;
    const updated = await this.userRepository.update(targetTelegramId, { role: newRole });

    await this.adminRepository.recordAction({
      adminId: admin.id,
      action: 'CHANGE_ROLE',
      targetUserId: target.id,
      metadata: { oldRole, newRole },
    });

    return updated;
  }

  /**
   * Deactivates a user. Records the action.
   */
  async deactivateUser(adminTelegramId: number, targetTelegramId: number): Promise<User> {
    await this.requireRole(adminTelegramId, 'ADMIN');

    const admin = await this.userRepository.findByTelegramId(adminTelegramId);
    const target = await this.userRepository.findByTelegramId(targetTelegramId);

    if (!admin?.id) throw new Error('Admin user not found');
    if (!target?.id) throw new Error('Target user not found');

    const updated = await this.userRepository.update(targetTelegramId, { isActive: false });

    await this.adminRepository.recordAction({
      adminId: admin.id,
      action: 'DEACTIVATE_USER',
      targetUserId: target.id,
    });

    return updated;
  }

  /**
   * Activates a user. Records the action.
   */
  async activateUser(adminTelegramId: number, targetTelegramId: number): Promise<User> {
    await this.requireRole(adminTelegramId, 'ADMIN');

    const admin = await this.userRepository.findByTelegramId(adminTelegramId);
    const target = await this.userRepository.findByTelegramId(targetTelegramId);

    if (!admin?.id) throw new Error('Admin user not found');
    if (!target?.id) throw new Error('Target user not found');

    const updated = await this.userRepository.update(targetTelegramId, { isActive: true });

    await this.adminRepository.recordAction({
      adminId: admin.id,
      action: 'ACTIVATE_USER',
      targetUserId: target.id,
    });

    return updated;
  }

  /**
   * Records an admin action directly.
   */
  async recordAdminAction(
    adminId: number,
    action: string,
    targetUserId?: number | null,
    metadata?: Record<string, unknown> | null,
  ): Promise<AdminAction> {
    return this.adminRepository.recordAction({ adminId, action, targetUserId, metadata });
  }

  /**
   * Returns the most recent admin actions.
   */
  async getAllAdminActions(limit = 50): Promise<AdminAction[]> {
    return this.adminRepository.findAllActions(limit);
  }
}
