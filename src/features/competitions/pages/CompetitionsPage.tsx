import { Trophy, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useAsyncData } from '@/hooks/useAsyncData';
import { developerEcosystemService } from '@/services/api';
import { formatDateTime, formatNumber } from '@/utils/format';

export function CompetitionsPage() {
  const { data: competitions } = useAsyncData(() => developerEcosystemService.listCompetitions(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitions & Hackathons"
        description="Time-boxed, multi-participant competitions with live leaderboards — drawn from a dedicated content pool, separate from graded assessments."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(competitions ?? []).map((c) => (
          <Card key={c.id}>
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <Trophy className="size-5 text-orange-accent" />
                <Badge tone={c.status === 'live' ? 'success' : c.status === 'upcoming' ? 'info' : 'neutral'}>{c.status}</Badge>
              </div>
              <p className="text-h4 text-text-primary">{c.title}</p>
              <Badge tone={c.visibility === 'public' ? 'neutral' : 'primary'}>{c.visibility === 'public' ? 'Public' : 'Tenant-private'}</Badge>
              <p className="text-caption text-text-secondary">{formatDateTime(c.startsAt)}</p>
              <p className="flex items-center gap-1.5 text-caption text-text-tertiary">
                <Users className="size-3.5" /> {formatNumber(c.participantCount)} participants
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
