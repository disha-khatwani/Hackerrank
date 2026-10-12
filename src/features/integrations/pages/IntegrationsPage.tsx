import { CheckCircle2, CircleAlert, CircleDashed, Send } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { Tabs } from '@/components/navigation/Tabs';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { integrationService } from '@/services/api';
import { toast } from '@/store/toastStore';
import { formatDateTime } from '@/utils/format';

const PROVIDER_LABELS: Record<string, string> = {
  greenhouse: 'Greenhouse',
  lever: 'Lever',
  workday: 'Workday',
  'sap-successfactors': 'SAP SuccessFactors',
  icims: 'iCIMS',
  zapier: 'Zapier (general automation)',
};

const HEALTH_ICON = { connected: CheckCircle2, degraded: CircleAlert, error: CircleAlert, 'not-configured': CircleDashed };

const TABS = [
  { value: 'ats', label: 'ATS / HRIS' },
  { value: 'webhooks', label: 'Webhooks' },
];

export function IntegrationsPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const [tab, setTab] = useState('ats');

  const { data: integrations, refetch } = useAsyncData(() => integrationService.listNamedIntegrations(tenantId), [tenantId]);
  const { data: webhooks } = useAsyncData(() => integrationService.listWebhooks(tenantId), [tenantId]);
  const { data: deliveries } = useAsyncData(
    () => (webhooks?.[0] ? integrationService.listDeliveries(webhooks[0].id) : Promise.resolve([])),
    [webhooks?.[0]?.id],
  );

  async function connect(id: string) {
    await integrationService.connectNamedIntegration(id);
    toast({ title: 'Integration connected', variant: 'success' });
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ATS / HRIS & Automation Integrations"
        description="Named integrations with applicant-tracking and HR systems, plus webhook delivery for results and scorecards."
      />

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'ats' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(integrations ?? []).map((integration) => {
            const Icon = HEALTH_ICON[integration.health];
            return (
              <Card key={integration.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-h4 text-text-primary">{PROVIDER_LABELS[integration.provider]}</p>
                    <Icon className={`size-5 ${integration.health === 'connected' ? 'text-success' : integration.health === 'not-configured' ? 'text-text-tertiary' : 'text-warning'}`} />
                  </div>
                  <StatusBadge status={integration.health} />
                  <p className="text-caption text-text-secondary">
                    {integration.lastSyncAt ? `Last sync: ${formatDateTime(integration.lastSyncAt)}` : 'Not yet connected'}
                  </p>
                  {integration.health === 'not-configured' && (
                    <Button size="sm" variant="outline" className="w-full" onClick={() => connect(integration.id)}>
                      Connect
                    </Button>
                  )}
                  {integration.health === 'degraded' && (
                    <Button size="sm" variant="outline" className="w-full" onClick={() => connect(integration.id)}>
                      Reconnect
                    </Button>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'webhooks' && (
        <Card>
          <CardHeader title="Webhook endpoints" action={<Button size="sm" leadingIcon={<Send className="size-3.5" />}>Add endpoint</Button>} />
          <CardBody className="space-y-4">
            {(webhooks ?? []).map((wh) => (
              <div key={wh.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-body-2 font-medium text-text-primary">{wh.url}</p>
                  <Badge tone={wh.active ? 'success' : 'neutral'}>{wh.active ? 'Active' : 'Paused'}</Badge>
                </div>
                <p className="text-caption text-text-secondary mt-1">Events: {wh.events.join(', ')}</p>
                <div className="mt-3 space-y-1.5">
                  <p className="text-caption font-medium text-text-tertiary">Recent deliveries</p>
                  {(deliveries ?? []).slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-caption">
                      <span className="text-text-primary">{d.event}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-text-tertiary">Attempt {d.attempt}/{d.maxAttempts}</span>
                        <StatusBadge status={d.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
