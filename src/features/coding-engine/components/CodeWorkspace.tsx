import Editor from '@monaco-editor/react';
import { CheckCircle2, Loader2, Play, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/forms/Select';
import type { TestCase } from '@/types';

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
}

export interface CodeWorkspaceProps {
  languages: string[];
  initialLanguage?: string;
  starterCode: Partial<Record<string, string>>;
  testCases?: TestCase[];
  onChange?: (code: string, language: string) => void;
  onSubmit?: (code: string, language: string) => void;
  readOnlyNotice?: string;
  height?: string;
}

/**
 * Shared code workspace: the one editor/execution UI reused across Assessment,
 * Practice, AI Interview, Live Interview, Competitions, and the Agentic
 * environment, per the BRD's "shared coding engine" requirement (§12). Code
 * execution is a mock adapter — see services/api/shared.ts and docs/ARCHITECTURE.md
 * for the real sandboxed-execution contract this stands in for.
 */
export function CodeWorkspace({
  languages,
  initialLanguage,
  starterCode,
  testCases = [],
  onChange,
  onSubmit,
  readOnlyNotice,
  height = '360px',
}: CodeWorkspaceProps) {
  const [language, setLanguage] = useState(initialLanguage ?? languages[0] ?? 'typescript');
  const [code, setCode] = useState(starterCode[language] ?? '// Start writing your solution here\n');
  const [runState, setRunState] = useState<'idle' | 'running' | 'ran'>('idle');
  const [results, setResults] = useState<TestCaseResult[] | null>(null);
  const [stdout, setStdout] = useState('');

  function handleLanguageChange(next: string) {
    setLanguage(next);
    setCode(starterCode[next] ?? `// ${next} starter not provided — write your solution here\n`);
    setResults(null);
  }

  function handleEditorChange(value: string | undefined) {
    setCode(value ?? '');
    onChange?.(value ?? '', language);
  }

  async function handleRun() {
    setRunState('running');
    setResults(null);
    await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 500));
    const visibleCases = testCases.filter((t) => !t.isHidden);
    const simulated = (visibleCases.length > 0 ? visibleCases : testCases).map((t): TestCaseResult => ({
      testCaseId: t.id,
      passed: Math.random() > 0.2,
      actualOutput: t.expectedOutput,
    }));
    setResults(simulated);
    setStdout(simulated.every((r) => r.passed) ? 'All visible test cases passed.' : 'One or more test cases failed — review output below.');
    setRunState('ran');
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-subtle px-3 py-2">
        <Select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="w-40">
          {languages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>
        <div className="flex items-center gap-2">
          {readOnlyNotice && <span className="text-caption text-text-tertiary">{readOnlyNotice}</span>}
          <Button size="sm" variant="outline" leadingIcon={runState === 'running' ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} onClick={handleRun} disabled={runState === 'running'}>
            Run
          </Button>
          {onSubmit && (
            <Button size="sm" onClick={() => onSubmit(code, language)}>
              Submit
            </Button>
          )}
        </div>
      </div>

      <Editor
        height={height}
        language={language === 'typescript' ? 'typescript' : language}
        value={code}
        onChange={handleEditorChange}
        theme="vs"
        options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 } }}
      />

      {results && (
        <div className="border-t border-border bg-surface-subtle p-3">
          <p className="mb-2 text-caption text-text-secondary">{stdout}</p>
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div key={r.testCaseId} className="flex items-center gap-2 text-caption">
                {r.passed ? <CheckCircle2 className="size-3.5 text-success" /> : <XCircle className="size-3.5 text-error" />}
                <span className="text-text-primary">Test case {i + 1}</span>
                <Badge tone={r.passed ? 'success' : 'error'}>{r.passed ? 'Passed' : 'Failed'}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
