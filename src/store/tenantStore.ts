import { create } from 'zustand';
import type { ModuleKey, Tenant } from '@/types';

interface TenantState {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isModuleEnabled: (module: ModuleKey) => boolean;
  updateEntitlement: (module: ModuleKey, enabled: boolean) => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenant: null,
  setTenant: (tenant) => set({ tenant }),
  isModuleEnabled: (module) => get().tenant?.entitlements.find((e) => e.module === module)?.enabled ?? false,
  updateEntitlement: (module, enabled) =>
    set((state) => {
      if (!state.tenant) return state;
      return {
        tenant: {
          ...state.tenant,
          entitlements: state.tenant.entitlements.map((e) => (e.module === module ? { ...e, enabled } : e)),
        },
      };
    }),
}));
