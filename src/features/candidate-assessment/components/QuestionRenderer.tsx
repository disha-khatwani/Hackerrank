import { Upload } from 'lucide-react';
import { Textarea } from '@/components/forms/Input';
import { CodeWorkspace } from '@/features/coding-engine/components/CodeWorkspace';
import type { Question } from '@/types';

export function QuestionRenderer({ question }: { question: Question }) {
  switch (question.type) {
    case 'multiple-choice':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">{question.prompt}</p>
          <div className="space-y-2">
            {question.options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 hover:bg-surface-subtle">
                <input type={question.allowMultipleAnswers ? 'checkbox' : 'radio'} name={question.id} className="size-4" />
                <span className="text-body-2 text-text-primary">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case 'coding':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">{question.prompt}</p>
          <CodeWorkspace languages={question.languages} starterCode={question.starterCode} testCases={question.testCases} />
        </div>
      );
    case 'html-css-js':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">{question.prompt}</p>
          <CodeWorkspace languages={['html', 'css', 'javascript']} starterCode={{ html: question.starterHtml, css: question.starterCss, javascript: question.starterJs }} />
        </div>
      );
    case 'sql':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">{question.prompt}</p>
          <CodeWorkspace languages={['sql']} starterCode={{ sql: question.schemaScript }} />
        </div>
      );
    case 'repository':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">{question.prompt}</p>
          <CodeWorkspace languages={['shell']} starterCode={{ shell: `# ${question.repositoryUrl}\n# Task: ${question.taskKind}` }} readOnlyNotice="Repository checked out in your workspace" />
        </div>
      );
    case 'approximate-solution':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">{question.prompt}</p>
          <input
            type="number"
            placeholder="Your numeric estimate"
            className="h-11 w-48 rounded-md border border-border-strong px-3 text-body-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          />
          <Textarea rows={3} placeholder="Show your reasoning (earns partial credit even if the final number is off)." />
        </div>
      );
    case 'prompt-engineering':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">{question.prompt}</p>
          <p className="text-caption text-text-secondary">Target outcome: {question.targetOutcome}</p>
          <Textarea rows={6} placeholder="Write your system + few-shot prompt here…" />
        </div>
      );
    case 'whiteboard':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">{question.prompt}</p>
          <div className="flex h-72 items-center justify-center rounded-md border-2 border-dashed border-border-strong bg-surface-subtle text-body-2 text-text-tertiary">
            Free-form diagramming canvas
          </div>
        </div>
      );
    case 'sentence-completion':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">
            {question.promptTemplate.split(/(___\d+___)/).map((part, i) =>
              /___\d+___/.test(part) ? (
                <input key={i} className="mx-1 inline-block w-28 rounded border border-border-strong px-2 py-1 text-body-2" />
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </p>
        </div>
      );
    case 'file-upload':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">{question.prompt}</p>
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border-strong p-8 text-center">
            <Upload className="size-6 text-text-tertiary" />
            <p className="text-body-2 text-text-secondary">Drag a file here or click to upload</p>
            <p className="text-caption text-text-tertiary">Accepts {question.acceptedFormats.join(', ')} · up to {question.maxFileSizeMb}MB</p>
          </div>
        </div>
      );
    case 'subjective':
      return (
        <div className="space-y-4">
          <p className="text-body-1 text-text-primary">{question.prompt}</p>
          <Textarea rows={8} placeholder="Write your response…" />
          {question.wordLimit && <p className="text-caption text-text-tertiary">Word limit: {question.wordLimit}</p>}
        </div>
      );
    default: {
      const exhaustiveCheck: never = question;
      return exhaustiveCheck;
    }
  }
}
