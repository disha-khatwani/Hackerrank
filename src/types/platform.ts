import type { ModuleKey } from './tenant';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  occurredAt: string;
}

export interface SupportAccessGrant {
  id: string;
  tenantId: string;
  grantedToStaffId: string;
  reason: string;
  grantedAt: string;
  expiresAt: string;
  consentedByUserId: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

export interface ModuleCatalogEntry {
  module: ModuleKey;
  name: string;
  description: string;
  category: 'hiring' | 'interviewing' | 'developer-ecosystem' | 'platform';
  pricingModel: 'per-seat' | 'per-usage' | 'flat';
}
