import { create } from 'zustand';
import type { Permission, RoleKey, Session, User } from '@/types';
import { getPermissionsForRoles } from '@/config/roles';

interface SessionState {
  session: Session | null;
  signIn: (user: User, roleKey: RoleKey) => void;
  switchRole: (roleKey: RoleKey) => void;
  signOut: () => void;
  hasPermission: (permission: Permission) => boolean;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,

  signIn: (user, roleKey) =>
    set({
      session: {
        user,
        tenantId: user.tenantId,
        activeRole: roleKey,
        permissions: getPermissionsForRoles([roleKey]),
      },
    }),

  switchRole: (roleKey) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          activeRole: roleKey,
          permissions: getPermissionsForRoles([roleKey]),
        },
      };
    }),

  signOut: () => set({ session: null }),

  hasPermission: (permission) => get().session?.permissions.includes(permission) ?? false,
}));
