import { useState } from 'react';
import { Dialog } from '@/components/feedback/Dialog';
import { Field } from '@/components/forms/Field';
import { Checkbox } from '@/components/forms/Checkbox';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAsyncData } from '@/hooks/useAsyncData';
import { assessmentService, candidateService } from '@/services/api';
import { toast } from '@/store/toastStore';

export function InviteCandidatesDialog({
  open,
  onClose,
  assessmentId,
  tenantId,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
  tenantId: string;
  onInvited: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const { data: candidatesPage } = useAsyncData(
    () => candidateService.list(tenantId, { search }, { page: 1, pageSize: 20 }),
    [tenantId, search, open],
  );

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleInvite() {
    setSubmitting(true);
    try {
      await assessmentService.inviteCandidates(assessmentId, Array.from(selectedIds));
      toast({ title: `${selectedIds.size} candidate(s) invited`, variant: 'success' });
      setSelectedIds(new Set());
      onInvited();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Invite candidates"
      description="Select candidates from your tenant's directory to invite to this assessment."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInvite} isLoading={submitting} disabled={selectedIds.size === 0}>
            Invite {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Search candidates">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" />
        </Field>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {(candidatesPage?.items ?? []).map((c) => (
            <label key={c.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-surface-subtle">
              <Checkbox checked={selectedIds.has(c.id)} onChange={() => toggle(c.id)} />
              <Avatar name={c.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-body-2 text-text-primary">{c.name}</p>
                <p className="text-caption text-text-secondary">{c.email}</p>
              </div>
            </label>
          ))}
          {candidatesPage?.items.length === 0 && (
            <p className="py-6 text-center text-body-2 text-text-secondary">No candidates found.</p>
          )}
        </div>
      </div>
    </Dialog>
  );
}
