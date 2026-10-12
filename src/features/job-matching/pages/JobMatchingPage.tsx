import { Eye, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Switch } from '@/components/forms/Switch';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useAsyncData } from '@/hooks/useAsyncData';
import { developerEcosystemService } from '@/services/api';
import { toast } from '@/store/toastStore';

const DEMO_CANDIDATE_ID = 'cand-northwind-001';

export function JobMatchingPage() {
  const { data: profile, refetch } = useAsyncData(() => developerEcosystemService.getJobMatchProfile(DEMO_CANDIDATE_ID), []);

  async function toggle(optedIn: boolean) {
    await developerEcosystemService.setJobMatchOptIn(DEMO_CANDIDATE_ID, optedIn);
    toast({ title: optedIn ? 'Opted in to job matching' : 'Opted out of job matching', variant: 'success' });
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Matching"
        description="The one deliberate, narrow exception to tenant isolation — a candidate's opt-in discoverable profile, never derived automatically from private assessment data."
      />

      <Card>
        <CardHeader title="Candidate opt-in (demo: Ava Bennett)" />
        <CardBody className="space-y-4">
          <Switch
            checked={profile?.optedIn ?? false}
            onChange={toggle}
            label="Discoverable to tenants with open roles"
            description="You can revoke this at any time. Opting in never grants access to any tenant's private hiring relationship with you."
          />

          {profile?.optedIn && (
            <div className="rounded-md border border-border p-4">
              <p className="mb-2 flex items-center gap-1.5 text-body-2 font-medium text-text-primary">
                <Eye className="size-4" /> Exactly what will be visible
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.visibleSkillIds.map((s) => (
                  <Badge key={s} tone="neutral">{s}</Badge>
                ))}
              </div>
              <p className="mt-3 text-body-2 text-text-secondary">{profile.selfDescribedExperience}</p>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-md border border-border bg-surface-subtle p-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-text-secondary" />
            <p className="text-caption text-text-secondary">
              A search never surfaces a candidate who hasn't opted in, and shows zero connection to any private hiring
              relationship a searching tenant already separately has with that candidate (JOB-03).
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
