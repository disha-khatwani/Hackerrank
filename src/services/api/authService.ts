import type { RoleKey, Session, User } from '@/types';
import { getPermissionsForRoles } from '@/config/roles';
import { db } from '../mocks/db';
import { simulateLatency } from './shared';

/**
 * Simulated authentication. There is no real credential flow — the BRD
 * explicitly scopes this as a front-end prototype where tenant/permission
 * enforcement is simulated and MUST be backed by real backend authorization
 * and database-enforced tenant isolation in production (§7 of the brief).
 */
export const authService = {
  async listDemoIdentities(): Promise<User[]> {
    await simulateLatency(120);
    return db.users;
  },

  async signInAs(userId: string, roleKey?: RoleKey): Promise<Session> {
    await simulateLatency();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error(`Unknown demo identity: ${userId}`);
    const activeRole = roleKey ?? user.roles[0];
    if (!activeRole) throw new Error(`User ${userId} has no assigned role`);
    return {
      user,
      tenantId: user.tenantId,
      activeRole,
      permissions: getPermissionsForRoles([activeRole]),
    };
  },

  async switchActiveRole(userId: string, roleKey: RoleKey): Promise<Session> {
    return this.signInAs(userId, roleKey);
  },
};
