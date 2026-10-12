import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { useSessionStore } from '@/store/sessionStore';
import { RequirePermission } from './RequirePermission';

const DEMO_USER = {
  id: 'u1',
  tenantId: 'tenant-northwind',
  name: 'Test User',
  email: 'test@example.com',
  roles: ['interviewer'] as const,
  teamIds: [],
  status: 'active' as const,
};

describe('RequirePermission', () => {
  afterEach(() => {
    useSessionStore.getState().signOut();
  });

  it('renders children when the active role holds the permission', () => {
    useSessionStore.getState().signIn({ ...DEMO_USER, roles: ['tenant-owner'] }, 'tenant-owner');
    render(
      <MemoryRouter>
        <RequirePermission permission="billing.manage">
          <div>Billing content</div>
        </RequirePermission>
      </MemoryRouter>,
    );
    expect(screen.getByText('Billing content')).toBeInTheDocument();
  });

  it('renders the unauthorized state when the active role lacks the permission', () => {
    useSessionStore.getState().signIn(DEMO_USER, 'interviewer');
    render(
      <MemoryRouter>
        <RequirePermission permission="billing.manage">
          <div>Billing content</div>
        </RequirePermission>
      </MemoryRouter>,
    );
    expect(screen.queryByText('Billing content')).not.toBeInTheDocument();
    expect(screen.getByText(/don't have access/i)).toBeInTheDocument();
  });
});
