import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Dialog } from '@/components/feedback/Dialog';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useAsyncData } from '@/hooks/useAsyncData';
import { developerEcosystemService } from '@/services/api';
import { CodeWorkspace } from '@/features/coding-engine/components/CodeWorkspace';
import { formatNumber } from '@/utils/format';
import type { PracticeProblem } from '@/types';

function difficultyTone(level: string) {
  return level === 'hard' ? 'error' : level === 'medium' ? 'warning' : 'success';
}

export function PracticePage() {
  const { data: problems, isLoading } = useAsyncData(() => developerEcosystemService.listPracticeProblems(), []);
  const [active, setActive] = useState<PracticeProblem | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Practice"
        description="Public practice catalogue reusing the shared execution engine — separate content pool from graded assessments and competitions, with unlimited retries."
      />

      {isLoading && <p className="text-body-2 text-text-secondary">Loading…</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(problems ?? []).map((p) => (
          <Card key={p.id}>
            <CardBody className="cursor-pointer" onClick={() => setActive(p)}>
              <div className="flex items-center justify-between">
                <p className="text-body-2 font-medium text-text-primary">{p.title}</p>
                <Badge tone={difficultyTone(p.difficulty)}>{p.difficulty}</Badge>
              </div>
              <p className="text-caption text-text-secondary mt-1">{p.topic}</p>
              <p className="text-caption text-text-tertiary mt-2">{formatNumber(p.solvedCount)} solves</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(active)} onClose={() => setActive(null)} title={active?.title ?? ''} size="lg">
        {active && (
          <CodeWorkspace
            languages={['typescript', 'python', 'go']}
            starterCode={{ typescript: `function solve() {\n  // ${active.title}\n}\n` }}
            testCases={[{ id: 't1', input: 'sample', expectedOutput: 'sample', isHidden: false }]}
          />
        )}
      </Dialog>
    </div>
  );
}
