import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader } from '@/components/data-display/PageHeader';
import { useAsyncData } from '@/hooks/useAsyncData';
import { developerEcosystemService } from '@/services/api';

export function CertificationsPage() {
  const { data: certifications } = useAsyncData(() => developerEcosystemService.listCertifications(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certifications"
        description="Standalone, proctored certification tests producing a verifiable, portable credential a candidate can carry to any tenant."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(certifications ?? []).map((cert) => (
          <Card key={cert.id}>
            <CardBody className="space-y-3">
              <Award className="size-6 text-brown" />
              <p className="text-h4 text-text-primary">{cert.title}</p>
              <Badge tone="neutral">Pass at {cert.passThresholdPercent}%</Badge>
              <Button variant="outline" size="sm" className="w-full">View details</Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
