import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { useTenantStore } from '@/store/tenantStore';
import type { Tenant } from '@/types';
import { RequireEntitlement } from './RequireEntitlement';

const BASE_TENANT: Tenant = {
  id: 'tenant-test',
  name: 'Test Tenant',
  slug: 'test',
  kind: 'external',
  billingStatus: 'paid',
  lifecycleStatus: 'active',
  dataResidency: 'us',
  createdAt: new Date().toISOString(),
  entitlements: [
    { module: 'ai-fluency', enabled: false, accessSurfaces: [] },
    { module: 'candidates', enabled: true, accessSurfaces: ['web', 'api'] },
  ],
  branding: {},
};

describe('RequireEntitlement', () => {
  afterEach(() => {
    useTenantStore.getState().setTenant(null);
  });

  it('renders children when the module is enabled for the tenant', () => {
    useTenantStore.getState().setTenant(BASE_TENANT);
    render(
      <MemoryRouter>
        <RequireEntitlement module="candidates">
          <div>Candidates content</div>
        </RequireEntitlement>
      </MemoryRouter>,
    );
    expect(screen.getByText('Candidates content')).toBeInTheDocument();
  });

  it('renders the module-unavailable state when the module is disabled, never silently hides it', () => {
    useTenantStore.getState().setTenant(BASE_TENANT);
    render(
      <MemoryRouter>
        <RequireEntitlement module="ai-fluency">
          <div>AI Fluency content</div>
        </RequireEntitlement>
      </MemoryRouter>,
    );
    expect(screen.queryByText('AI Fluency content')).not.toBeInTheDocument();
    expect(screen.getByText(/isn't enabled for this tenant/i)).toBeInTheDocument();
  });

  it('billing status never implies entitlement — a paid tenant without the module still sees it gated (TEN-06)', () => {
    useTenantStore.getState().setTenant({ ...BASE_TENANT, billingStatus: 'paid' });
    render(
      <MemoryRouter>
        <RequireEntitlement module="ai-fluency">
          <div>AI Fluency content</div>
        </RequireEntitlement>
      </MemoryRouter>,
    );
    expect(screen.queryByText('AI Fluency content')).not.toBeInTheDocument();
  });
});
