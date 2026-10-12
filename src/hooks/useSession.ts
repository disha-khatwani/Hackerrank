import { useSessionStore } from '@/store/sessionStore';

export function useSession() {
  const session = useSessionStore((s) => s.session);
  return session;
}

export function useCurrentUser() {
  return useSessionStore((s) => s.session?.user ?? null);
}
