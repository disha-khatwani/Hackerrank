import type { ApiEnvironment, ApiKeyMetadata, ModuleKey, NamedIntegration, WebhookDelivery, WebhookEndpoint } from '@/types';
import { db } from '../mocks/db';
import { simulateLatency } from './shared';

export const integrationService = {
  async listApiKeys(tenantId: string): Promise<ApiKeyMetadata[]> {
    await simulateLatency();
    return db.apiKeys.filter((k) => k.tenantId === tenantId);
  },

  async createApiKey(
    tenantId: string,
    label: string,
    environment: ApiEnvironment,
    scopedModules: ModuleKey[],
  ): Promise<ApiKeyMetadata> {
    await simulateLatency();
    const key: ApiKeyMetadata = {
      id: db.nextId('key'),
      tenantId,
      label,
      environment,
      scopedModules,
      keyPreview: `kb_${environment === 'production' ? 'live' : 'test'}_••••••••${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      revoked: false,
    };
    db.apiKeys.unshift(key);
    db.appendAuditLog({
      tenantId,
      actorId: 'current-user',
      actorName: 'Current user',
      action: `Created ${environment} API key: ${label}`,
      targetType: 'ApiKey',
      targetId: key.id,
    });
    return key;
  },

  async revokeApiKey(keyId: string): Promise<ApiKeyMetadata> {
    await simulateLatency();
    const key = db.apiKeys.find((k) => k.id === keyId);
    if (!key) throw new Error(`Unknown API key: ${keyId}`);
    key.revoked = true;
    return key;
  },

  async listWebhooks(tenantId: string): Promise<WebhookEndpoint[]> {
    await simulateLatency();
    return db.webhookEndpoints.filter((w) => w.tenantId === tenantId);
  },

  async listDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    await simulateLatency();
    return db.webhookDeliveries.filter((d) => d.webhookId === webhookId);
  },

  async createWebhook(tenantId: string, url: string, events: string[], environment: ApiEnvironment): Promise<WebhookEndpoint> {
    await simulateLatency();
    const webhook: WebhookEndpoint = {
      id: db.nextId('wh'),
      tenantId,
      url,
      events,
      environment,
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.webhookEndpoints.unshift(webhook);
    return webhook;
  },

  async listNamedIntegrations(tenantId: string): Promise<NamedIntegration[]> {
    await simulateLatency();
    return db.namedIntegrations.filter((i) => i.tenantId === tenantId);
  },

  async connectNamedIntegration(id: string): Promise<NamedIntegration> {
    await simulateLatency(400);
    const integration = db.namedIntegrations.find((i) => i.id === id);
    if (!integration) throw new Error(`Unknown integration: ${id}`);
    integration.health = 'connected';
    integration.connectedAt = new Date().toISOString();
    integration.lastSyncAt = new Date().toISOString();
    return integration;
  },
};
