import type { ModuleKey, ModuleEntitlement, Tenant } from '@/types';
import { daysAgo } from '@/utils/random';

const ALL_MODULES: ModuleKey[] = [
  'skills',
  'question-bank',
  'assessment-builder',
  'candidates',
  'ai-interviews',
  'live-interviews',
  'ai-fluency',
  'agentic-environment',
  'integrity',
  'reporting',
  'integrations',
  'api-management',
  'internal-learning',
  'practice',
  'competitions',
  'certifications',
  'job-matching',
  'billing',
];

function entitlementsFor(enabled: ModuleKey[]): ModuleEntitlement[] {
  return ALL_MODULES.map((module) => ({
    module,
    enabled: enabled.includes(module),
    enabledOn: enabled.includes(module) ? daysAgo(180) : undefined,
    accessSurfaces: enabled.includes(module) ? (['web', 'api'] as const) : [],
  }));
}

export const TENANTS: Tenant[] = [
  {
    id: 'tenant-northwind',
    name: 'Northwind Analytics',
    slug: 'northwind',
    kind: 'external',
    billingStatus: 'paid',
    lifecycleStatus: 'active',
    dataResidency: 'us',
    createdAt: daysAgo(420),
    entitlements: entitlementsFor(ALL_MODULES),
    branding: { candidateFacingDomain: 'careers.northwind.com', primaryColor: '#4648D4' },
  },
  {
    id: 'tenant-orbital',
    name: 'Orbital Robotics',
    slug: 'orbital',
    kind: 'external',
    billingStatus: 'trial',
    lifecycleStatus: 'active',
    dataResidency: 'eu',
    createdAt: daysAgo(21),
    entitlements: entitlementsFor([
      'skills',
      'question-bank',
      'assessment-builder',
      'candidates',
      'ai-interviews',
      'reporting',
    ]),
    branding: { candidateFacingDomain: 'jobs.orbitalrobotics.io' },
  },
  {
    id: 'tenant-hrms',
    name: 'Kombee HRMS',
    slug: 'kombee-hrms',
    kind: 'hrms',
    billingStatus: 'paid',
    lifecycleStatus: 'active',
    dataResidency: 'in',
    createdAt: daysAgo(540),
    entitlements: entitlementsFor(ALL_MODULES),
    branding: { candidateFacingDomain: 'hire.kombeehrms.com' },
  },
  {
    id: 'tenant-kombee-internal',
    name: 'Kombee Internal Hiring',
    slug: 'kombee-internal',
    kind: 'kombee-internal',
    billingStatus: 'internal',
    lifecycleStatus: 'active',
    dataResidency: 'in',
    createdAt: daysAgo(720),
    entitlements: entitlementsFor(ALL_MODULES),
    branding: { candidateFacingDomain: 'careers.kombee.com' },
  },
];

export const TEAMS = [
  { id: 'team-nw-eng', tenantId: 'tenant-northwind', name: 'Engineering Hiring', memberCount: 8 },
  { id: 'team-nw-data', tenantId: 'tenant-northwind', name: 'Data & Analytics Hiring', memberCount: 4 },
  { id: 'team-orbital-core', tenantId: 'tenant-orbital', name: 'Core Robotics', memberCount: 5 },
];
