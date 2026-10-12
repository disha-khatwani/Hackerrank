import { CheckCircle2, MessageSquare, Sparkles, Wrench, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useAsyncData } from '@/hooks/useAsyncData';
import { interviewService } from '@/services/api';
import { toast } from '@/store/toastStore';
import type { AiFluencyEvent, AiFluencyEventType } from '@/types';
import { formatDateTime } from '@/utils/format';

const EVENT_ICON: Record<AiFluencyEventType, typeof MessageSquare> = {
  'prompt-sent': MessageSquare,
  'suggestion-received': Sparkles,
  'suggestion-run': Wrench,
  'suggestion-accepted': CheckCircle2,
  'suggestion-modified': Wrench,
  'suggestion-rejected': XCircle,
  'candidate-correction': CheckCircle2,
};

function EventRow({ event }: { event: AiFluencyEvent }) {
  const Icon = EVENT_ICON[event.type];
  return (
    <div className="flex items-start gap-3 border-l-2 border-border pl-3 pb-4 last:pb-0">
      <span className="-ml-[19px] flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-pale text-primary">
        <Icon className="size-3.5" />
      </span>
      <div>
        <p className="text-caption font-medium capitalize text-text-primary">{event.type.replace(/-/g, ' ')}</p>
        <p className="text-body-2 text-text-secondary">{event.detail}</p>
        <p className="text-caption text-text-tertiary">{formatDateTime(event.timestamp)}</p>
      </div>
    </div>
  );
}

export function AiFluencyPage() {
  const { data: review, refetch } = useAsyncData(() => interviewService.getAiFluencyReview('asmt-ai-engineer'), []);
  const [scores, setScores] = useState({ planningScore: 4, promptQualityScore: 4, verificationScore: 4, correctionScore: 4 });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!review) return;
    setSubmitting(true);
    try {
      await interviewService.submitAiFluencyScore('asmt-ai-engineer', 'current-user', { ...review.rubricScore, ...scores, reviewerId: 'current-user', status: 'submitted' });
      toast({ title: 'AI Fluency score submitted', variant: 'success' });
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Fluency Evaluation"
        description="Evaluates actual development-environment activity — not just a chat log — including whether AI suggestions were tested before being accepted and whether AI-introduced errors were caught and corrected."
      />

      {!review ? (
        <Card><CardBody><EmptyState title="No unguarded AI Fluency sessions yet" /></CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Activity timeline" description="Every prompt, suggestion, run, and correction — in order" />
            <CardBody>
              {review.events.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </CardBody>
          </Card>

          <div className="space-y-4">
            {review.aiGeneratedSummary && (
              <Card>
                <CardBody className="flex items-start gap-2 bg-surface-ai">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-ai-dark-green" />
                  <div>
                    <p className="text-caption font-medium text-ai-dark-green">AI-generated summary (advisory only)</p>
                    <p className="text-body-2 text-text-primary">{review.aiGeneratedSummary}</p>
                  </div>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardHeader title="Human-reviewed rubric" description="The score of record — never the AI summary" />
              <CardBody className="space-y-3">
                {([
                  ['planningScore', 'Planning before prompting'],
                  ['promptQualityScore', 'Prompt specificity & iteration'],
                  ['verificationScore', 'Verified before accepting'],
                  ['correctionScore', 'Corrected AI mistakes'],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <div className="mb-1 flex justify-between text-body-2">
                      <span className="text-text-primary">{label}</span>
                      <span className="text-text-secondary">{scores[key]} / 5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={scores[key]}
                      onChange={(e) => setScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                      disabled={review.rubricScore.status === 'submitted'}
                      className="w-full accent-[var(--color-primary)]"
                    />
                  </div>
                ))}
                {review.rubricScore.status === 'pending-review' ? (
                  <Button onClick={handleSubmit} isLoading={submitting} className="w-full">Submit score</Button>
                ) : (
                  <Badge tone="success">Score submitted</Badge>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
