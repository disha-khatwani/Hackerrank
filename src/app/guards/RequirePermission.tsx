import type { ReactNode } from 'react';
import type { Permission } from '@/types';
import { usePermission } from '@/hooks/usePermission';
import { UnauthorizedPage } from '../StatusPages';

export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const allowed = usePermission(permission);
  if (!allowed) return <UnauthorizedPage />;
  return <>{children}</>;
}
