import { KeyRound, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Dialog } from '@/components/feedback/Dialog';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { integrationService } from '@/services/api';
import { toast } from '@/store/toastStore';
import type { ApiEnvironment } from '@/types';

export function ApiManagementPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const { data: keys, refetch } = useAsyncData(() => integrationService.listApiKeys(tenantId), [tenantId]);
  const [createOpen, setCreateOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [environment, setEnvironment] = useState<ApiEnvironment>('sandbox');

  async function handleCreate() {
    await integrationService.createApiKey(tenantId, label, environment, ['assessment-builder', 'candidates']);
    toast({ title: 'API key created', description: 'Store it securely — it will not be shown again in full.', variant: 'success' });
    setCreateOpen(false);
    setLabel('');
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="API & Webhooks"
        description="Every module exposes a documented, versioned API with no functional gap from the web interface. Scope keys to exactly what a tenant needs."
        actions={<Button leadingIcon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>New API key</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="API keys" />
          <CardBody className="space-y-2">
            {(keys ?? []).map((key) => (
              <div key={key.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <KeyRound className="size-4 text-text-tertiary" />
                  <div>
                    <p className="text-body-2 font-medium text-text-primary">{key.label}</p>
                    <p className="text-caption text-text-secondary font-mono">{key.keyPreview}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={key.environment === 'production' ? 'primary' : 'neutral'}>{key.environment}</Badge>
                  {key.revoked ? <Badge tone="error">Revoked</Badge> : <Badge tone="success">Active</Badge>}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Sandbox" description="Mocked responses, zero billing impact" />
          <CardBody>
            <pre className="overflow-x-auto rounded-md bg-neutral-900 p-3 text-caption text-neutral-100">
{`POST /v1/sandbox/assessments/:id/invite
Authorization: Bearer kb_test_•••
{
  "candidateEmail": "jamie@example.com"
}`}
            </pre>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Endpoint documentation" description="Representative excerpt — full reference lives in the published API spec" />
        <CardBody className="space-y-3 font-mono text-caption">
          <p><Badge tone="success">POST</Badge> /v1/assessments/:id/invitations</p>
          <p><Badge tone="info">GET</Badge> /v1/candidates/:id/attempts</p>
          <p><Badge tone="info">GET</Badge> /v1/webhooks/:id/deliveries</p>
          <p><Badge tone="success">POST</Badge> /v1/embed/session-token</p>
        </CardBody>
      </Card>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create API key"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!label}>Create key</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Label" required>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. CI integration" />
          </Field>
          <Field label="Environment">
            <Select value={environment} onChange={(e) => setEnvironment(e.target.value as ApiEnvironment)}>
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </Select>
          </Field>
        </div>
      </Dialog>

      <p className="text-caption text-text-tertiary">
        Actual production secrets are never rendered in this UI beyond a masked preview, and must never be stored in client-side source. See docs/ARCHITECTURE.md.
      </p>
    </div>
  );
}
