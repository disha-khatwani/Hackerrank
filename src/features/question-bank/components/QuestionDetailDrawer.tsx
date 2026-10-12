import { Drawer } from '@/components/feedback/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { QUESTION_TYPE_LABELS, type Question } from '@/types';
import { formatDateTime } from '@/utils/format';

function TypeSpecificDetail({ question }: { question: Question }) {
  switch (question.type) {
    case 'multiple-choice':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.prompt}</p>
          <ul className="space-y-1.5">
            {question.options.map((opt) => (
              <li key={opt.id} className={`rounded-md border px-3 py-2 text-body-2 ${opt.isCorrect ? 'border-success bg-success-light text-success' : 'border-border text-text-primary'}`}>
                {opt.text}
              </li>
            ))}
          </ul>
          <p className="text-caption text-text-tertiary">{question.allowMultipleAnswers ? 'Multiple answers allowed' : 'Single answer'}</p>
        </div>
      );
    case 'coding':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.prompt}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="neutral">{question.codingDomain}</Badge>
            {question.languages.map((l) => (
              <Badge key={l} tone="neutral">{l}</Badge>
            ))}
          </div>
          <p className="text-caption text-text-secondary">{question.testCases.length} test case(s), {question.testCases.filter((t) => t.isHidden).length} hidden</p>
          <p className="text-caption">
            Reference solution:{' '}
            <Badge tone={question.referenceSolutionVerified ? 'success' : 'warning'}>
              {question.referenceSolutionVerified ? 'Verified' : 'Not verified'}
            </Badge>
          </p>
        </div>
      );
    case 'html-css-js':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.prompt}</p>
          <p className="text-caption text-text-secondary">Visual assertions: {question.visualAssertions.join(', ')}</p>
        </div>
      );
    case 'sql':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.prompt}</p>
          <pre className="overflow-x-auto rounded-md bg-neutral-900 p-3 text-caption text-neutral-100">{question.schemaScript}</pre>
          <p className="text-caption">
            Reference query:{' '}
            <Badge tone={question.referenceSolutionVerified ? 'success' : 'warning'}>
              {question.referenceSolutionVerified ? 'Verified' : 'Not verified'}
            </Badge>
          </p>
        </div>
      );
    case 'approximate-solution':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.prompt}</p>
          <p className="text-caption text-text-secondary">
            Acceptable range: {question.acceptableAnswerRange.min}–{question.acceptableAnswerRange.max}
          </p>
          <p className="text-caption text-text-secondary">{question.partialCreditRules}</p>
        </div>
      );
    case 'repository':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.prompt}</p>
          <p className="text-caption text-text-secondary">Task: {question.taskKind.replace('-', ' ')}</p>
          <p className="text-caption text-text-secondary">Repository: {question.repositoryUrl}</p>
          <p className="text-caption">
            Build verification:{' '}
            <Badge tone={question.buildVerified ? 'success' : 'warning'}>{question.buildVerified ? 'Passing' : 'Not verified'}</Badge>
          </p>
        </div>
      );
    case 'prompt-engineering':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.prompt}</p>
          <p className="text-caption text-text-secondary">Target outcome: {question.targetOutcome}</p>
          <p className="text-caption text-text-secondary">Rubric: {question.rubric}</p>
        </div>
      );
    case 'whiteboard':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.prompt}</p>
          <p className="text-caption text-text-secondary">Rubric: {question.rubric}</p>
        </div>
      );
    case 'sentence-completion':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.promptTemplate}</p>
          <p className="text-caption text-text-secondary">{question.blanks.length} blank(s)</p>
        </div>
      );
    case 'file-upload':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.prompt}</p>
          <p className="text-caption text-text-secondary">
            Accepts {question.acceptedFormats.join(', ')}, up to {question.maxFileSizeMb}MB
          </p>
        </div>
      );
    case 'subjective':
      return (
        <div className="space-y-2">
          <p className="text-body-2 text-text-primary">{question.prompt}</p>
          <p className="text-caption text-text-secondary">Rubric: {question.rubric}</p>
          {question.wordLimit && <p className="text-caption text-text-secondary">Word limit: {question.wordLimit}</p>}
        </div>
      );
  }
}

export function QuestionDetailDrawer({
  question,
  onClose,
  onPublish,
}: {
  question: Question | null;
  onClose: () => void;
  onPublish: (id: string) => void;
}) {
  return (
    <Drawer
      open={Boolean(question)}
      onClose={onClose}
      title={question?.title ?? ''}
      description={question ? QUESTION_TYPE_LABELS[question.type] : undefined}
      footer={
        question &&
        question.status !== 'published' && (
          <Button onClick={() => onPublish(question.id)}>Publish question</Button>
        )
      }
    >
      {question && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={question.status} />
            <Badge tone="neutral">{question.difficulty}</Badge>
            <Badge tone="neutral">v{question.version}</Badge>
            <Badge tone={question.visibility === 'tenant-private' ? 'primary' : 'neutral'}>
              {question.visibility === 'platform-shared' ? 'Shared library' : question.visibility === 'tenant-private' ? 'Tenant private' : 'Team private'}
            </Badge>
          </div>

          <p className="text-body-2 text-text-secondary">{question.summary}</p>

          <TypeSpecificDetail question={question} />

          <div className="flex flex-wrap gap-1.5">
            {question.tags.map((t) => (
              <Badge key={t} tone="neutral">#{t}</Badge>
            ))}
          </div>

          <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-caption">
            <div>
              <dt className="text-text-tertiary">Author</dt>
              <dd className="text-text-primary">{question.authorName}</dd>
            </div>
            <div>
              <dt className="text-text-tertiary">Usage count</dt>
              <dd className="text-text-primary">{question.usageCount}</dd>
            </div>
            <div>
              <dt className="text-text-tertiary">Updated</dt>
              <dd className="text-text-primary">{formatDateTime(question.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-text-tertiary">Leak review</dt>
              <dd className="text-text-primary">{question.leakReviewStatus ?? 'Not scanned'}</dd>
            </div>
          </dl>
        </div>
      )}
    </Drawer>
  );
}
