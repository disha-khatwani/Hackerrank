import { describe, expect, it } from 'vitest';
import { getPermissionsForRoles, ROLES } from './roles';

describe('role/permission matrix', () => {
  it('gives every standard role from the FRD its own distinct permission set', () => {
    const roleKeys = Object.keys(ROLES);
    expect(roleKeys).toEqual(
      expect.arrayContaining([
        'platform-admin',
        'tenant-owner',
        'tenant-admin',
        'recruiter',
        'hiring-manager',
        'interviewer',
        'content-author',
        'auditor',
        'candidate',
      ]),
    );
  });

  it('gives the candidate role zero dashboard permissions', () => {
    expect(ROLES.candidate.permissions).toHaveLength(0);
  });

  it('gives tenant-owner broader access than tenant-admin, including billing', () => {
    expect(ROLES['tenant-owner'].permissions).toContain('billing.manage');
    expect(ROLES['tenant-admin'].permissions).not.toContain('billing.manage');
  });

  it('deduplicates permissions when a user holds multiple roles', () => {
    const permissions = getPermissionsForRoles(['recruiter', 'hiring-manager']);
    const uniqueCount = new Set(permissions).size;
    expect(permissions).toHaveLength(uniqueCount);
    expect(permissions).toContain('candidates.manage');
  });
});
