import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SkeletonTable } from '@/components/feedback/Skeleton';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { useAsyncData } from '@/hooks/useAsyncData';
import { interviewService } from '@/services/api';
import { toast } from '@/store/toastStore';
import type { Scorecard } from '@/types';
import { formatDateTime } from '@/utils/format';

const RECOMMENDATIONS: { value: NonNullable<Scorecard['overallRecommendation']>; label: string; tone: 'success' | 'warning' | 'error' }[] = [
  { value: 'strong-hire', label: 'Strong hire', tone: 'success' },
  { value: 'hire', label: 'Hire', tone: 'success' },
  { value: 'no-hire', label: 'No hire', tone: 'warning' },
  { value: 'strong-no-hire', label: 'Strong no-hire', tone: 'error' },
];

export function AiInterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: sessionData, isLoading } = useAsyncData(() => interviewService.getSession(id ?? ''), [id]);
  const { data: scorecard, refetch } = useAsyncData(() => interviewService.getScorecard(id ?? ''), [id]);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading || !sessionData) return <SkeletonTable rows={6} />;

  async function submit(recommendation: NonNullable<Scorecard['overallRecommendation']>) {
    if (!scorecard) return;
    setSubmitting(true);
    try {
      await interviewService.submitScorecard(scorecard.id, recommendation);
      toast({ title: 'Scorecard submitted', variant: 'success' });
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Interview session"
        breadcrumbs={[{ label: 'AI Interviews', to: '/interviews/ai' }, { label: sessionData.id }]}
        description={`Status: ${sessionData.status}`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Session transcript" description="Candidate-visible conversation and coding segment" />
          <CardBody className="space-y-3">
            <div className="rounded-md border border-border p-3 text-body-2">
              <p className="font-medium text-text-primary">AI Interviewer</p>
              <p className="text-text-secondary">Walk me through how you'd structure state for a multi-step form with validation on each step.</p>
            </div>
            <div className="rounded-md border border-border p-3 text-body-2">
              <p className="font-medium text-text-primary">Candidate</p>
              <p className="text-text-secondary">I'd keep a single source of truth for form state at the parent, with a per-step validation schema...</p>
            </div>
            <p className="text-caption text-text-tertiary">Full transcript and code playback available in the evidence record (EVID-01/03).</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Session info" />
          <CardBody className="space-y-2 text-body-2">
            <div className="flex justify-between"><span className="text-text-secondary">Status</span><StatusBadge status={sessionData.status} /></div>
            <div className="flex justify-between"><span className="text-text-secondary">Started</span><span>{formatDateTime(sessionData.startedAt)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Completed</span><span>{formatDateTime(sessionData.completedAt)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Recording</span><span>{sessionData.recordingConsent ? 'Consented' : 'Not consented'}</span></div>
          </CardBody>
        </Card>
      </div>

      {scorecard && (
        <Card>
          <CardHeader title="Structured scorecard" description="Human-reviewed — AI output is advisory only and never a final decision" />
          <CardBody className="space-y-4">
            {scorecard.aiAssistedSummary && (
              <div className="flex items-start gap-2 rounded-md border border-ai-mint bg-surface-ai p-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-ai-dark-green" />
                <div>
                  <p className="text-caption font-medium text-ai-dark-green">AI-generated summary (advisory only)</p>
                  <p className="text-body-2 text-text-primary">{scorecard.aiAssistedSummary}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {scorecard.criteriaScores.map((c) => (
                <div key={c.criteriaId} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="text-body-2 text-text-primary">{c.criteriaId}</span>
                  <div className="flex items-center gap-2">
                    <Badge tone="primary">{c.score} / 5</Badge>
                    {c.notes && <span className="text-caption text-text-secondary">{c.notes}</span>}
                  </div>
                </div>
              ))}
            </div>

            {scorecard.status === 'pending-review' ? (
              <div>
                <p className="mb-2 text-body-2 font-medium text-text-primary">Submit your recommendation</p>
                <div className="flex flex-wrap gap-2">
                  {RECOMMENDATIONS.map((r) => (
                    <Button key={r.value} variant="outline" size="sm" onClick={() => submit(r.value)} isLoading={submitting}>
                      {r.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <Badge tone="success">Recommendation submitted: {scorecard.overallRecommendation}</Badge>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
