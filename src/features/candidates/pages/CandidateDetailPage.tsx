import { Clock, Link as LinkIcon, PlayCircle, User } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SkeletonTable } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { candidateService } from '@/services/api';
import { toast } from '@/store/toastStore';
import { formatDateTime, formatPercent } from '@/utils/format';

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: candidate, isLoading } = useAsyncData(() => candidateService.getById(id ?? ''), [id]);
  const { data: invitations } = useAsyncData(() => candidateService.getInvitationsForCandidate(id ?? ''), [id]);
  const { data: attempts } = useAsyncData(() => candidateService.getAttemptsForCandidate(id ?? ''), [id]);

  if (isLoading || !candidate) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-neutral-100" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-32 animate-pulse rounded-xl bg-neutral-100" />
          <div className="h-32 animate-pulse rounded-xl bg-neutral-100 lg:col-span-2" />
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-neutral-100" />
      </div>
    );
  }

  async function handleShare(attemptId: string) {
    const link = await candidateService.createShareLink(attemptId, 'current-user');
    await navigator.clipboard?.writeText(`https://app.kombee.com/share/${link.token}`).catch(() => undefined);
    toast({
      title: 'Share link copied',
      description: 'This expiring link can be shared outside the hiring team.',
      variant: 'success',
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={candidate.name}
        breadcrumbs={[{ label: 'Candidates', to: '/candidates' }, { label: candidate.name }]}
        description={candidate.email}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Identity card */}
        <Card>
          <CardBody className="flex flex-col items-center gap-4 py-6 text-center">
            <Avatar name={candidate.name} size="lg" />
            <div>
              <p className="text-h4 font-bold text-text-primary">{candidate.name}</p>
              <p className="mt-0.5 text-body-2 text-text-secondary">
                {candidate.appliedRole ?? 'No role specified'}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                <Badge tone="neutral">{candidate.source.replace('-', ' ')}</Badge>
                {candidate.discoverableProfileOptIn && (
                  <Badge tone="success">Job matching opted in</Badge>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Invitations */}
        <Card className="lg:col-span-2">
          <CardHeader title="Assessment invitations" />
          <CardBody className="p-0">
            {invitations && invitations.length > 0 ? (
              <div className="divide-y divide-border">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-body-2 font-semibold text-text-primary truncate">
                        {inv.assessmentId}
                      </p>
                      <p className="text-caption text-text-tertiary">
                        Invited {formatDateTime(inv.invitedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={inv.status} />
                      {(inv.status === 'invited' || inv.status === 'opened' || inv.status === 'in-progress') && (
                        <a href={`/candidate-session/${inv.id}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" leadingIcon={<PlayCircle className="size-3.5" />}>
                            Preview
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={User}
                title="No invitations yet"
                description="Invite this candidate from an assessment's detail page."
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Results */}
      <Card>
        <CardHeader
          title="Results"
          description="Deterministic, automated results are final and authoritative unless manually overridden with a logged reason."
        />
        <CardBody className="p-0">
          {attempts && attempts.length > 0 ? (
            <div className="divide-y divide-border">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-body-2 font-semibold text-text-primary">{attempt.assessmentId}</p>
                    <div className="mt-1 flex items-center gap-3 text-caption text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {attempt.submittedAt ? `Submitted ${formatDateTime(attempt.submittedAt)}` : 'In progress'}
                      </span>
                    </div>
                    {attempt.integritySummary?.requiresHumanReview && (
                      <Badge tone="warning" className="mt-2">
                        Integrity review required
                      </Badge>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <p className="text-h3 font-bold text-text-primary">
                        {formatPercent(attempt.manualOverride?.scorePercent ?? attempt.overallScorePercent)}
                      </p>
                      {attempt.passed !== null && (
                        <Badge tone={attempt.passed ? 'success' : 'error'}>
                          {attempt.passed ? 'Passed' : 'Did not pass'}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      leadingIcon={<LinkIcon className="size-3.5" />}
                      onClick={() => handleShare(attempt.id)}
                    >
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No completed attempts yet" description="Results will appear here once the candidate completes an assessment." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
