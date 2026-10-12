import type { ColumnDef } from '@tanstack/react-table';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/data-display/DataTable';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { useAsyncData } from '@/hooks/useAsyncData';
import { platformAdminService } from '@/services/api';
import { toast } from '@/store/toastStore';
import type { Tenant } from '@/types';
import { formatDate } from '@/utils/format';

export function PlatformAdminPage() {
  const { data: tenants, isLoading, refetch } = useAsyncData(() => platformAdminService.listTenants(), []);

  async function toggleSuspend(tenant: Tenant) {
    const next = tenant.lifecycleStatus === 'suspended' ? 'active' : 'suspended';
    await platformAdminService.setTenantLifecycle(tenant.id, next);
    toast({ title: `Tenant ${next === 'suspended' ? 'suspended' : 'reactivated'}`, variant: next === 'suspended' ? 'warning' : 'success' });
    refetch();
  }

  const columns: ColumnDef<Tenant, unknown>[] = [
    {
      id: 'name',
      header: 'Tenant',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary">{row.original.name}</p>
          <p className="text-caption text-text-tertiary">{row.original.kind} · {row.original.dataResidency.toUpperCase()}</p>
        </div>
      ),
    },
    { id: 'billing', header: 'Billing status', cell: ({ row }) => <Badge tone={row.original.billingStatus === 'paid' ? 'success' : 'neutral'}>{row.original.billingStatus}</Badge> },
    { id: 'lifecycle', header: 'Lifecycle', cell: ({ row }) => <StatusBadge status={row.original.lifecycleStatus} /> },
    { id: 'modules', header: 'Modules enabled', cell: ({ row }) => row.original.entitlements.filter((e) => e.enabled).length },
    { id: 'created', header: 'Created', cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toggleSuspend(row.original); }}>
          {row.original.lifecycleStatus === 'suspended' ? 'Reactivate' : 'Suspend'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Administration"
        description="Cross-tenant operational view. One standard product and commercial model applies to every tenant, including Kombee's own internal hiring team."
      />
      <Card>
        <DataTable columns={columns} data={tenants ?? []} getRowId={(t) => t.id} isLoading={isLoading} emptyTitle="No tenants" />
      </Card>
    </div>
  );
}
