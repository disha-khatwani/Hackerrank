import { ArrowUpRight, Building2, KeyRound, Plug, UserRound, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useSession } from '@/hooks/useSession';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ROLES } from '@/config/roles';
import { cn } from '@/utils/cn';

const LINKS = [
  {
    to: '/settings/organization',
    label: 'Organization',
    description: 'Users, roles, teams, audit log, branding',
    icon: Building2,
    tone: 'primary' as const,
  },
  {
    to: '/settings/profile',
    label: 'My profile',
    description: 'Your account details and active role',
    icon: UserRound,
    tone: 'neutral' as const,
  },
  {
    to: '/billing',
    label: 'Billing & usage',
    description: 'Module catalogue, entitlements, cost of goods',
    icon: Wallet,
    tone: 'neutral' as const,
  },
  {
    to: '/api-management',
    label: 'API & webhooks',
    description: 'API keys, sandbox, documentation',
    icon: KeyRound,
    tone: 'neutral' as const,
  },
  {
    to: '/integrations',
    label: 'Integrations',
    description: 'ATS/HRIS connections and webhook delivery',
    icon: Plug,
    tone: 'neutral' as const,
  },
];

const ICON_TONE_MAP = {
  primary: 'bg-primary-pale text-primary',
  neutral: 'bg-surface-muted text-text-secondary',
};

export function SettingsHubPage() {
  const session = useSession();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Settings"
        description="Tenant, account, and platform configuration."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="group block">
            <Card className="h-full transition-all duration-150 hover:shadow-card-hover hover:-translate-y-0.5 hover:border-neutral-300">
              <CardBody className="flex items-start gap-4">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                    ICON_TONE_MAP[link.tone],
                  )}
                >
                  <link.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-body-2 font-semibold text-text-primary">{link.label}</p>
                    <ArrowUpRight className="size-3.5 shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-0.5 text-caption text-text-secondary leading-relaxed">
                    {link.description}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {session && (
        <Card>
          <CardBody className="flex items-center gap-4">
            <Avatar name={session.user.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-body-2 font-semibold text-text-primary">{session.user.name}</p>
              <p className="text-caption text-text-tertiary">{session.user.email}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {session.user.roles.map((r) => (
                <Badge key={r} tone={r === session.activeRole ? 'primary' : 'neutral'}>
                  {ROLES[r].label}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
