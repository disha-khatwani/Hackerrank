import { Award, BadgeCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useAsyncData } from '@/hooks/useAsyncData';
import { developerEcosystemService } from '@/services/api';
import { formatDate } from '@/utils/format';

const DEMO_USER_ID = 'cand-northwind-001';

export function DeveloperProfilePage() {
  const { data: profile, isLoading } = useAsyncData(() => developerEcosystemService.getDeveloperProfile(DEMO_USER_ID), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Profile"
        description="Verified assessment and certification history the candidate has chosen to display — kept separate from the Job Matching discoverable profile."
      />

      {isLoading && <p className="text-body-2 text-text-secondary">Loading…</p>}
      {!isLoading && !profile && <EmptyState title="No developer profile for this demo user" />}

      {profile && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardBody className="flex flex-col items-center gap-2 text-center">
              <Avatar name={profile.displayName} size="lg" />
              <p className="text-h4 text-text-primary">{profile.displayName}</p>
              <p className="text-body-2 text-text-secondary">{profile.headline}</p>
              <Badge tone={profile.publicPageEnabled ? 'success' : 'neutral'}>
                {profile.publicPageEnabled ? 'Public page enabled' : 'Public page disabled'}
              </Badge>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardBody className="space-y-4">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-body-2 font-medium text-text-primary">
                  <BadgeCheck className="size-4" /> Verified assessments
                </p>
                <div className="space-y-2">
                  {profile.verifiedAssessments.map((a, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-body-2">
                      <span className="text-text-primary">{a.assessmentTitle}</span>
                      <span className="text-text-secondary">{a.scorePercent}% · {formatDate(a.completedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-body-2 font-medium text-text-primary">
                  <Award className="size-4" /> Badges & achievements
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.badges.map((b) => (
                    <Badge key={b} tone="ai">{b}</Badge>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
