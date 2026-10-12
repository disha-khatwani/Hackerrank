import type { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/data-display/DataTable';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { candidateService, interviewService } from '@/services/api';
import type { InterviewSession } from '@/types';
import { formatDateTime } from '@/utils/format';

export function AiInterviewsListPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const navigate = useNavigate();

  const { data: sessions, isLoading, error, refetch } = useAsyncData(() => interviewService.listSessions(tenantId, 'ai-interview'), [tenantId]);
  const { data: candidatesPage } = useAsyncData(() => candidateService.list(tenantId, {}, { page: 1, pageSize: 100 }), [tenantId]);

  const candidateName = (id: string) => candidatesPage?.items.find((c) => c.id === id)?.name ?? id;

  const columns: ColumnDef<InterviewSession, unknown>[] = [
    { id: 'candidate', header: 'Candidate', cell: ({ row }) => candidateName(row.original.candidateId) },
    { id: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: 'started', header: 'Started', cell: ({ row }) => formatDateTime(row.original.startedAt) },
    { id: 'consent', header: 'Recording consent', cell: ({ row }) => (row.original.recordingConsent ? 'Given' : 'Not given') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Interviews"
        description="Adaptive, AI-conducted interviews — live question generation, coding segment, and structured feedback pending human review."
      />
      <Card>
        <DataTable
          columns={columns}
          data={sessions ?? []}
          getRowId={(s) => s.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onRowClick={(s) => navigate(`/interviews/ai/${s.id}`)}
          emptyTitle="No AI interview sessions yet"
        />
      </Card>
    </div>
  );
}
