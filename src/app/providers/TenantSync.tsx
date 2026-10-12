import { useEffect } from 'react';
import { tenantService } from '@/services/api';
import { useSessionStore } from '@/store/sessionStore';
import { useTenantStore } from '@/store/tenantStore';

/** Keeps the active tenant record in sync with the signed-in session's tenantId. */
export function TenantSync() {
  const tenantId = useSessionStore((s) => s.session?.tenantId);
  const setTenant = useTenantStore((s) => s.setTenant);

  useEffect(() => {
    let cancelled = false;
    if (!tenantId) {
      setTenant(null);
      return;
    }
    tenantService.getById(tenantId).then((tenant) => {
      if (!cancelled) setTenant(tenant);
    });
    return () => {
      cancelled = true;
    };
  }, [tenantId, setTenant]);

  return null;
}
