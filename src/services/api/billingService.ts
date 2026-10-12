import { db } from '../mocks/db';
import { simulateLatency } from './shared';

export const billingService = {
  async getUsageRecords(tenantId: string) {
    await simulateLatency();
    return db.usageRecords.filter((r) => r.tenantId === tenantId);
  },

  async getModuleCatalog() {
    await simulateLatency();
    return db.moduleCatalog;
  },
};

export const platformAdminService = {
  async listTenants() {
    await simulateLatency();
    return db.tenants;
  },

  async setTenantLifecycle(tenantId: string, status: 'active' | 'suspended' | 'offboarding' | 'archived') {
    await simulateLatency();
    const tenant = db.tenants.find((t) => t.id === tenantId);
    if (!tenant) throw new Error(`Unknown tenant: ${tenantId}`);
    tenant.lifecycleStatus = status;
    db.appendAuditLog({
      tenantId,
      actorId: 'current-user',
      actorName: 'Current user',
      action: `Set tenant lifecycle status to "${status}"`,
      targetType: 'Tenant',
      targetId: tenantId,
    });
    return tenant;
  },
};
