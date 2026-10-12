import { ArrowRight, CheckCircle2, LayoutGrid, Shield, Sparkles, UserRound, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { ROLES } from '@/config/roles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { authService, tenantService } from '@/services/api';
import { useSessionStore } from '@/store/sessionStore';
import type { Tenant, User } from '@/types';

function groupByTenant(users: User[], tenants: Tenant[]) {
  const map = new Map<string, { tenant: Tenant | null; users: User[] }>();
  for (const user of users) {
    const key = user.tenantId ?? 'platform';
    if (!map.has(key)) {
      map.set(key, { tenant: tenants.find((t) => t.id === user.tenantId) ?? null, users: [] });
    }
    map.get(key)?.users.push(user);
  }
  return Array.from(map.values());
}

export function LoginPage() {
  const navigate = useNavigate();
  const signIn = useSessionStore((s) => s.signIn);
  const { data: users } = useAsyncData(() => authService.listDemoIdentities(), []);
  const { data: tenants } = useAsyncData(() => tenantService.list(), []);

  const groups = users && tenants ? groupByTenant(users, tenants) : [];

  function handleSignIn(user: User) {
    const role = user.roles[0];
    if (!role) return;
    signIn(user, role);
    navigate('/app');
  }

  return (
    <div className="relative min-h-screen bg-[#f4f5fa] text-slate-800">
      {/* Top subtle brand bar */}
      <div className="h-1.5 bg-[#4648D4]" />

      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        {/* Brand Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f2f3fe] px-4 py-1.5 text-xs font-bold text-[#4648D4] mb-4">
            <Sparkles className="size-3.5" />
            <span>Kombee Technical Assessment & Skills Platform</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5 justify-center sm:justify-start">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#4648D4] text-white shadow-md shadow-[#4648D4]/25">
                <LayoutGrid className="size-6" />
              </span>
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Kombee
                </span>
                <p className="text-xs font-semibold text-slate-400">
                  Adaptive Assessments · AI Proctoring · Live Coding
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full bg-white px-3 py-1 font-semibold border border-slate-200/80 shadow-2xs">
                SOC2 Type II
              </span>
              <span className="rounded-full bg-white px-3 py-1 font-semibold border border-slate-200/80 shadow-2xs">
                Enterprise Cloud
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Choose a demo identity
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
              Simulated authentication for prototype evaluation. Select any user to immediately launch into their dedicated role dashboard.
            </p>
          </div>
        </div>

        {/* Identity Groups Cards */}
        <div className="space-y-6">
          {groups.map(({ tenant, users: tenantUsers }) => (
            <div
              key={tenant?.id ?? 'platform'}
              className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {/* Tenant Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[#f2f3fe] text-[#4648D4] font-bold text-sm">
                    {tenant?.name?.slice(0, 2).toUpperCase() ?? 'KP'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {tenant?.name ?? 'Kombee Platform (Cross-Tenant Admin)'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {tenant ? `${tenant.kind} · Billing: ${tenant.billingStatus}` : 'Platform root administration'}
                    </p>
                  </div>
                </div>

                {tenant && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {tenant.dataResidency.toUpperCase()} Region
                  </span>
                )}
              </div>

              {/* Users list */}
              <div className="grid grid-cols-1 gap-2.5">
                {tenantUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSignIn(user)}
                    className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-left transition-all duration-150 hover:bg-white hover:border-[#4648D4]/40 hover:shadow-md hover:shadow-[#4648D4]/5 hover:translate-x-0.5"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar name={user.name} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#4648D4] transition-colors">
                            {user.name}
                          </p>
                          <span className="text-[11px] text-slate-400">·</span>
                          <span className="text-xs text-slate-400 truncate font-mono">
                            {user.email}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {user.roles.map((r) => (
                            <span
                              key={r}
                              className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200/60 shadow-2xs group-hover:border-[#4648D4]/30 group-hover:text-[#4648D4]"
                            >
                              {ROLES[r]?.label ?? r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-flex text-xs font-bold text-slate-400 group-hover:text-[#4648D4] transition-colors">
                        Launch
                      </span>
                      <div className="flex size-8 items-center justify-center rounded-full bg-white text-slate-400 border border-slate-200/80 shadow-2xs group-hover:bg-[#4648D4] group-hover:text-white group-hover:border-[#4648D4] transition-all">
                        <ArrowRight className="size-3.5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Candidate Experience Card */}
          <div className="rounded-[26px] border border-dashed border-slate-300 bg-white p-5">
            <div className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#f2f3fe] text-[#4648D4]">
                <UserRound className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Preview Candidate Experience
                </p>
                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                  Sign in as a Recruiter, then click into any Candidate → Preview Assessment to experience the candidate test sandbox.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
