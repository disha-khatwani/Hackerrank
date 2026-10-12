import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/data-display/DataTable';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { Tabs } from '@/components/navigation/Tabs';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { assessmentService } from '@/services/api';
import type { Assessment, AssessmentStatus } from '@/types';
import { formatDuration, formatRelative } from '@/utils/format';

const TABS: { value: AssessmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-review', label: 'In review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export function AssessmentsListPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const navigate = useNavigate();
  const [tab, setTab] = useState<AssessmentStatus | 'all'>('all');

  const { data: assessments, isLoading, error, refetch } = useAsyncData(() => assessmentService.list(tenantId), [tenantId]);
  const filtered = (assessments ?? []).filter((a) => tab === 'all' || a.status === tab);

  const columns: ColumnDef<Assessment, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Assessment',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary">{row.original.title}</p>
          <p className="text-caption text-text-tertiary">v{row.original.version} · {row.original.sections.length} section(s)</p>
        </div>
      ),
    },
    { id: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: 'aiPolicy',
      header: 'AI-use policy',
      cell: ({ row }) => <Badge tone={row.original.defaultAiUsePolicy === 'unguarded' ? 'ai' : 'neutral'}>{row.original.defaultAiUsePolicy}</Badge>,
    },
    { id: 'duration', header: 'Duration', cell: ({ row }) => formatDuration(row.original.totalDurationMinutes) },
    { id: 'passThreshold', header: 'Pass threshold', cell: ({ row }) => `${row.original.passThresholdPercent}%` },
    { id: 'updated', header: 'Created', cell: ({ row }) => formatRelative(row.original.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Build, publish, and manage technical assessments. Published assessments are versioned and locked."
        actions={
          <Button leadingIcon={<Plus className="size-4" />} onClick={() => navigate('/assessments/new')}>
            New assessment
          </Button>
        }
      />

      <Tabs items={TABS} value={tab} onChange={(v) => setTab(v as AssessmentStatus | 'all')} />

      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(a) => a.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onRowClick={(a) => navigate(`/assessments/${a.id}`)}
          emptyTitle="No assessments yet"
          emptyDescription="Create your first assessment to start screening candidates."
          emptyAction={
            <Button onClick={() => navigate('/assessments/new')} leadingIcon={<Plus className="size-4" />}>
              New assessment
            </Button>
          }
        />
      </Card>
    </div>
  );
}
