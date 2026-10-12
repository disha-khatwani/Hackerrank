import { EyeOff, Terminal, Video } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { interviewService } from '@/services/api';
import { formatDateTime } from '@/utils/format';

export function LiveInterviewsPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const { data: sessions, isLoading } = useAsyncData(() => interviewService.listSessions(tenantId, 'live-interview'), [tenantId]);
  const { data: templates } = useAsyncData(() => interviewService.listTemplates(tenantId, 'live-interview'), [tenantId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Technical Interviews"
        description="Collaborative editor, terminal, and browser for the candidate — with a private interviewer-only panel that is never rendered to the candidate under any condition."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Scheduled & in-progress sessions" />
          <CardBody className="space-y-2">
            {isLoading && <p className="text-body-2 text-text-secondary">Loading…</p>}
            {!isLoading && (sessions ?? []).length === 0 && <EmptyState title="No live interviews scheduled" />}
            {(sessions ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <div>
                  <p className="text-body-2 font-medium text-text-primary">{s.id}</p>
                  <p className="text-caption text-text-secondary">{s.scheduledAt ? formatDateTime(s.scheduledAt) : 'On-demand'}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Interview templates" />
          <CardBody className="space-y-2">
            {(templates ?? []).map((t) => (
              <div key={t.id} className="rounded-md border border-border p-2.5">
                <p className="text-body-2 font-medium text-text-primary">{t.title}</p>
                <p className="text-caption text-text-secondary">{t.durationMinutes} min · {t.rubricCriteria.length} rubric criteria</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Session workspace preview" description="What the interviewer sees alongside the candidate's shared view" />
        <CardBody>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center gap-2 text-caption text-text-secondary">
                <Video className="size-3.5" /> Shared with candidate
              </div>
              <div className="flex h-56 items-center justify-center rounded-md border border-border bg-neutral-900 text-caption text-neutral-400">
                Collaborative code editor + terminal + browser (candidate-visible)
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-caption text-error">
                <EyeOff className="size-3.5" /> Interviewer-only — never sent to candidate
              </div>
              <div className="h-56 space-y-2 overflow-y-auto rounded-md border border-error-light bg-error-light/30 p-3">
                <p className="text-caption font-medium text-text-primary">Reference solution</p>
                <p className="text-caption text-text-secondary">Use a sliding window; watch for the off-by-one on the right boundary.</p>
                <p className="text-caption font-medium text-text-primary mt-2">Hints</p>
                <p className="text-caption text-text-secondary">If stuck after 10 min, suggest they verbalize the invariant.</p>
                <Badge tone="error" icon={<Terminal className="size-3 mr-1" />}>Structurally isolated channel</Badge>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
