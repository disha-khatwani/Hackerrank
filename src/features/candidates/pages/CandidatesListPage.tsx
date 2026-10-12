import type { ColumnDef } from '@tanstack/react-table';
import { Search, Upload } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/forms/Input';
import { DataTable } from '@/components/data-display/DataTable';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSession } from '@/hooks/useSession';
import { candidateService } from '@/services/api';
import type { Candidate } from '@/types';
import { formatRelative } from '@/utils/format';
import { BulkImportDialog } from '../components/BulkImportDialog';

export function CandidatesListPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);

  const { data, isLoading, error, refetch } = useAsyncData(
    () => candidateService.list(tenantId, { search: debouncedSearch || undefined }, { page, pageSize: 10 }),
    [tenantId, debouncedSearch, page],
  );

  const columns: ColumnDef<Candidate, unknown>[] = [
    {
      id: 'name',
      header: 'Candidate',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.original.name} size="sm" />
          <div>
            <p className="font-medium text-text-primary">{row.original.name}</p>
            <p className="text-caption text-text-tertiary">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'appliedRole', header: 'Applied role', cell: ({ row }) => row.original.appliedRole ?? '—' },
    { id: 'source', header: 'Source', cell: ({ row }) => <Badge tone="neutral">{row.original.source.replace('-', ' ')}</Badge> },
    {
      id: 'discoverable',
      header: 'Job matching',
      cell: ({ row }) => (row.original.discoverableProfileOptIn ? <Badge tone="success">Opted in</Badge> : <Badge tone="neutral">Not opted in</Badge>),
    },
    { id: 'createdAt', header: 'Added', cell: ({ row }) => formatRelative(row.original.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidates"
        description="Candidate directory, pipeline status, and assessment/interview history for your tenant."
        actions={
          <Button variant="outline" leadingIcon={<Upload className="size-4" />} onClick={() => setImportOpen(true)}>
            Bulk import
          </Button>
        }
      />

      <Card>
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          getRowId={(c) => c.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onRowClick={(c) => navigate(`/candidates/${c.id}`)}
          emptyTitle="No candidates found"
          pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total, onPageChange: setPage } : undefined}
          toolbar={
            <Input
              leadingIcon={<Search className="size-4" />}
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-72"
            />
          }
        />
      </Card>

      <BulkImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        tenantId={tenantId}
        onImported={() => {
          setImportOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
