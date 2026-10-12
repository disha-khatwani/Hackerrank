import type { Permission } from '@/types';
import { useSessionStore } from '@/store/sessionStore';

export function usePermission(permission: Permission): boolean {
  return useSessionStore((s) => s.session?.permissions.includes(permission) ?? false);
}

export function useHasAnyPermission(permissions: Permission[]): boolean {
  return useSessionStore((s) => permissions.some((p) => s.session?.permissions.includes(p)));
}
