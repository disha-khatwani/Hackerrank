import { useState } from 'react';
import { Dialog } from '@/components/feedback/Dialog';
import { Field } from '@/components/forms/Field';
import { Textarea } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';
import { candidateService } from '@/services/api';
import { toast } from '@/store/toastStore';

export function BulkImportDialog({
  open,
  onClose,
  tenantId,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  onImported: () => void;
}) {
  const [csv, setCsv] = useState('name,email,appliedRole\nJamie Rivera,jamie.rivera@example.com,Frontend Engineer II');
  const [submitting, setSubmitting] = useState(false);

  async function handleImport() {
    setSubmitting(true);
    try {
      const lines = csv.trim().split('\n').slice(1).filter(Boolean);
      const rows = lines.map((line) => {
        const [name, email, appliedRole] = line.split(',').map((s) => s.trim());
        return { name: name ?? '', email: email ?? '', appliedRole };
      }).filter((r) => r.name && r.email);
      const created = await candidateService.bulkImport(tenantId, rows);
      toast({ title: `${created.length} candidate(s) imported`, variant: 'success' });
      onImported();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Bulk import candidates"
      description="Paste CSV with columns: name, email, appliedRole"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport} isLoading={submitting}>Import</Button>
        </>
      }
    >
      <Field label="CSV data">
        <Textarea rows={8} value={csv} onChange={(e) => setCsv(e.target.value)} className="font-mono text-caption" />
      </Field>
    </Dialog>
  );
}
