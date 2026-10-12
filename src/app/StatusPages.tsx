import { LockKeyhole, PackageX, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have been moved."
        action={
          <Link to="/app">
            <Button>Back to dashboard</Button>
          </Link>
        }
      />
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={LockKeyhole}
        title="You don't have access to this page"
        description="Your current role doesn't include this permission. Switch roles from the demo identity switcher or ask a Tenant Admin for access."
        action={
          <Button variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
        }
      />
    </div>
  );
}

export function ModuleUnavailablePage({ moduleName }: { moduleName: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={PackageX}
        title={`${moduleName} isn't enabled for this tenant`}
        description="This module can be enabled from Billing & Usage or the platform module catalogue."
        action={
          <Link to="/billing">
            <Button variant="outline">View module catalogue</Button>
          </Link>
        }
      />
    </div>
  );
}
