import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/data-display/PageHeader';
import { ROLES } from '@/config/roles';
import { useSession } from '@/hooks/useSession';
import { cn } from '@/utils/cn';

export function UserProfilePage() {
  const session = useSession();
  if (!session) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="My profile"
        breadcrumbs={[{ label: 'Settings', to: '/settings' }, { label: 'My profile' }]}
      />

      {/* Identity card */}
      <Card>
        <CardBody className="flex items-center gap-5 py-6">
          <Avatar name={session.user.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-h3 font-bold text-text-primary">{session.user.name}</p>
            <p className="mt-0.5 text-body-2 text-text-secondary">{session.user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {session.user.roles.map((r) => (
                <Badge key={r} tone={r === session.activeRole ? 'primary' : 'neutral'}>
                  {r === session.activeRole && (
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                  {ROLES[r].label}
                </Badge>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Active role permissions */}
      <Card>
        <CardHeader
          title="Active role permissions"
          description={`Permissions granted to the ${ROLES[session.activeRole].label} role`}
        />
        <CardBody className="pt-3">
          <div className="flex flex-wrap gap-2">
            {session.permissions.map((p) => (
              <span
                key={p}
                className={cn(
                  'inline-flex items-center rounded-lg border border-border bg-surface-subtle px-2.5 py-1',
                  'text-caption font-mono font-medium text-text-secondary',
                )}
              >
                {p}
              </span>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
