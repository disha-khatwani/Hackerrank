import type { ModuleKey, Tenant } from '@/types';
import { db } from '../mocks/db';
import { simulateLatency } from './shared';

export const tenantService = {
  async list(): Promise<Tenant[]> {
    await simulateLatency();
    return db.tenants;
  },

  async getById(tenantId: string): Promise<Tenant | null> {
    await simulateLatency(120);
    return db.tenants.find((t) => t.id === tenantId) ?? null;
  },

  async isModuleEnabled(tenantId: string, module: ModuleKey): Promise<boolean> {
    const tenant = db.tenants.find((t) => t.id === tenantId);
    return tenant?.entitlements.find((e) => e.module === module)?.enabled ?? false;
  },

  async setModuleEnabled(tenantId: string, module: ModuleKey, enabled: boolean): Promise<Tenant> {
    await simulateLatency();
    const tenant = db.tenants.find((t) => t.id === tenantId);
    if (!tenant) throw new Error(`Unknown tenant: ${tenantId}`);
    const entitlement = tenant.entitlements.find((e) => e.module === module);
    if (entitlement) {
      entitlement.enabled = enabled;
      entitlement.enabledOn = enabled ? new Date().toISOString() : undefined;
      entitlement.accessSurfaces = enabled ? ['web', 'api'] : [];
    }
    db.appendAuditLog({
      tenantId,
      actorId: 'current-user',
      actorName: 'Current user',
      action: enabled ? `Enabled module: ${module}` : `Disabled module: ${module}`,
      targetType: 'Module',
      targetId: module,
    });
    return tenant;
  },

  async getTeams(tenantId: string) {
    await simulateLatency(120);
    return db.teams.filter((t) => t.tenantId === tenantId);
  },

  async getUsers(tenantId: string) {
    await simulateLatency();
    return db.users.filter((u) => u.tenantId === tenantId);
  },

  async getAuditLog(tenantId: string) {
    await simulateLatency();
    return db.auditLog.filter((a) => a.tenantId === tenantId);
  },
};
