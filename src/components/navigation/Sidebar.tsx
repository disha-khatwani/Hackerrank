import { ChevronsLeft, ChevronsRight, LayoutGrid } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { NAV_SECTIONS } from '@/config/navigation';
import { useSessionStore } from '@/store/sessionStore';
import { useTenantStore } from '@/store/tenantStore';
import { cn } from '@/utils/cn';
import type { ModuleKey, Permission } from '@/types';

function useOptionalPermission(permission?: Permission): boolean {
  return useSessionStore((s) => (permission ? (s.session?.permissions.includes(permission) ?? false) : true));
}

function useOptionalEntitlement(module?: ModuleKey): boolean {
  return useTenantStore((s) =>
    module ? (s.tenant?.entitlements.find((e) => e.module === module)?.enabled ?? false) : true,
  );
}

function NavItemLink({
  to,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all duration-150',
          isActive
            ? 'bg-[#4648D4] text-white font-semibold shadow-md shadow-[#4648D4]/25'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
          collapsed && 'justify-center px-2 py-2.5',
        )
      }
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'size-[18px] shrink-0 transition-colors duration-150',
              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600',
            )}
          />
          {!collapsed && <span className="truncate tracking-tight">{label}</span>}
          {!collapsed && isActive && (
            <span className="ml-auto size-1.5 rounded-full bg-white/80" aria-hidden />
          )}
        </>
      )}
    </NavLink>
  );
}

function FilteredNavItem({
  module,
  permission,
  platformOnly,
  children,
}: {
  module?: ModuleKey;
  permission?: Permission;
  platformOnly?: boolean;
  children: React.ReactNode;
}) {
  const hasPermission = useOptionalPermission(permission);
  const moduleEnabled = useOptionalEntitlement(module);
  const isPlatformAdmin = useSessionStore((s) => s.session?.activeRole === 'platform-admin');

  if (platformOnly && !isPlatformAdmin) return null;
  if (!hasPermission) return null;
  if (module && !moduleEnabled) return null;

  return <>{children}</>;
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const tenant = useTenantStore((s) => s.tenant);

  return (
    <aside
      className={cn(
        'relative flex h-full shrink-0 flex-col border-r border-slate-200/80 bg-white transition-[width] duration-200 z-20',
        collapsed ? 'w-[72px]' : 'w-[250px]',
      )}
    >
      {/* Brand Logo Header */}
      <div className={cn('flex h-20 items-center border-b border-slate-100 px-5', collapsed && 'justify-center px-2')}>
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#4648D4] text-white shadow-md shadow-[#4648D4]/30">
            <LayoutGrid className="size-5" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Kombee
                </span>
              </div>
              <p className="truncate text-xs font-medium text-slate-400">
                {tenant?.name ?? 'Enterprise Platform'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5 scrollbar-thin">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.label || idx}>
            {section.label && !collapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <FilteredNavItem key={item.path} module={item.module} permission={item.permission} platformOnly={item.platformOnly}>
                  <NavItemLink to={item.path} icon={item.icon} label={item.label} collapsed={collapsed} />
                </FilteredNavItem>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700',
            collapsed && 'justify-center px-2',
          )}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
