import { CheckCircle2, Lock, Shield, Timer, Users2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Send, Upload } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Tabs } from '@/components/navigation/Tabs';
import { SkeletonTable } from '@/components/feedback/Skeleton';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { assessmentService, candidateService } from '@/services/api';
import { toast } from '@/store/toastStore';
import type { CandidateInvitation } from '@/types';
import { formatDateTime, formatDuration } from '@/utils/format';
import { InviteCandidatesDialog } from '../components/InviteCandidatesDialog';
import { cn } from '@/utils/cn';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'invitations', label: 'Invitations' },
];

function IntegrityRow({ label, value }: { label: string; value: boolean | number | string }) {
  const isOn = value === true || value === 'On';
  const isOff = value === false || value === 'Off';
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-body-2 text-text-secondary">{label}</span>
      <span
        className={cn(
          'text-body-2 font-semibold',
          isOn ? 'text-success' : isOff ? 'text-text-tertiary' : 'text-text-primary',
        )}
      >
        {typeof value === 'boolean' ? (value ? 'On' : 'Off') : String(value)}
      </span>
    </div>
  );
}

export function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: assessment, isLoading, refetch } = useAsyncData(
    () => assessmentService.getById(id ?? ''),
    [id],
  );
  const { data: invitations, refetch: refetchInvitations } = useAsyncData(
    () => assessmentService.listInvitations(id ?? ''),
    [id],
  );
  const { data: candidatesLookup } = useAsyncData(
    () =>
      session?.tenantId
        ? candidateService.list(session.tenantId, {}, { page: 1, pageSize: 100 })
        : Promise.resolve(null),
    [session?.tenantId],
  );

  if (isLoading || !assessment) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-neutral-100" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-xl bg-neutral-100 lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-xl bg-neutral-100" />
        </div>
      </div>
    );
  }

  const candidateName = (candidateId: string) =>
    candidatesLookup?.items.find((c) => c.id === candidateId)?.name ?? candidateId;

  const invitationColumns: ColumnDef<CandidateInvitation, unknown>[] = [
    { id: 'candidate', header: 'Candidate', cell: ({ row }) => candidateName(row.original.candidateId) },
    { id: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: 'invitedAt', header: 'Invited', cell: ({ row }) => formatDateTime(row.original.invitedAt) },
    { id: 'expiresAt', header: 'Expires', cell: ({ row }) => formatDateTime(row.original.expiresAt) },
  ];

  async function handlePublish() {
    if (!assessment) return;
    await assessmentService.publish(assessment.id);
    toast({ title: 'Assessment published', variant: 'success' });
    refetch();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={assessment.title}
        description={assessment.description}
        breadcrumbs={[{ label: 'Assessments', to: '/assessments' }, { label: assessment.title }]}
        actions={
          <div className="flex gap-2">
            {assessment.status === 'draft' && (
              <Button variant="outline" leadingIcon={<Send className="size-4" />} onClick={handlePublish}>
                Publish
              </Button>
            )}
            {assessment.status === 'published' && (
              <Button leadingIcon={<Upload className="size-4" />} onClick={() => setInviteOpen(true)}>
                Invite candidates
              </Button>
            )}
          </div>
        }
      />

      {/* Meta badges row */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={assessment.status} />
        <Badge tone={assessment.defaultAiUsePolicy === 'unguarded' ? 'ai' : 'neutral'}>
          {assessment.defaultAiUsePolicy} AI policy
        </Badge>
        <Badge tone="neutral">v{assessment.version}</Badge>
        <Badge tone="neutral">
          <Timer className="size-3" />
          {formatDuration(assessment.totalDurationMinutes)}
        </Badge>
        <Badge tone="neutral">Pass at {assessment.passThresholdPercent}%</Badge>
      </div>

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Sections */}
          <Card className="lg:col-span-2">
            <CardHeader title="Sections" description={`${assessment.sections.length} section${assessment.sections.length !== 1 ? 's' : ''} · ${formatDuration(assessment.totalDurationMinutes)} total`} />
            <CardBody className="space-y-2.5 pt-3">
              {assessment.sections.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-start justify-between rounded-xl border border-border bg-surface-subtle/60 px-4 py-3.5 transition-colors hover:bg-surface-subtle"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-pale text-caption font-bold text-primary">
                        {i + 1}
                      </span>
                      <p className="text-body-2 font-semibold text-text-primary">{s.title}</p>
                    </div>
                    <p className="mt-1 pl-7 text-caption text-text-tertiary">
                      {s.questionsToDraw} question{s.questionsToDraw !== 1 ? 's' : ''} drawn from pool
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge tone="neutral">{s.timeLimitMinutes} min</Badge>
                    <Badge tone="neutral" className="capitalize">{s.difficulty}</Badge>
                    <Badge tone={s.aiUsePolicy === 'unguarded' ? 'ai' : 'neutral'}>{s.aiUsePolicy}</Badge>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Integrity & accommodations */}
          <Card>
            <CardHeader title="Integrity & accommodations" />
            <CardBody className="pt-1">
              <div className="mb-4">
                <p className="mb-2 text-caption font-semibold uppercase tracking-widest text-text-tertiary">
                  Integrity
                </p>
                <IntegrityRow label="Secure Mode" value={assessment.integritySettings.secureMode} />
                <IntegrityRow label="Identity check" value={assessment.integritySettings.identityCheck} />
                <IntegrityRow label="Screenshot monitoring" value={assessment.integritySettings.screenshotMonitoring} />
              </div>
              <div>
                <p className="mb-2 text-caption font-semibold uppercase tracking-widest text-text-tertiary">
                  Accommodations
                </p>
                <IntegrityRow label="Extra time" value={`${assessment.accommodation.extraTimePercent}%`} />
                <IntegrityRow
                  label="Camera-free mode"
                  value={assessment.accommodation.cameraFree ? 'Available' : 'Not available'}
                />
                <IntegrityRow label="Max attempts" value={String(assessment.maxAttempts)} />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Invitations tab */}
      {tab === 'invitations' && (
        <Card>
          <DataTable
            columns={invitationColumns}
            data={invitations ?? []}
            getRowId={(i) => i.id}
            emptyTitle="No candidates invited yet"
            emptyDescription="Invite candidates to start tracking attempts for this assessment."
            emptyAction={
              assessment.status === 'published' ? (
                <Button onClick={() => setInviteOpen(true)}>Invite candidates</Button>
              ) : undefined
            }
            onRowClick={(i) => navigate(`/candidates/${i.candidateId}`)}
          />
        </Card>
      )}

      <InviteCandidatesDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        assessmentId={assessment.id}
        tenantId={assessment.tenantId}
        onInvited={() => {
          setInviteOpen(false);
          refetchInvitations();
        }}
      />
    </div>
  );
}
