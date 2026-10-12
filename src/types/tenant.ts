export type BillingStatus = 'paid' | 'trial' | 'internal';

export type DataResidencyRegion = 'in' | 'eu' | 'us' | 'apac';

export type TenantLifecycleStatus = 'active' | 'suspended' | 'offboarding' | 'archived';

/** Every module a tenant can independently purchase/enable. Billing status never gates this. */
export type ModuleKey =
  | 'skills'
  | 'question-bank'
  | 'assessment-builder'
  | 'candidates'
  | 'ai-interviews'
  | 'live-interviews'
  | 'ai-fluency'
  | 'agentic-environment'
  | 'integrity'
  | 'reporting'
  | 'integrations'
  | 'api-management'
  | 'internal-learning'
  | 'practice'
  | 'competitions'
  | 'certifications'
  | 'job-matching'
  | 'billing';

export interface ModuleEntitlement {
  module: ModuleKey;
  enabled: boolean;
  enabledOn?: string;
  accessSurfaces: Array<'web' | 'api'>;
}

export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
  candidateFacingDomain?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  kind: 'external' | 'hrms' | 'kombee-internal';
  billingStatus: BillingStatus;
  lifecycleStatus: TenantLifecycleStatus;
  dataResidency: DataResidencyRegion;
  createdAt: string;
  entitlements: ModuleEntitlement[];
  branding: TenantBranding;
}

export interface Team {
  id: string;
  tenantId: string;
  name: string;
  memberCount: number;
}
