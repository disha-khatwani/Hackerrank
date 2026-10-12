import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/data-display/PageHeader';
import { Tabs } from '@/components/navigation/Tabs';
import { ROLES } from '@/config/roles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { tenantService } from '@/services/api';
import { useTenantStore } from '@/store/tenantStore';
import { formatDateTime, formatRelative } from '@/utils/format';

const TABS = [
  { value: 'users', label: 'Users' },
  { value: 'teams', label: 'Teams' },
  { value: 'audit', label: 'Audit log' },
  { value: 'branding', label: 'Branding' },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <span className="text-body-2 text-text-secondary">{label}</span>
      <span className="text-body-2 font-medium text-text-primary text-right">{value}</span>
    </div>
  );
}

export function OrganizationSettingsPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const tenant = useTenantStore((s) => s.tenant);
  const [tab, setTab] = useState('users');

  const { data: users } = useAsyncData(() => tenantService.getUsers(tenantId), [tenantId]);
  const { data: teams } = useAsyncData(() => tenantService.getTeams(tenantId), [tenantId]);
  const { data: auditLog } = useAsyncData(() => tenantService.getAuditLog(tenantId), [tenantId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization"
        description="Users, roles, teams, and the audit log for your tenant."
        breadcrumbs={[{ label: 'Settings', to: '/settings' }, { label: 'Organization' }]}
      />

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'users' && (
        <Card>
          <CardBody className="p-0">
            {(users ?? []).map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-surface-subtle transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} size="sm" />
                  <div>
                    <p className="text-body-2 font-semibold text-text-primary">{u.name}</p>
                    <p className="text-caption text-text-tertiary">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.roles.map((r) => (
                    <Badge key={r} tone="neutral">
                      {ROLES[r].label}
                    </Badge>
                  ))}
                  <Badge tone={u.status === 'active' ? 'success' : 'neutral'}>{u.status}</Badge>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {tab === 'teams' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(teams ?? []).map((t) => (
            <Card key={t.id} className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150">
              <CardBody>
                <p className="text-body-2 font-semibold text-text-primary">{t.name}</p>
                <p className="mt-1 text-caption text-text-tertiary">{t.memberCount} member{t.memberCount !== 1 ? 's' : ''}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {tab === 'audit' && (
        <Card>
          <CardBody className="p-0">
            {(auditLog ?? []).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-border last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-body-2 font-medium text-text-primary truncate">{entry.action}</p>
                  <p className="text-caption text-text-tertiary">
                    {entry.actorName} · {entry.targetType}
                  </p>
                </div>
                <span
                  className="shrink-0 text-caption text-text-tertiary"
                  title={formatDateTime(entry.occurredAt)}
                >
                  {formatRelative(entry.occurredAt)}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {tab === 'branding' && (
        <Card>
          <CardHeader title="Brand configuration" description="Visual identity for the candidate-facing experience" />
          <CardBody>
            <InfoRow label="Candidate-facing domain" value={tenant?.branding.candidateFacingDomain ?? '—'} />
            <InfoRow
              label="Primary color"
              value={
                <span className="flex items-center gap-2">
                  <span
                    className="size-4 rounded-md border border-border shadow-sm"
                    style={{ backgroundColor: tenant?.branding.primaryColor ?? '#4f46e5' }}
                  />
                  <code className="text-caption font-mono">{tenant?.branding.primaryColor ?? '#4f46e5'}</code>
                </span>
              }
            />
            <InfoRow label="Data residency" value={tenant?.dataResidency.toUpperCase() ?? '—'} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
