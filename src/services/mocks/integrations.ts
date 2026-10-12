import type { ApiKeyMetadata, NamedIntegration, UsageRecord, WebhookDelivery, WebhookEndpoint } from '@/types';
import { createSeededRandom, daysAgo, randomInt } from '@/utils/random';

export const API_KEYS: ApiKeyMetadata[] = [
  {
    id: 'key-001',
    tenantId: 'tenant-northwind',
    label: 'Production — Hiring Platform',
    environment: 'production',
    scopedModules: ['assessment-builder', 'candidates', 'reporting'],
    keyPreview: 'kb_live_••••••••a91f',
    createdAt: daysAgo(200),
    lastUsedAt: daysAgo(0),
    revoked: false,
  },
  {
    id: 'key-002',
    tenantId: 'tenant-northwind',
    label: 'Sandbox — Integration Testing',
    environment: 'sandbox',
    scopedModules: ['assessment-builder', 'candidates', 'reporting', 'ai-interviews'],
    keyPreview: 'kb_test_••••••••2c0d',
    createdAt: daysAgo(90),
    lastUsedAt: daysAgo(4),
    revoked: false,
  },
];

export const WEBHOOK_ENDPOINTS: WebhookEndpoint[] = [
  {
    id: 'wh-001',
    tenantId: 'tenant-northwind',
    url: 'https://hooks.northwind.com/kombee/results',
    events: ['assessment.completed', 'interview.scorecard-submitted'],
    environment: 'production',
    active: true,
    createdAt: daysAgo(180),
  },
];

const whRandom = createSeededRandom(7);
export const WEBHOOK_DELIVERIES: WebhookDelivery[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `whd-${i + 1}`,
  webhookId: 'wh-001',
  event: i % 3 === 0 ? 'interview.scorecard-submitted' : 'assessment.completed',
  status: i === 2 ? 'failed' : i === 5 ? 'retrying' : 'delivered',
  attempt: i === 2 ? 3 : 1,
  maxAttempts: 5,
  lastAttemptAt: daysAgo(randomInt(0, 30, whRandom)),
  responseCode: i === 2 ? 503 : 200,
}));

export const NAMED_INTEGRATIONS: NamedIntegration[] = [
  { id: 'ni-greenhouse', tenantId: 'tenant-northwind', provider: 'greenhouse', health: 'connected', connectedAt: daysAgo(180), lastSyncAt: daysAgo(0) },
  { id: 'ni-lever', tenantId: 'tenant-northwind', provider: 'lever', health: 'not-configured', connectedAt: null, lastSyncAt: null },
  { id: 'ni-workday', tenantId: 'tenant-northwind', provider: 'workday', health: 'degraded', connectedAt: daysAgo(400), lastSyncAt: daysAgo(9) },
  { id: 'ni-zapier', tenantId: 'tenant-orbital', provider: 'zapier', health: 'not-configured', connectedAt: null, lastSyncAt: null },
];

const usageRandom = createSeededRandom(99);
const modules: UsageRecord['module'][] = ['assessment-builder', 'ai-interviews', 'candidates', 'api-management', 'integrity'];
export const USAGE_RECORDS: UsageRecord[] = Array.from({ length: 30 }).map((_, i) => {
  const module = modules[i % modules.length] as UsageRecord['module'];
  return {
    id: `usage-${i + 1}`,
    tenantId: i % 4 === 0 ? 'tenant-orbital' : 'tenant-northwind',
    module,
    category: module === 'ai-interviews' ? 'ai-compute' : module === 'api-management' ? 'api' : 'web',
    periodStart: daysAgo(30 - i),
    periodEnd: daysAgo(29 - i),
    quantity: randomInt(5, 400, usageRandom),
    unit: module === 'ai-interviews' ? 'minutes' : module === 'api-management' ? 'requests' : 'sessions',
    costOfGoodsUsd: Number((randomInt(2, 180, usageRandom) + usageRandom()).toFixed(2)),
  };
});
