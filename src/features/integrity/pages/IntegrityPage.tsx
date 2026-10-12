import type { ColumnDef } from '@tanstack/react-table';
import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/data-display/DataTable';
import { Drawer } from '@/components/feedback/Drawer';
import { Field } from '@/components/forms/Field';
import { Textarea } from '@/components/forms/Input';
import { PageHeader } from '@/components/data-display/PageHeader';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { integrityService } from '@/services/api';
import { toast } from '@/store/toastStore';
import type { IntegrityFlag, IntegrityFlagDecision } from '@/types';
import { formatDateTime } from '@/utils/format';
import { cn } from '@/utils/cn';

export function IntegrityPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const [selected, setSelected] = useState<IntegrityFlag | null>(null);
  const [notes, setNotes] = useState('');

  const { data: flags, isLoading, refetch } = useAsyncData(() => integrityService.listFlags(tenantId), [tenantId]);
  const { data: events } = useAsyncData(
    () => (selected ? integrityService.getEventsForAttempt(selected.attemptResultId) : Promise.resolve([])),
    [selected?.id],
  );

  const columns: ColumnDef<IntegrityFlag, unknown>[] = [
    { id: 'candidate', header: 'Candidate', cell: ({ row }) => row.original.candidateId },
    {
      id: 'signals',
      header: 'Signals',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning-light px-2 py-0.5 text-caption font-semibold text-brown">
          {row.original.contributingSignalIds.length}
        </span>
      ),
    },
    {
      id: 'threshold',
      header: 'Sensitivity',
      cell: ({ row }) => <Badge tone="neutral">{row.original.sensitivityThreshold}</Badge>,
    },
    { id: 'decision', header: 'Decision', cell: ({ row }) => <StatusBadge status={row.original.decision} /> },
    { id: 'createdAt', header: 'Raised', cell: ({ row }) => formatDateTime(row.original.createdAt) },
  ];

  async function resolve(decision: IntegrityFlagDecision) {
    if (!selected) return;
    await integrityService.resolveFlag(selected.id, decision, session?.user.id ?? 'current-user', notes);
    toast({
      title: decision === 'confirmed-violation' ? 'Violation confirmed' : 'Candidate cleared',
      variant: decision === 'confirmed-violation' ? 'warning' : 'success',
    });
    setSelected(null);
    setNotes('');
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrity Review"
        description="Every flag requires human review before any adverse action. No signal, alone or combined, ever automatically rejects or penalizes a candidate."
      />

      <Card>
        <DataTable
          columns={columns}
          data={flags ?? []}
          getRowId={(f) => f.id}
          isLoading={isLoading}
          onRowClick={setSelected}
          emptyTitle="No integrity flags"
          emptyDescription="Flags raised during proctored assessments will appear here for human review."
        />
      </Card>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Integrity flag review"
        description={selected ? `Candidate: ${selected.candidateId}` : undefined}
        footer={
          selected?.decision === 'pending' ? (
            <>
              <Button
                variant="outline"
                leadingIcon={<ShieldCheck className="size-4" />}
                onClick={() => resolve('cleared')}
              >
                Clear candidate
              </Button>
              <Button
                variant="danger"
                leadingIcon={<ShieldX className="size-4" />}
                onClick={() => resolve('confirmed-violation')}
              >
                Confirm violation
              </Button>
            </>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral">Sensitivity: {selected.sensitivityThreshold}</Badge>
              <StatusBadge status={selected.decision} />
            </div>

            <div>
              <p className="mb-3 text-body-2 font-semibold text-text-primary">Contributing signals</p>
              <div className="space-y-2">
                {(events ?? []).map((e) => (
                  <div
                    key={e.id}
                    className="rounded-xl border border-border bg-surface-subtle p-3.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                      <div>
                        <p className="text-caption font-semibold capitalize text-text-primary">
                          {e.type.replace(/-/g, ' ')}
                        </p>
                        <p className="mt-0.5 text-body-2 text-text-secondary">{e.detail}</p>
                        <p className="mt-1 text-caption text-text-tertiary">{formatDateTime(e.occurredAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selected.decision === 'pending' ? (
              <Field
                label="Reviewer notes"
                hint="Required before confirming a violation. The candidate retains the right to explain before any adverse action."
              >
                <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
            ) : (
              <div className="rounded-xl border border-border bg-surface-subtle p-4">
                <p className="text-caption font-semibold uppercase tracking-widest text-text-tertiary">Reviewer notes</p>
                <p className="mt-2 text-body-2 text-text-primary leading-relaxed">{selected.reviewerNotes}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
