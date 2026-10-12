import type { ModuleKey } from '@/types';
import { useTenantStore } from '@/store/tenantStore';

export function useEntitlement(module: ModuleKey): boolean {
  return useTenantStore((s) => s.tenant?.entitlements.find((e) => e.module === module)?.enabled ?? false);
}
