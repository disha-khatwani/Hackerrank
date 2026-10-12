import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/data-display/StatCard';
import { PageHeader } from '@/components/data-display/PageHeader';
import { Switch } from '@/components/forms/Switch';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { billingService, tenantService } from '@/services/api';
import { useTenantStore } from '@/store/tenantStore';
import { toast } from '@/store/toastStore';
import { formatCurrencyUsd, formatNumber } from '@/utils/format';
import { CreditCard, Package, Wallet } from 'lucide-react';
import type { ModuleKey } from '@/types';

export function BillingPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const tenant = useTenantStore((s) => s.tenant);
  const updateEntitlement = useTenantStore((s) => s.updateEntitlement);

  const { data: catalog } = useAsyncData(() => billingService.getModuleCatalog(), []);
  const { data: usage } = useAsyncData(() => billingService.getUsageRecords(tenantId), [tenantId]);

  const totalCost = usage?.reduce((sum, u) => sum + u.costOfGoodsUsd, 0) ?? 0;

  async function toggleModule(moduleKey: ModuleKey, enabled: boolean) {
    if (!tenant) return;
    updateEntitlement(moduleKey, enabled);
    await tenantService.setModuleEnabled(tenant.id, moduleKey, enabled);
    toast({ title: enabled ? 'Module enabled' : 'Module disabled', variant: 'success' });
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Billing & Usage"
        description="Module catalogue, entitlements, and cost-of-goods visibility. Billing status never affects data isolation or entitlement mechanics."
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Billing status" value={tenant?.billingStatus ?? '—'} icon={CreditCard} tone="primary" />
        <StatCard
          label="Modules enabled"
          value={String(tenant?.entitlements.filter((e) => e.enabled).length ?? 0)}
          icon={Package}
        />
        <StatCard label="Cost of goods (30d)" value={formatCurrencyUsd(totalCost)} icon={Wallet} tone="ai" />
      </div>

      {/* Module catalogue */}
      <Card>
        <CardHeader
          title="Module catalogue"
          description="Every module is independently purchasable and enabled per tenant."
        />
        <CardBody className="p-0">
          {(catalog ?? []).map((entry) => {
            const entitlement = tenant?.entitlements.find((e) => e.module === entry.module);
            return (
              <div
                key={entry.module}
                className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-0 transition-colors hover:bg-surface-subtle/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-body-2 font-semibold text-text-primary">{entry.name}</p>
                    <Badge tone="neutral">{entry.pricingModel}</Badge>
                    {entitlement?.enabled && <Badge tone="success">Active</Badge>}
                  </div>
                  <p className="mt-0.5 text-caption text-text-secondary leading-relaxed">{entry.description}</p>
                </div>
                <Switch
                  checked={entitlement?.enabled ?? false}
                  onChange={(checked) => toggleModule(entry.module, checked)}
                />
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* Usage detail */}
      <Card>
        <CardHeader title="Usage detail" />
        <CardBody className="p-0">
          {(usage ?? []).slice(0, 10).map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5 last:border-0 text-body-2"
            >
              <div>
                <p className="font-medium text-text-primary">{record.module}</p>
                <p className="text-caption text-text-tertiary">{record.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-text-primary">{formatCurrencyUsd(record.costOfGoodsUsd)}</p>
                <p className="text-caption text-text-tertiary">
                  {formatNumber(record.quantity)} {record.unit}
                </p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
