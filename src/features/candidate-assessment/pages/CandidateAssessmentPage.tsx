import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  MessageCircleQuestion,
  Mic,
  ShieldCheck,
  Video,
  Wifi,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Dialog } from '@/components/feedback/Dialog';
import { Field } from '@/components/forms/Field';
import { Textarea } from '@/components/forms/Input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { assessmentService, questionBankService } from '@/services/api';
import { toast } from '@/store/toastStore';
import type { Assessment, Question } from '@/types';
import { cn } from '@/utils/cn';
import { formatDuration } from '@/utils/format';
import { QuestionRenderer } from '../components/QuestionRenderer';

type FlowStep = 'instructions' | 'preflight' | 'consent' | 'in-progress' | 'confirm-submit' | 'completed' | 'interrupted';

function useCountdown(totalSeconds: number, running: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [running]);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return { secondsLeft, label: `${minutes}:${String(seconds).padStart(2, '0')}` };
}

export function CandidateAssessmentPage() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const { data: invitation } = useAsyncData(
    () => (invitationId ? assessmentService.getInvitationById(invitationId) : Promise.resolve(null)),
    [invitationId],
  );
  const { data: assessment } = useAsyncData(
    () => (invitation ? assessmentService.getById(invitation.assessmentId) : Promise.resolve(null)),
    [invitation?.assessmentId],
  );

  const [step, setStep] = useState<FlowStep>('instructions');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [cameraFreeMode, setCameraFreeMode] = useState(false);
  type CheckStatus = 'pending' | 'ok' | 'failed';
  const [preflightChecks, setPreflightChecks] = useState<{ camera: CheckStatus; mic: CheckStatus; connection: CheckStatus }>({
    camera: 'pending',
    mic: 'pending',
    connection: 'pending',
  });
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [autosaveLabel, setAutosaveLabel] = useState('Saved just now');

  const currentSection = assessment?.sections[sectionIndex];
  const { secondsLeft, label: timerLabel } = useCountdown((currentSection?.timeLimitMinutes ?? 0) * 60, step === 'in-progress');

  const { data: sectionQuestions } = useAsyncData(async (): Promise<Question[]> => {
    if (!currentSection) return [];
    const results = await Promise.all(currentSection.questionPoolIds.slice(0, currentSection.questionsToDraw || 1).map((id) => questionBankService.getById(id)));
    return results.filter((q): q is Question => q !== null);
  }, [currentSection?.id]);

  useEffect(() => {
    if (step !== 'in-progress') return;
    const id = setInterval(() => setAutosaveLabel(`Saved just now`), 15000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step === 'in-progress' && secondsLeft === 0 && currentSection) {
      if (sectionIndex < (assessment?.sections.length ?? 1) - 1) {
        setSectionIndex((i) => i + 1);
        toast({ title: `Time's up for "${currentSection.title}"`, description: 'Moving to the next section.', variant: 'info' });
      } else {
        setStep('confirm-submit');
      }
    }
  }, [secondsLeft, step, sectionIndex, assessment, currentSection]);

  if (!invitation || !assessment) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <EmptyState icon={AlertCircle} title="This assessment link isn't valid" description="The invitation may have expired or already been used." />
      </div>
    );
  }

  function runPreflight() {
    setPreflightChecks({ camera: 'pending', mic: 'pending', connection: 'pending' });
    (['camera', 'mic', 'connection'] as const).forEach((key, i) => {
      setTimeout(() => {
        setPreflightChecks((prev) => ({ ...prev, [key]: 'ok' }));
      }, 500 + i * 400);
    });
  }

  const allChecksOk = Object.values(preflightChecks).every((v) => v === 'ok');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {step === 'instructions' && (
        <InstructionsStep assessment={assessment} onContinue={() => setStep('preflight')} />
      )}

      {step === 'preflight' && (
        <Card>
          <CardBody className="space-y-5">
            <h2 className="text-h3 text-text-primary">Device & connection check</h2>
            <p className="text-body-2 text-text-secondary">We'll verify your camera, microphone, and connection before you begin.</p>

            {!cameraFreeMode ? (
              <div className="space-y-3">
                <PreflightRow icon={Video} label="Camera" status={preflightChecks.camera} />
                <PreflightRow icon={Mic} label="Microphone" status={preflightChecks.mic} />
                <PreflightRow icon={Wifi} label="Connection" status={preflightChecks.connection} />
                <div className="flex gap-2">
                  <Button onClick={runPreflight} variant="outline">Run checks</Button>
                  <Button onClick={() => setStep(assessment.integritySettings.identityCheck ? 'consent' : 'in-progress')} disabled={!allChecksOk}>
                    Continue
                  </Button>
                </div>
                <button onClick={() => setCameraFreeMode(true)} className="text-caption text-primary hover:underline">
                  I can't use camera/microphone — switch to the accessible alternative
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-md border border-border bg-surface-subtle p-3 text-body-2 text-text-secondary">
                  You're using the camera/microphone-free alternative mode. This is a first-class, non-penalized option.
                </div>
                <Button onClick={() => setStep(assessment.integritySettings.identityCheck ? 'consent' : 'in-progress')}>Continue</Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {step === 'consent' && (
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-h3 text-text-primary">Consent & disclosure</h2>
            <ul className="space-y-2 text-body-2 text-text-secondary">
              <li>• Your session activity{!cameraFreeMode ? ', including audio/video,' : ''} may be recorded for human review.</li>
              <li>• Environmental integrity signals (tab switches, focus loss) are captured during this assessment.</li>
              <li>• {assessment.defaultAiUsePolicy === 'unguarded' ? 'AI assistance is expected and welcomed for this assessment.' : 'AI assistance is not permitted for this assessment and is actively monitored for.'}</li>
              <li>• You may flag a problem at any point, and a human will review any integrity flag before any decision is made.</li>
            </ul>
            <Button onClick={() => setStep('in-progress')}>I consent and I'm ready to begin</Button>
          </CardBody>
        </Card>
      )}

      {step === 'in-progress' && currentSection && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-3">
            <div>
              <p className="text-body-2 font-medium text-text-primary">{currentSection.title}</p>
              <p className="text-caption text-text-secondary">Section {sectionIndex + 1} of {assessment.sections.length}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-caption text-text-secondary">
                <CheckCircle2 className="size-3.5 text-success" /> {autosaveLabel}
              </span>
              <span className={cn('flex items-center gap-1.5 text-body-2 font-medium', secondsLeft < 60 ? 'text-error' : 'text-text-primary')}>
                <Clock className="size-4" /> {timerLabel}
              </span>
            </div>
          </div>

          <Badge tone={currentSection.aiUsePolicy === 'unguarded' ? 'ai' : 'neutral'}>
            {currentSection.aiUsePolicy === 'unguarded' ? 'AI assistance is expected in this section' : 'AI assistance is disallowed in this section'}
          </Badge>

          {sectionQuestions && sectionQuestions.length > 0 ? (
            <Card>
              <CardBody>
                <QuestionRenderer question={sectionQuestions[0] as Question} />
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <EmptyState title="No question available in this pool" />
              </CardBody>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" leadingIcon={<MessageCircleQuestion className="size-4" />} onClick={() => setReportOpen(true)}>
              I'm having a problem
            </Button>
            <div className="flex gap-2">
              {sectionIndex > 0 && (
                <Button variant="outline" onClick={() => setSectionIndex((i) => i - 1)}>
                  Previous section
                </Button>
              )}
              {sectionIndex < assessment.sections.length - 1 ? (
                <Button onClick={() => setSectionIndex((i) => i + 1)}>Next section</Button>
              ) : (
                <Button onClick={() => setStep('confirm-submit')}>Finish & review</Button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 'confirm-submit' && (
        <Card>
          <CardBody className="space-y-4 text-center">
            <ShieldCheck className="mx-auto size-10 text-primary" />
            <h2 className="text-h3 text-text-primary">Ready to submit?</h2>
            <p className="text-body-2 text-text-secondary">
              Once submitted, you can't return to this assessment. Make sure you've completed every section.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setStep('in-progress')}>Go back</Button>
              <Button onClick={() => setStep('completed')}>Submit assessment</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 'completed' && (
        <Card>
          <CardBody className="space-y-3 py-10 text-center">
            <CheckCircle2 className="mx-auto size-12 text-success" />
            <h2 className="text-h3 text-text-primary">Assessment submitted</h2>
            <p className="text-body-2 text-text-secondary max-w-md mx-auto">
              Thanks for completing "{assessment.title}". Your results will be reviewed by the hiring team, and you'll hear
              back by email.
            </p>
          </CardBody>
        </Card>
      )}

      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} title="Report a problem" footer={
        <Button onClick={() => { setReportOpen(false); setReportText(''); toast({ title: 'Report submitted', description: 'The hiring team has been notified.', variant: 'success' }); }}>
          Submit report
        </Button>
      }>
        <Field label="What's going wrong?">
          <Textarea rows={4} value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Describe the issue — this never penalizes your attempt." />
        </Field>
      </Dialog>
    </div>
  );
}

function PreflightRow({ icon: Icon, label, status }: { icon: typeof Video; label: string; status: 'pending' | 'ok' | 'failed' }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
      <span className="flex items-center gap-2 text-body-2 text-text-primary">
        <Icon className="size-4 text-text-tertiary" /> {label}
      </span>
      {status === 'pending' && <Loader2 className="size-4 animate-spin text-text-tertiary" />}
      {status === 'ok' && <Badge tone="success">Working</Badge>}
      {status === 'failed' && <Badge tone="error">Not detected</Badge>}
    </div>
  );
}

function InstructionsStep({ assessment, onContinue }: { assessment: Assessment; onContinue: () => void }) {
  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <h1 className="text-h2 text-text-primary">{assessment.title}</h1>
          <p className="text-body-2 text-text-secondary mt-1">{assessment.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoTile label="Duration" value={formatDuration(assessment.totalDurationMinutes)} />
          <InfoTile label="Sections" value={String(assessment.sections.length)} />
          <InfoTile label="Pass threshold" value={`${assessment.passThresholdPercent}%`} />
          <InfoTile label="Attempts allowed" value={String(assessment.maxAttempts)} />
        </div>

        <div className={cn('flex items-start gap-3 rounded-lg border p-4', assessment.defaultAiUsePolicy === 'unguarded' ? 'border-ai-mint bg-surface-ai' : 'border-border-strong bg-surface-muted')}>
          {assessment.defaultAiUsePolicy === 'unguarded' ? <Eye className="mt-0.5 size-5 text-ai-dark-green" /> : <EyeOff className="mt-0.5 size-5 text-text-secondary" />}
          <div>
            <p className="text-body-2 font-medium text-text-primary">
              {assessment.defaultAiUsePolicy === 'unguarded' ? 'AI assistance is expected in this assessment' : 'AI assistance is not permitted in this assessment'}
            </p>
            <p className="text-caption text-text-secondary mt-0.5">
              {assessment.defaultAiUsePolicy === 'unguarded'
                ? 'You are encouraged to use AI tools. Your process — not just the final code — is part of what\'s evaluated.'
                : 'This assessment is monitored for AI-generated code and external assistance.'}
            </p>
          </div>
        </div>

        <ul className="space-y-1.5 text-body-2 text-text-secondary">
          <li>• Each section has its own timer, controlled by our servers.</li>
          <li>• Your progress is autosaved continuously.</li>
          <li>• If you disconnect, you get one chance to resume where you left off.</li>
          <li>• A camera/microphone-free alternative is available at any time.</li>
        </ul>

        <Button onClick={onContinue} size="lg">Continue to device check</Button>
      </CardBody>
    </Card>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-subtle p-3 text-center">
      <p className="text-h4 text-text-primary">{value}</p>
      <p className="text-caption text-text-secondary">{label}</p>
    </div>
  );
}
