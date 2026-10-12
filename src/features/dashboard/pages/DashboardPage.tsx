import {
  Activity,
  ArrowUpRight,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Layers,
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonTable } from '@/components/feedback/Skeleton';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { assessmentService, candidateService, integrityService, reportingService } from '@/services/api';
import { formatPercent, formatRelative } from '@/utils/format';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/* ─── Custom Floating Tooltip for Bar Chart ─────────────────────── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl shadow-slate-900/10">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="mt-0.5 text-base font-extrabold text-[#4648D4]">{payload[0]?.value} Candidates</p>
      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
        <span>● Active in pipeline</span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';

  const { data: metrics, isLoading: metricsLoading } = useAsyncData(
    () => reportingService.getCompletionMetrics(tenantId),
    [tenantId],
  );
  const { data: funnel } = useAsyncData(() => reportingService.getFunnel(tenantId), [tenantId]);
  const { data: assessments, isLoading: assessmentsLoading } = useAsyncData(
    () => assessmentService.list(tenantId),
    [tenantId],
  );
  const { data: candidatesPage } = useAsyncData(
    () => candidateService.list(tenantId, {}, { page: 1, pageSize: 5 }),
    [tenantId],
  );
  const { data: flags } = useAsyncData(() => integrityService.listFlags(tenantId, 'pending'), [tenantId]);

  const recentAssessments = (assessments ?? []).slice(0, 5);
  const firstName = session?.user.name.split(' ')[0] ?? 'there';

  // Soft purple shades for funnel stages (matching reference Image 2)
  const funnelBarColors = ['#4648D4', '#686af5', '#8f91f7', '#b5b7fa', '#dedffc'];

  return (
    <div className="space-y-8 pb-12">
      {/* ── Top Header (as in Reference Image 1) ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Good morning, {firstName}!
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Let's make this hiring cycle productive.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-[11px] font-bold text-slate-400">Total invited</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {metricsLoading ? '—' : String(metrics?.invited ?? 0)}
                </span>
                <span className="text-xs font-bold text-slate-400">↗</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div>
              <p className="text-[11px] font-bold text-slate-400">Avg completion</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {metricsLoading ? '—' : formatPercent(metrics?.completionRatePercent ?? 0)}
                </span>
                <span className="text-xs font-bold text-slate-400">↗</span>
              </div>
            </div>
          </div>

          <Link to="/assessments/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 active:scale-95 transition-all"
            >
              <Plus className="size-4" />
              <span>+ New assessment</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ── Overview KPI Cards (as in Reference Image 2) ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Primary Brand Hero Card */}
        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#4648D4] via-[#5254e3] to-[#6062f8] p-6 text-white shadow-xl shadow-[#4648D4]/20 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur-md">
              Candidates invited 14% ↑
            </span>
            <Users className="size-4.5 text-white/70" />
          </div>
          <div className="mt-5">
            <p className="text-4xl font-extrabold tracking-tight">
              {metricsLoading ? '—' : String(metrics?.invited ?? 0)}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-white/80 font-medium">
              <span>vs. last month</span>
              <span className="font-semibold text-white">Active</span>
            </div>
          </div>
        </div>

        {/* Card 2: Completion Rate */}
        <div className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-100">
              Completion rate 13.3% ↑
            </span>
            <TrendingUp className="size-4.5 text-slate-300" />
          </div>
          <div className="mt-5">
            <p className="text-4xl font-extrabold tracking-tight text-slate-900">
              {metricsLoading ? '—' : formatPercent(metrics?.completionRatePercent ?? 0)}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>vs. last 30 days</span>
              <span className="font-semibold text-slate-600">82.4% avg</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pass Rate */}
        <div className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-[#4648D4] border border-indigo-100">
              Pass rate 4.3% ↑
            </span>
            <Activity className="size-4.5 text-slate-300" />
          </div>
          <div className="mt-5">
            <p className="text-4xl font-extrabold tracking-tight text-slate-900">
              {metricsLoading ? '—' : formatPercent(metrics?.passRatePercent ?? 0)}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>vs. benchmark</span>
              <span className="font-semibold text-slate-600">Target 60%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Integrity Flags */}
        <div className="rounded-[26px] border border-slate-100 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 border border-amber-100">
              Flags pending audit
            </span>
            <ShieldAlert className="size-4.5 text-slate-300" />
          </div>
          <div className="mt-5">
            <p className="text-4xl font-extrabold tracking-tight text-slate-900">
              {String(flags?.length ?? 0)}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Status</span>
              <span className="font-semibold text-amber-600">Needs review</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Funnel & Candidates Row (as in Reference Image 2 Platform View) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Platform View / Funnel Chart */}
        <div className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm lg:col-span-2">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Platform view</h2>
              <p className="text-xs text-slate-400 mt-0.5">Candidate progression through proctored stages</p>
            </div>
            <Link to="/candidates">
              <span className="inline-flex items-center rounded-full bg-[#f2f3fe] px-4 py-1.5 text-xs font-bold text-[#4648D4] hover:bg-[#e6e8fd] transition-colors">
                View candidates +
              </span>
            </Link>
          </div>

          {/* Stage Badges Row (reminiscent of Shopee, Tokopedia, Amazon breakdown) */}
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 border-b border-slate-100 pb-5">
            {[
              { name: 'Invited', count: '18', share: '100%', color: '#4648D4' },
              { name: 'Started', count: '15', share: '83.3%', color: '#686af5' },
              { name: 'Submitted', count: '13', share: '72.2%', color: '#8f91f7' },
              { name: 'Passed', count: '9', share: '50.0%', color: '#b5b7fa' },
            ].map((stage) => (
              <div key={stage.name} className="flex items-center gap-2.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <div>
                  <p className="text-[11px] font-bold text-slate-700">{stage.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{stage.count} · {stage.share}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="mt-6">
            {funnel ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={funnel} margin={{ left: -20, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc', radius: 10 }} />
                  <Bar dataKey="count" radius={[12, 12, 4, 4]} maxBarSize={48}>
                    {funnel.map((_, i) => (
                      <Cell
                        key={i}
                        fill={funnelBarColors[i % funnelBarColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-end gap-3 pb-2">
                {[6, 4, 3, 2, 1].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 animate-pulse rounded-t-2xl bg-slate-100"
                    style={{ height: `${h * 15}%` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Candidates (like bottom cards in Image 1 & 2) */}
        <div className="flex flex-col rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent candidates</h2>
              <p className="text-xs text-slate-400 mt-0.5">Assigned applicants</p>
            </div>
            <Link
              to="/candidates"
              className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#f2f3fe] hover:text-[#4648D4] transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="mt-4 flex-1 divide-y divide-slate-100">
            {(candidatesPage?.items ?? []).length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-400">No candidates available.</p>
            ) : (
              (candidatesPage?.items ?? []).map((c) => (
                <Link
                  key={c.id}
                  to={`/candidates/${c.id}`}
                  className="group flex items-center justify-between py-3.5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={c.name} size="md" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#4648D4] transition-colors truncate">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {c.appliedRole ?? 'Software Engineer'}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                    {formatRelative(c.createdAt)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Active Assessments & Operations (matching Image 1) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Assessments Table */}
        <div className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active assessments</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configured test batteries</p>
            </div>
            <Link
              to="/assessments"
              className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#f2f3fe] hover:text-[#4648D4] transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="mt-3">
            {assessmentsLoading ? (
              <SkeletonTable />
            ) : recentAssessments.length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-400">No assessments created.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAssessments.map((a) => (
                  <Link
                    key={a.id}
                    to={`/assessments/${a.id}`}
                    className="group flex items-center justify-between gap-4 py-3.5 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[#f2f3fe] text-[#4648D4] font-bold">
                        <ClipboardList className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#4648D4] transition-colors truncate">
                          {a.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {a.sections.length} Sections · {a.totalDurationMinutes} mins
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Operational Timeline & Actions (like "My activity" in Image 1) */}
        <div className="flex flex-col justify-between rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pipeline activity</h2>
                <p className="text-xs text-slate-400 mt-0.5">What is waiting for you today</p>
              </div>
              <Calendar className="size-4 text-slate-400" />
            </div>

            <div className="mt-4 space-y-3">
              {/* Pastel Activity Pills matching Image 1 */}
              <div className="rounded-2xl bg-[#ecfccb] p-3.5 border border-[#d9f99d]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-lime-900">Project onboarding</span>
                  <span className="text-[10px] font-semibold text-lime-800">10:00 AM</span>
                </div>
                <p className="text-[11px] text-lime-700 mt-0.5">Technical Assessment Session</p>
              </div>

              <div className="rounded-2xl bg-[#f3f4f6] p-3.5 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">System design review</span>
                  <span className="text-[10px] font-semibold text-slate-500">01:30 PM</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Live panel scoring</p>
              </div>

              <div className="rounded-2xl bg-[#ede9fe] p-3.5 border border-[#ddd6fe]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-900">Candidate interview</span>
                  <span className="text-[10px] font-semibold text-violet-700">03:00 PM</span>
                </div>
                <p className="text-[11px] text-violet-700 mt-0.5">AI Interview scorecards pending</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700">All systems optimal</span>
            </div>
            <Link to="/integrity" className="text-xs font-bold text-[#4648D4] hover:underline">
              Audit log →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
