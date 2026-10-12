import { CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useSession } from '@/hooks/useSession';
import { developerEcosystemService } from '@/services/api';

export function InternalLearningPage() {
  const session = useSession();
  const tenantId = session?.tenantId ?? '';
  const { data: paths } = useAsyncData(() => developerEcosystemService.listLearningPaths(tenantId), [tenantId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internal Skill Assessment & Developer Learning"
        description="Run the same assessment capability against your own employees — strictly separated from external hiring data. Employee skill profiles, gap analysis, and learning paths."
      />

      <Card>
        <CardHeader title="Learning paths" description="Derived from identified skill gaps, mapped to specific skills" />
        <CardBody className="space-y-4">
          {(paths ?? []).length === 0 && <EmptyState title="No learning paths configured yet" />}
          {(paths ?? []).map((path) => (
            <div key={path.id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-body-2 font-medium text-text-primary">{path.title}</p>
                <Badge tone="neutral">{path.checkpoints.filter((c) => c.completed).length}/{path.checkpoints.length} complete</Badge>
              </div>
              <div className="mt-2 space-y-1.5">
                {path.checkpoints.map((cp) => (
                  <div key={cp.id} className="flex items-center gap-2 text-body-2">
                    {cp.completed ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-text-tertiary" />}
                    <span className={cp.completed ? 'text-text-secondary line-through' : 'text-text-primary'}>{cp.title}</span>
                    <Badge tone="neutral">{cp.kind.replace('-', ' ')}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="rounded-md border border-dashed border-border-strong p-4 text-body-2 text-text-secondary">
        Employee skill profiles and organization-level readiness reporting reuse the Skills & Role Management taxonomy and
        are strictly isolated from this tenant's external hiring data (SKUP-08).
      </div>
    </div>
  );
}
