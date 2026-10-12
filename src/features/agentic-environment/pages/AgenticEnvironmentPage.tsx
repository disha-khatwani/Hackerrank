import { FileCode, Folder, GitCommitHorizontal, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useAsyncData } from '@/hooks/useAsyncData';
import { interviewService } from '@/services/api';
import { formatDateTime } from '@/utils/format';

export function AgenticEnvironmentPage() {
  const { data: sessions, isLoading } = useAsyncData(() => interviewService.listAgenticSessions(), []);
  const [selectedFile, setSelectedFile] = useState(0);
  const agSession = sessions?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agentic Development Environment"
        description="Places a candidate inside a real, multi-file repository with a terminal, a browser, and an AI coding agent — evaluating how they direct, review, and correct the agent's work."
      />

      {isLoading && <p className="text-body-2 text-text-secondary">Loading…</p>}
      {!isLoading && !agSession && <EmptyState title="No agentic sessions yet" />}

      {agSession && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{agSession.repositoryName}</Badge>
            <Badge tone={agSession.buildStatus === 'passed' ? 'success' : agSession.buildStatus === 'failed' ? 'error' : 'neutral'}>
              Build: {agSession.buildStatus}
            </Badge>
            <Badge tone={agSession.testStatus === 'passed' ? 'success' : agSession.testStatus === 'failed' ? 'error' : 'neutral'}>
              Tests: {agSession.testStatus}
            </Badge>
          </div>

          <Card>
            <CardBody>
              <p className="text-body-2 text-text-primary">{agSession.taskDescription}</p>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader title="Repository" />
              <CardBody className="space-y-1 p-2">
                {agSession.files.map((f, i) => (
                  <button
                    key={f.path}
                    onClick={() => setSelectedFile(i)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-body-2 ${
                      i === selectedFile ? 'bg-primary-pale text-primary' : 'text-text-primary hover:bg-surface-subtle'
                    }`}
                  >
                    <FileCode className="size-3.5 shrink-0" /> {f.path}
                  </button>
                ))}
                <div className="mt-2 flex items-center gap-2 px-2 text-caption text-text-tertiary">
                  <Folder className="size-3.5" /> + candidate's full working checkout
                </div>
              </CardBody>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title={agSession.files[selectedFile]?.path ?? ''} />
              <CardBody>
                <pre className="max-h-64 overflow-auto rounded-md bg-neutral-900 p-3 text-caption text-neutral-100">
                  {agSession.files[selectedFile]?.content}
                </pre>
                <div className="mt-3 flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-caption text-neutral-300">
                  <Terminal className="size-3.5" /> $ npm test — {agSession.testStatus}
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title="Agent activity timeline" description="Reviewable, chronological record of the agent's plan, instructions, changes, and the candidate's corrections" />
            <CardBody className="space-y-3">
              {agSession.activityTimeline.map((step) => (
                <div key={step.id} className="flex items-start gap-3 border-l-2 border-border pl-3">
                  <span className="-ml-[19px] flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-pale text-primary">
                    <GitCommitHorizontal className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-caption font-medium capitalize text-text-primary">{step.type.replace(/-/g, ' ')}</p>
                    <p className="text-body-2 text-text-secondary">{step.description}</p>
                    {step.diffSummary && <Badge tone="neutral" className="mt-1">{step.diffSummary}</Badge>}
                    <p className="text-caption text-text-tertiary">{formatDateTime(step.timestamp)}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
