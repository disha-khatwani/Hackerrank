import { useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatCard } from '@/components/data-display/StatCard';
import { Tabs } from '@/components/navigation/Tabs';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { reportingService } from '@/services/api';
import { formatCurrencyUsd, formatNumber, formatPercent } from '@/utils/format';
import { CheckCircle2, Percent, Users, Wallet } from 'lucide-react';

const TABS = [
  { value: 'funnel', label: 'Funnel' },
  { value: 'skills', label: 'Skill performance' },
  { value: 'usage', label: 'Usage & cost' },
];

const PIE_COLORS = [
  'var(--color-primary)',
  'var(--color-ai-green)',
  'var(--color-orange)',
  'var(--color-neutral-400)',
  'var(--color-primary-light)',
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 shadow-popover">
      <p className="text-caption font-semibold text-text-secondary">{label}</p>
      <p className="mt-0.5 text-h4 font-bold text-primary">{payload[0]?.value}</p>
    </div>
  );
}

export function ReportingPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const [tab, setTab] = useState('funnel');

  const { data: metrics } = useAsyncData(() => reportingService.getCompletionMetrics(tenantId), [tenantId]);
  const { data: funnel } = useAsyncData(() => reportingService.getFunnel(tenantId), [tenantId]);
  const { data: skillPerf } = useAsyncData(() => reportingService.getSkillPerformance(tenantId), [tenantId]);
  const { data: usage } = useAsyncData(() => reportingService.getUsageAndCost(tenantId), [tenantId]);

  const totalCost = usage?.reduce((sum, u) => sum + u.cost, 0) ?? 0;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Hiring Analytics"
        description="Funnel, skill performance, and cost-of-goods reporting. All figures reflect this tenant's sample data."
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Candidates invited" value={formatNumber(metrics?.invited ?? 0)} icon={Users} tone="primary" />
        <StatCard label="Completion rate" value={formatPercent(metrics?.completionRatePercent ?? 0)} icon={CheckCircle2} />
        <StatCard label="Pass rate" value={formatPercent(metrics?.passRatePercent ?? 0)} icon={Percent} />
        <StatCard label="Cost of goods (30d)" value={formatCurrencyUsd(totalCost)} icon={Wallet} tone="ai" />
      </div>

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {/* Funnel tab */}
      {tab === 'funnel' && (
        <Card>
          <CardHeader
            title="Candidate funnel"
            description="Drop-off visibility at each hiring stage"
          />
          <CardBody className="pt-2">
            {funnel && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnel} margin={{ left: -16, right: 8, top: 8 }}>
                  <CartesianGrid
                    stroke="var(--color-border)"
                    vertical={false}
                    strokeOpacity={0.7}
                  />
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-sans)' }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-sans)' }}
                    axisLine={false}
                    tickLine={false}
                    dx={-4}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-muted)', radius: 6 }} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 2, 2]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      )}

      {/* Skills tab */}
      {tab === 'skills' && (
        <Card>
          <CardHeader
            title="Skill-level performance"
            description="Average candidate score per skill area, feeding content-quality decisions"
          />
          <CardBody className="space-y-4">
            {(skillPerf ?? []).length === 0 && (
              <p className="py-8 text-center text-body-2 text-text-secondary">
                Not enough completed attempts yet to compute skill performance.
              </p>
            )}
            {(skillPerf ?? []).map((entry) => (
              <div key={entry.skillId} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-body-2 font-medium text-text-primary truncate max-w-[200px]">
                    {entry.skillId}
                  </span>
                  <span className="text-caption font-semibold text-text-secondary">
                    {entry.averageScorePercent}%
                    <span className="ml-1 font-normal text-text-tertiary">({entry.attemptCount} attempts)</span>
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${entry.averageScorePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Usage tab */}
      {tab === 'usage' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Cost of goods by module" />
            <CardBody className="pt-2">
              {usage && (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={usage}
                      dataKey="cost"
                      nameKey="module"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={3}
                    >
                      {usage.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrencyUsd(Number(value))}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: 'var(--color-border)',
                        fontSize: 13,
                        fontFamily: 'var(--font-sans)',
                        boxShadow: 'var(--shadow-popover)',
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Usage by module" />
            <CardBody className="p-0">
              {(usage ?? []).map((u) => (
                <div
                  key={u.module}
                  className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0 text-body-2 hover:bg-surface-subtle transition-colors"
                >
                  <span className="font-medium text-text-primary">{u.module}</span>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">{formatCurrencyUsd(u.cost)}</p>
                    <p className="text-caption text-text-tertiary">{formatNumber(u.quantity)} units</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
