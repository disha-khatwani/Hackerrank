import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/data-display/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field } from '@/components/forms/Field';
import { Input, Textarea } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Switch } from '@/components/forms/Switch';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { assessmentService, skillsService } from '@/services/api';
import { toast } from '@/store/toastStore';
import type { AiUsePolicy, Assessment, AssessmentSection, DifficultyLevel } from '@/types';
import { cn } from '@/utils/cn';

const STEPS = ['Method & details', 'Sections', 'Scoring & policy', 'Review & publish'];

function newSection(): AssessmentSection {
  return {
    id: `sec-${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    timeLimitMinutes: 30,
    questionPoolIds: [],
    questionsToDraw: 1,
    difficulty: 'mixed',
    aiUsePolicy: 'guarded',
  };
}

export function AssessmentBuilderPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { data: roles } = useAsyncData(() => skillsService.listRoles(tenantId), [tenantId]);

  const [creationMethod, setCreationMethod] = useState<Assessment['creationMethod']>('scratch');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roleId, setRoleId] = useState('');
  const [sections, setSections] = useState<AssessmentSection[]>([newSection()]);
  const [defaultAiUsePolicy, setDefaultAiUsePolicy] = useState<AiUsePolicy>('guarded');
  const [passThresholdPercent, setPassThresholdPercent] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [extraTimePercent, setExtraTimePercent] = useState(0);
  const [cameraFree, setCameraFree] = useState(true);
  const [secureMode, setSecureMode] = useState(true);
  const [identityCheck, setIdentityCheck] = useState(true);
  const [screenshotMonitoring, setScreenshotMonitoring] = useState(false);

  const role = roles?.find((r) => r.id === roleId);
  const totalDuration = sections.reduce((sum, s) => sum + s.timeLimitMinutes, 0);

  function updateSection(id: string, patch: Partial<AssessmentSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function handleFinish(publish: boolean) {
    setSubmitting(true);
    try {
      const draft = await assessmentService.createDraft(tenantId, session?.user.id ?? 'current-user', {
        title,
        description,
        roleId: roleId || null,
        skillIds: role?.skillProfile.map((r) => r.skillId) ?? [],
        sections,
        defaultAiUsePolicy,
        passThresholdPercent,
        maxAttempts,
        accommodation: { extraTimePercent, cameraFree },
        integritySettings: { secureMode, identityCheck, screenshotMonitoring, sensitivityThreshold: 'medium' },
        creationMethod,
      });
      if (publish) {
        await assessmentService.publish(draft.id);
        toast({ title: 'Assessment published', description: `"${title}" is now live and locked.`, variant: 'success' });
      } else {
        toast({ title: 'Draft saved', description: `"${title}" was saved as a draft.`, variant: 'success' });
      }
      navigate(`/assessments/${draft.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  const canContinueFromStep0 = title.trim().length > 1;
  const canContinueFromStep1 = sections.length > 0 && sections.every((s) => s.title.trim().length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New assessment"
        description="Build a timed, scored assessment and publish it as a locked version."
        breadcrumbs={[{ label: 'Assessments', to: '/assessments' }, { label: 'New' }]}
      />

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-caption font-medium',
                i === step ? 'bg-primary text-white' : i < step ? 'bg-success text-white' : 'bg-surface-muted text-text-tertiary',
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </button>
            <span className={cn('text-body-2', i === step ? 'text-text-primary font-medium' : 'text-text-secondary')}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardBody className="space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Creation method">
                <div className="flex flex-wrap gap-2">
                  {(['scratch', 'template', 'duplicate', 'ai-assisted'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setCreationMethod(m)}
                      className={cn(
                        'rounded-md border px-3 py-2 text-body-2 capitalize',
                        creationMethod === m ? 'border-primary bg-primary-pale text-primary' : 'border-border text-text-primary hover:bg-surface-subtle',
                      )}
                    >
                      {m.replace('-', ' ')}
                    </button>
                  ))}
                </div>
                {creationMethod === 'ai-assisted' && (
                  <p className="mt-2 text-caption text-text-secondary">
                    An AI-drafted assessment still requires your review and explicit publish approval before it's usable.
                  </p>
                )}
              </Field>
              <Field label="Title" required>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Backend Engineer — Technical Screen" />
              </Field>
              <Field label="Description">
                <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
              <Field label="Target role">
                <Select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                  <option value="">No specific role</option>
                  {(roles ?? []).map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </Select>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {sections.map((section, idx) => (
                <div key={section.id} className="rounded-md border border-border p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-body-2 font-medium text-text-primary">Section {idx + 1}</p>
                    {sections.length > 1 && (
                      <button onClick={() => setSections((prev) => prev.filter((s) => s.id !== section.id))} className="text-text-tertiary hover:text-error">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Section title" required>
                      <Input value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                    </Field>
                    <Field label="Time limit (minutes)">
                      <Input
                        type="number"
                        min={5}
                        value={section.timeLimitMinutes}
                        onChange={(e) => updateSection(section.id, { timeLimitMinutes: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Difficulty">
                      <Select
                        value={section.difficulty}
                        onChange={(e) => updateSection(section.id, { difficulty: e.target.value as DifficultyLevel | 'mixed' })}
                      >
                        <option value="mixed">Mixed</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="expert">Expert</option>
                      </Select>
                    </Field>
                    <Field label="Section AI-use policy" hint="Overrides the assessment default for this section">
                      <Select value={section.aiUsePolicy} onChange={(e) => updateSection(section.id, { aiUsePolicy: e.target.value as AiUsePolicy })}>
                        <option value="guarded">Guarded (no AI assistance)</option>
                        <option value="unguarded">Unguarded (AI assistance expected)</option>
                      </Select>
                    </Field>
                  </div>
                </div>
              ))}
              <Button variant="outline" leadingIcon={<Plus className="size-4" />} onClick={() => setSections((prev) => [...prev, newSection()])}>
                Add section
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Field label="Default AI-use policy" hint="The candidate sees this disclosed before starting. BUILD-08: guarded = AI disallowed, unguarded = AI expected.">
                <Select value={defaultAiUsePolicy} onChange={(e) => setDefaultAiUsePolicy(e.target.value as AiUsePolicy)}>
                  <option value="guarded">Guarded — AI assistance disallowed</option>
                  <option value="unguarded">Unguarded — AI assistance expected</option>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Pass threshold (%)">
                  <Input type="number" min={0} max={100} value={passThresholdPercent} onChange={(e) => setPassThresholdPercent(Number(e.target.value))} />
                </Field>
                <Field label="Max attempts">
                  <Input type="number" min={1} value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} />
                </Field>
              </div>
              <Field label="Accommodation — extra time (%)">
                <Input type="number" min={0} value={extraTimePercent} onChange={(e) => setExtraTimePercent(Number(e.target.value))} />
              </Field>
              <Switch checked={cameraFree} onChange={setCameraFree} label="Camera-free alternative available" description="Required first-class accommodation per CX-05" />
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-body-2 font-medium text-text-primary">Integrity settings</p>
                <Switch checked={secureMode} onChange={setSecureMode} label="Secure Mode" description="Forces full-screen and flags tab switches" />
                <Switch checked={identityCheck} onChange={setIdentityCheck} label="Identity verification at session start" />
                <Switch checked={screenshotMonitoring} onChange={setScreenshotMonitoring} label="Screenshot-based monitoring" description="Requires separate explicit candidate consent" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-md border border-border p-4">
                <p className="text-h4 text-text-primary">{title || 'Untitled assessment'}</p>
                <p className="text-body-2 text-text-secondary mt-1">{description || 'No description provided.'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="neutral">{role?.title ?? 'No specific role'}</Badge>
                  <Badge tone={defaultAiUsePolicy === 'unguarded' ? 'ai' : 'neutral'}>{defaultAiUsePolicy} AI policy</Badge>
                  <Badge tone="neutral">{totalDuration} min total</Badge>
                  <Badge tone="neutral">Pass at {passThresholdPercent}%</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-body-2 font-medium text-text-primary">Sections</p>
                {sections.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-body-2">
                    <span>{i + 1}. {s.title || 'Untitled section'}</span>
                    <span className="text-text-secondary">{s.timeLimitMinutes} min · {s.difficulty} · {s.aiUsePolicy}</span>
                  </div>
                ))}
              </div>
              <p className="text-caption text-text-tertiary">
                Test variants and candidate-routing rules (BUILD-04/05) can be configured from the assessment detail page after creation.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => (step === 0 ? navigate('/assessments') : setStep(step - 1))}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={(step === 0 && !canContinueFromStep0) || (step === 1 && !canContinueFromStep1)}
          >
            Continue
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleFinish(false)} isLoading={submitting}>
              Save as draft
            </Button>
            <Button onClick={() => handleFinish(true)} isLoading={submitting}>
              Publish assessment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
