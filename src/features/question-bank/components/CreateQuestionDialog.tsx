import { useState } from 'react';
import { Dialog } from '@/components/feedback/Dialog';
import { Field } from '@/components/forms/Field';
import { Input, Textarea } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { questionBankService } from '@/services/api';
import { toast } from '@/store/toastStore';
import { QUESTION_TYPE_LABELS, type DifficultyLevel, type DistributiveOmit, type Question, type QuestionTypeId } from '@/types';

const TYPE_OPTIONS = Object.entries(QUESTION_TYPE_LABELS) as [QuestionTypeId, string][];

interface CommonFields {
  title: string;
  skillIds: string;
  difficulty: DifficultyLevel;
  tags: string;
  summary: string;
}

type NewQuestion = DistributiveOmit<Question, 'id' | 'version' | 'isLatestVersion' | 'createdAt' | 'updatedAt' | 'usageCount' | 'leakReviewStatus'>;

function buildTypeSpecificQuestion(type: QuestionTypeId, common: CommonFields, typeFields: Record<string, string>): NewQuestion {
  const base = {
    tenantId: 'tenant-northwind',
    title: common.title,
    skillIds: common.skillIds.split(',').map((s) => s.trim()).filter(Boolean),
    roleIds: [],
    difficulty: common.difficulty,
    tags: common.tags.split(',').map((t) => t.trim()).filter(Boolean),
    status: 'draft' as const,
    authorId: 'current-user',
    authorName: 'Current user',
    publishedAt: undefined,
    visibility: 'tenant-private' as const,
    summary: common.summary,
  };

  switch (type) {
    case 'multiple-choice':
      return {
        ...base,
        type,
        prompt: typeFields.prompt ?? '',
        options: [
          { id: 'o1', text: typeFields.option1 ?? '', isCorrect: true },
          { id: 'o2', text: typeFields.option2 ?? '', isCorrect: false },
          { id: 'o3', text: typeFields.option3 ?? '', isCorrect: false },
        ],
        allowMultipleAnswers: false,
      };
    case 'coding':
      return {
        ...base,
        type,
        codingDomain: 'general',
        prompt: typeFields.prompt ?? '',
        starterCode: {},
        languages: (typeFields.languages ?? 'typescript').split(',').map((s) => s.trim()),
        testCases: [],
        referenceSolution: '',
        referenceSolutionVerified: false,
      };
    case 'sql':
      return {
        ...base,
        type,
        prompt: typeFields.prompt ?? '',
        schemaScript: typeFields.schemaScript ?? '',
        seedDataScript: '',
        referenceQuery: '',
        referenceSolutionVerified: false,
      };
    case 'subjective':
      return {
        ...base,
        type,
        prompt: typeFields.prompt ?? '',
        rubric: typeFields.rubric ?? '',
        wordLimit: typeFields.wordLimit ? Number(typeFields.wordLimit) : undefined,
      };
    case 'repository':
      return {
        ...base,
        type,
        prompt: typeFields.prompt ?? '',
        repositoryUrl: typeFields.repositoryUrl ?? '',
        taskKind: 'bug-fix',
        buildCommand: typeFields.buildCommand ?? 'npm run build',
        testCommand: typeFields.testCommand ?? 'npm test',
        buildVerified: false,
      };
    case 'whiteboard':
      return { ...base, type, prompt: typeFields.prompt ?? '', rubric: typeFields.rubric ?? '' };
    case 'file-upload':
      return {
        ...base,
        type,
        prompt: typeFields.prompt ?? '',
        acceptedFormats: (typeFields.acceptedFormats ?? '.pdf').split(',').map((s) => s.trim()),
        maxFileSizeMb: Number(typeFields.maxFileSizeMb ?? 10),
      };
    case 'prompt-engineering':
      return {
        ...base,
        type,
        prompt: typeFields.prompt ?? '',
        targetOutcome: typeFields.targetOutcome ?? '',
        ragContextDocuments: [],
        rubric: typeFields.rubric ?? '',
      };
    case 'sentence-completion':
      return {
        ...base,
        type,
        promptTemplate: typeFields.promptTemplate ?? '',
        blanks: [{ id: 'b1', acceptableAnswers: (typeFields.acceptableAnswers ?? '').split(',').map((s) => s.trim()) }],
      };
    case 'html-css-js':
      return {
        ...base,
        type,
        prompt: typeFields.prompt ?? '',
        starterHtml: typeFields.starterHtml ?? '',
        starterCss: '',
        starterJs: '',
        visualAssertions: [],
      };
    case 'approximate-solution':
      return {
        ...base,
        type,
        prompt: typeFields.prompt ?? '',
        acceptableAnswerRange: { min: Number(typeFields.min ?? 0), max: Number(typeFields.max ?? 0) },
        partialCreditRules: typeFields.partialCreditRules ?? '',
      };
  }
}

export function CreateQuestionDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<QuestionTypeId>('coding');
  const [common, setCommon] = useState<CommonFields>({ title: '', skillIds: '', difficulty: 'medium', tags: '', summary: '' });
  const [typeFields, setTypeFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setStep(1);
    setCommon({ title: '', skillIds: '', difficulty: 'medium', tags: '', summary: '' });
    setTypeFields({});
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const question = buildTypeSpecificQuestion(type, common, typeFields);
      await questionBankService.create(question);
      toast({ title: 'Question created', description: `"${common.title}" was saved as a draft.`, variant: 'success' });
      reset();
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  function setField(key: string, value: string) {
    setTypeFields((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={step === 1 ? 'New question — choose a type' : `New question — ${QUESTION_TYPE_LABELS[type]}`}
      size="lg"
      footer={
        step === 1 ? (
          <Button onClick={() => setStep(2)}>Continue</Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={handleSubmit} isLoading={submitting} disabled={!common.title}>
              Save as draft
            </Button>
          </>
        )
      }
    >
      {step === 1 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TYPE_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`rounded-md border p-3 text-left text-body-2 transition-colors ${
                type === value ? 'border-primary bg-primary-pale text-primary' : 'border-border text-text-primary hover:bg-surface-subtle'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Title" required>
            <Input value={common.title} onChange={(e) => setCommon({ ...common, title: e.target.value })} placeholder="e.g. Merge overlapping intervals" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Skill IDs (comma-separated)" hint="e.g. skl-js, skl-react">
              <Input value={common.skillIds} onChange={(e) => setCommon({ ...common, skillIds: e.target.value })} />
            </Field>
            <Field label="Difficulty">
              <Select value={common.difficulty} onChange={(e) => setCommon({ ...common, difficulty: e.target.value as DifficultyLevel })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </Select>
            </Field>
          </div>
          <Field label="Tags (comma-separated)">
            <Input value={common.tags} onChange={(e) => setCommon({ ...common, tags: e.target.value })} />
          </Field>
          <Field label="Summary" hint="Shown in search results so authors can assess relevance without opening the question.">
            <Textarea rows={2} value={common.summary} onChange={(e) => setCommon({ ...common, summary: e.target.value })} />
          </Field>

          <div className="border-t border-border pt-4">
            <TypeSpecificForm type={type} values={typeFields} onChange={setField} />
          </div>
        </div>
      )}
    </Dialog>
  );
}

function TypeSpecificForm({
  type,
  values,
  onChange,
}: {
  type: QuestionTypeId;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const v = (key: string) => values[key] ?? '';

  switch (type) {
    case 'multiple-choice':
      return (
        <div className="space-y-3">
          <Field label="Prompt" required>
            <Textarea rows={2} value={v('prompt')} onChange={(e) => onChange('prompt', e.target.value)} />
          </Field>
          <Field label="Correct option">
            <Input value={v('option1')} onChange={(e) => onChange('option1', e.target.value)} />
          </Field>
          <Field label="Distractor option">
            <Input value={v('option2')} onChange={(e) => onChange('option2', e.target.value)} />
          </Field>
          <Field label="Distractor option">
            <Input value={v('option3')} onChange={(e) => onChange('option3', e.target.value)} />
          </Field>
        </div>
      );
    case 'coding':
      return (
        <div className="space-y-3">
          <Field label="Prompt" required>
            <Textarea rows={3} value={v('prompt')} onChange={(e) => onChange('prompt', e.target.value)} />
          </Field>
          <Field label="Allowed languages (comma-separated)">
            <Input value={v('languages')} onChange={(e) => onChange('languages', e.target.value)} placeholder="typescript, python, go" />
          </Field>
        </div>
      );
    case 'sql':
      return (
        <div className="space-y-3">
          <Field label="Prompt" required>
            <Textarea rows={2} value={v('prompt')} onChange={(e) => onChange('prompt', e.target.value)} />
          </Field>
          <Field label="Schema script">
            <Textarea rows={3} value={v('schemaScript')} onChange={(e) => onChange('schemaScript', e.target.value)} />
          </Field>
        </div>
      );
    case 'subjective':
      return (
        <div className="space-y-3">
          <Field label="Prompt" required>
            <Textarea rows={2} value={v('prompt')} onChange={(e) => onChange('prompt', e.target.value)} />
          </Field>
          <Field label="Grading rubric">
            <Textarea rows={2} value={v('rubric')} onChange={(e) => onChange('rubric', e.target.value)} />
          </Field>
          <Field label="Word limit">
            <Input type="number" value={v('wordLimit')} onChange={(e) => onChange('wordLimit', e.target.value)} />
          </Field>
        </div>
      );
    case 'repository':
      return (
        <div className="space-y-3">
          <Field label="Task prompt" required>
            <Textarea rows={2} value={v('prompt')} onChange={(e) => onChange('prompt', e.target.value)} />
          </Field>
          <Field label="Repository URL">
            <Input value={v('repositoryUrl')} onChange={(e) => onChange('repositoryUrl', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Build command">
              <Input value={v('buildCommand')} onChange={(e) => onChange('buildCommand', e.target.value)} />
            </Field>
            <Field label="Test command">
              <Input value={v('testCommand')} onChange={(e) => onChange('testCommand', e.target.value)} />
            </Field>
          </div>
        </div>
      );
    case 'whiteboard':
      return (
        <div className="space-y-3">
          <Field label="Prompt" required>
            <Textarea rows={2} value={v('prompt')} onChange={(e) => onChange('prompt', e.target.value)} />
          </Field>
          <Field label="Grading rubric">
            <Textarea rows={2} value={v('rubric')} onChange={(e) => onChange('rubric', e.target.value)} />
          </Field>
        </div>
      );
    case 'file-upload':
      return (
        <div className="space-y-3">
          <Field label="Prompt" required>
            <Textarea rows={2} value={v('prompt')} onChange={(e) => onChange('prompt', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Accepted formats (comma-separated)">
              <Input value={v('acceptedFormats')} onChange={(e) => onChange('acceptedFormats', e.target.value)} placeholder=".pdf, .md" />
            </Field>
            <Field label="Max file size (MB)">
              <Input type="number" value={v('maxFileSizeMb')} onChange={(e) => onChange('maxFileSizeMb', e.target.value)} />
            </Field>
          </div>
        </div>
      );
    case 'prompt-engineering':
      return (
        <div className="space-y-3">
          <Field label="Task prompt" required>
            <Textarea rows={2} value={v('prompt')} onChange={(e) => onChange('prompt', e.target.value)} />
          </Field>
          <Field label="Target outcome">
            <Textarea rows={2} value={v('targetOutcome')} onChange={(e) => onChange('targetOutcome', e.target.value)} />
          </Field>
          <Field label="Grading rubric">
            <Textarea rows={2} value={v('rubric')} onChange={(e) => onChange('rubric', e.target.value)} />
          </Field>
        </div>
      );
    case 'sentence-completion':
      return (
        <div className="space-y-3">
          <Field label="Prompt template" required hint="Use ___1___, ___2___, etc. for blanks">
            <Textarea rows={2} value={v('promptTemplate')} onChange={(e) => onChange('promptTemplate', e.target.value)} />
          </Field>
          <Field label="Acceptable answers for blank 1 (comma-separated)">
            <Input value={v('acceptableAnswers')} onChange={(e) => onChange('acceptableAnswers', e.target.value)} />
          </Field>
        </div>
      );
    case 'html-css-js':
      return (
        <div className="space-y-3">
          <Field label="Prompt" required>
            <Textarea rows={2} value={v('prompt')} onChange={(e) => onChange('prompt', e.target.value)} />
          </Field>
          <Field label="Starter HTML">
            <Textarea rows={3} value={v('starterHtml')} onChange={(e) => onChange('starterHtml', e.target.value)} />
          </Field>
        </div>
      );
    case 'approximate-solution':
      return (
        <div className="space-y-3">
          <Field label="Prompt" required>
            <Textarea rows={2} value={v('prompt')} onChange={(e) => onChange('prompt', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Acceptable minimum">
              <Input type="number" value={v('min')} onChange={(e) => onChange('min', e.target.value)} />
            </Field>
            <Field label="Acceptable maximum">
              <Input type="number" value={v('max')} onChange={(e) => onChange('max', e.target.value)} />
            </Field>
          </div>
          <Field label="Partial credit rules">
            <Textarea rows={2} value={v('partialCreditRules')} onChange={(e) => onChange('partialCreditRules', e.target.value)} />
          </Field>
        </div>
      );
  }
}
