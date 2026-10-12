import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { DataTable } from '@/components/data-display/DataTable';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSession } from '@/hooks/useSession';
import { questionBankService, type QuestionFilters } from '@/services/api';
import { toast } from '@/store/toastStore';
import { QUESTION_TYPE_LABELS, type DifficultyLevel, type Question, type QuestionStatus, type QuestionTypeId } from '@/types';
import { formatRelative } from '@/utils/format';
import { CreateQuestionDialog } from '../components/CreateQuestionDialog';
import { QuestionDetailDrawer } from '../components/QuestionDetailDrawer';

export function QuestionBankPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? null;
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [type, setType] = useState<QuestionTypeId | ''>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>('');
  const [status, setStatus] = useState<QuestionStatus | ''>('');
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);
  const [selected, setSelected] = useState<Question | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filters: QuestionFilters = {
    search: debouncedSearch || undefined,
    type: type || undefined,
    difficulty: difficulty || undefined,
    status: status || undefined,
    tenantId,
  };

  const sortField = (sorting[0]?.id as 'title' | 'updatedAt' | 'usageCount' | 'difficulty') ?? 'updatedAt';
  const sortDirection = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading, error, refetch } = useAsyncData(
    () => questionBankService.list(filters, { field: sortField, direction: sortDirection }, { page, pageSize: 8 }),
    [debouncedSearch, type, difficulty, status, tenantId, page, sortField, sortDirection],
  );

  const columns: ColumnDef<Question, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Question',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="font-medium text-text-primary truncate">{row.original.title}</p>
          <p className="text-caption text-text-tertiary truncate">{row.original.summary}</p>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge tone="neutral">{QUESTION_TYPE_LABELS[row.original.type]}</Badge>,
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: ({ row }) => <span className="capitalize">{row.original.difficulty}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'usageCount',
      header: 'Usage',
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => formatRelative(row.original.updatedAt),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank"
        description="Shared and tenant-private question libraries across every supported type, with natural-language search, versioning, and leak detection."
        actions={
          <Button leadingIcon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>
            New question
          </Button>
        }
      />

      <Card>
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          getRowId={(q) => q.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onRowClick={setSelected}
          sorting={sorting}
          onSortingChange={setSorting}
          manualSorting
          emptyTitle="No questions match your filters"
          emptyDescription="Try a different search term or clear filters."
          pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total, onPageChange: setPage } : undefined}
          toolbar={
            <div className="flex flex-wrap gap-2">
              <Input
                leadingIcon={<Search className="size-4" />}
                placeholder="Search by title, summary, or tag…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-64"
              />
              <Select value={type} onChange={(e) => { setType(e.target.value as QuestionTypeId | ''); setPage(1); }} className="w-44">
                <option value="">All types</option>
                {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
              <Select value={difficulty} onChange={(e) => { setDifficulty(e.target.value as DifficultyLevel | ''); setPage(1); }} className="w-36">
                <option value="">All difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </Select>
              <Select value={status} onChange={(e) => { setStatus(e.target.value as QuestionStatus | ''); setPage(1); }} className="w-36">
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="in-review">In review</option>
                <option value="published">Published</option>
                <option value="flagged">Flagged</option>
                <option value="retired">Retired</option>
              </Select>
            </div>
          }
        />
      </Card>

      <QuestionDetailDrawer
        question={selected}
        onClose={() => setSelected(null)}
        onPublish={async (id) => {
          await questionBankService.publish(id);
          toast({ title: 'Question published', variant: 'success' });
          setSelected(null);
          refetch();
        }}
      />

      <CreateQuestionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
