import type { ModuleKey } from './tenant';

export type ApiEnvironment = 'sandbox' | 'production';

export interface ApiKeyMetadata {
  id: string;
  tenantId: string;
  label: string;
  environment: ApiEnvironment;
  scopedModules: ModuleKey[];
  keyPreview: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
}

export type WebhookDeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retrying';

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  environment: ApiEnvironment;
  active: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: WebhookDeliveryStatus;
  attempt: number;
  maxAttempts: number;
  lastAttemptAt: string;
  responseCode: number | null;
}

export type NamedIntegrationProvider =
  | 'greenhouse'
  | 'lever'
  | 'workday'
  | 'sap-successfactors'
  | 'icims'
  | 'zapier';

export type IntegrationHealth = 'not-configured' | 'connected' | 'degraded' | 'error';

export interface NamedIntegration {
  id: string;
  tenantId: string;
  provider: NamedIntegrationProvider;
  health: IntegrationHealth;
  connectedAt: string | null;
  lastSyncAt: string | null;
}

export interface UsageRecord {
  id: string;
  tenantId: string;
  module: ModuleKey;
  category: 'web' | 'api' | 'ai-compute' | 'execution';
  periodStart: string;
  periodEnd: string;
  quantity: number;
  unit: 'sessions' | 'requests' | 'minutes' | 'executions';
  costOfGoodsUsd: number;
}
