import { Bell, ChevronDown, Menu, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { ROLES } from '@/config/roles';
import { notificationService } from '@/services/api';
import { useSessionStore } from '@/store/sessionStore';
import { useTenantStore } from '@/store/tenantStore';
import { useAsyncData } from '@/hooks/useAsyncData';
import { formatRelative } from '@/utils/format';
import type { RoleKey } from '@/types';

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const session = useSessionStore((s) => s.session);
  const switchRole = useSessionStore((s) => s.switchRole);
  const signOut = useSessionStore((s) => s.signOut);
  const tenant = useTenantStore((s) => s.tenant);
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const userMenuRef = useClickOutside(() => setUserMenuOpen(false));
  const notifMenuRef = useClickOutside(() => setNotifMenuOpen(false));

  const { data: notifications } = useAsyncData(
    () => (session ? notificationService.list(session.user.id) : Promise.resolve([])),
    [session?.user.id],
  );
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  if (!session) return null;

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-4 bg-[#f4f5fa]/90 px-6 sm:px-8 backdrop-blur-md">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex size-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Tenant Indicator Pill */}
      <div className="hidden items-center gap-2 text-sm sm:flex">
        <div className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-white px-3.5 py-1.5 shadow-2xs">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-800 text-xs">{tenant?.name ?? 'Enterprise'}</span>
          {tenant && (
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
              {tenant.billingStatus}
            </span>
          )}
        </div>
      </div>

      {/* Pill Search Input (as seen in Image 2) */}
      <div className="relative ml-auto hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search candidates, tests, skills..."
          className="h-10 w-full rounded-full border border-slate-200/80 bg-white pl-10 pr-4 text-xs font-medium placeholder:text-slate-400 transition-all focus:border-[#4648D4] focus:outline-none focus:ring-4 focus:ring-[#4648D4]/10 shadow-2xs"
        />
      </div>

      {/* Notification Bell */}
      <div ref={notifMenuRef} className="relative ml-auto sm:ml-0">
        <button
          type="button"
          onClick={() => setNotifMenuOpen((v) => !v)}
          className="relative flex size-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors border border-slate-200/60"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex size-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>
        {notifMenuOpen && (
          <div className="absolute right-0 z-40 mt-3 w-80 rounded-3xl border border-slate-200/80 bg-white p-2 shadow-xl shadow-slate-900/10 animate-in fade-in-0 zoom-in-95 duration-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900">Notifications</p>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#f2f3fe] px-2.5 py-0.5 text-[10px] font-bold text-[#4648D4]">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications && notifications.length > 0 ? (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setNotifMenuOpen(false);
                      if (n.link) navigate(n.link);
                    }}
                    className="group block w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors rounded-2xl"
                  >
                    <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{n.body}</p>
                    <p className="mt-1 text-[10px] font-medium text-slate-400">{formatRelative(n.createdAt)}</p>
                  </button>
                ))
              ) : (
                <p className="px-4 py-8 text-center text-xs text-slate-400">All caught up.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Profile Pill Menu */}
      <div ref={userMenuRef} className="relative">
        <button
          type="button"
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex items-center gap-3 rounded-full bg-white p-1.5 pr-3 shadow-2xs hover:bg-slate-50 transition-all border border-slate-200/60"
        >
          <Avatar name={session.user.name} size="sm" />
          <div className="hidden text-left sm:block">
            <p className="text-xs font-bold leading-tight text-slate-800">{session.user.name}</p>
            <p className="text-[10px] font-medium leading-tight text-slate-400">{ROLES[session.activeRole].label}</p>
          </div>
          <ChevronDown
            className="size-3.5 text-slate-400 transition-transform duration-150"
            style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
        {userMenuOpen && (
          <div className="absolute right-0 z-40 mt-3 w-64 rounded-3xl border border-slate-200/80 bg-white p-2 shadow-xl shadow-slate-900/10 animate-in fade-in-0 zoom-in-95 duration-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900">{session.user.name}</p>
              <p className="text-[11px] font-medium text-slate-400 truncate">{session.user.email}</p>
            </div>
            {session.user.roles.length > 1 && (
              <div className="p-1 border-b border-slate-100">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Role
                </p>
                {session.user.roles.map((roleKey: RoleKey) => (
                  <button
                    key={roleKey}
                    onClick={() => {
                      switchRole(roleKey);
                      setUserMenuOpen(false);
                    }}
                    className={`flex items-center justify-between w-full rounded-2xl px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${
                      roleKey === session.activeRole
                        ? 'text-[#4648D4] font-bold bg-[#f2f3fe]'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{ROLES[roleKey].label}</span>
                    {roleKey === session.activeRole && (
                      <span className="size-1.5 rounded-full bg-[#4648D4]" />
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="p-1">
              <button
                onClick={() => {
                  signOut();
                  navigate('/login');
                }}
                className="block w-full rounded-2xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
              >
                Sign out / Switch identity
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
