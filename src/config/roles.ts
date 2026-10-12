import type { Permission, Role, RoleKey } from '@/types';

/**
 * Standard role → permission matrix. Modeled explicitly per role (not as an
 * interchangeable list) per the BRD's instruction to represent each role's
 * permissions distinctly. Enforced here for navigation/UI gating only — the
 * BRD requires the backend to be the actual authorization boundary; see
 * docs/ARCHITECTURE.md.
 */
export const ROLES: Record<RoleKey, Role> = {
  'platform-admin': {
    key: 'platform-admin',
    label: 'Platform Admin',
    description: 'Manages tenants, module catalogue, and platform-wide operations across all organizations.',
    permissions: ['platform.manage-tenants', 'org.view-audit-log', 'reports.view', 'billing.manage'],
  },
  'tenant-owner': {
    key: 'tenant-owner',
    label: 'Tenant Owner',
    description: 'Full control over the tenant: billing, entitlements, users, and every workflow.',
    permissions: [
      'tenant.manage',
      'org.manage-users',
      'org.manage-teams',
      'org.view-audit-log',
      'skills.manage',
      'content.author',
      'content.review',
      'content.publish',
      'assessments.build',
      'assessments.publish',
      'candidates.manage',
      'candidates.invite',
      'interviews.conduct',
      'interviews.view-rubric',
      'integrity.review',
      'reports.view',
      'reports.export',
      'integrations.manage',
      'api.manage-keys',
      'billing.manage',
    ],
  },
  'tenant-admin': {
    key: 'tenant-admin',
    label: 'Tenant Admin',
    description: 'Administers users, content, and workflows for the tenant without billing control.',
    permissions: [
      'org.manage-users',
      'org.manage-teams',
      'org.view-audit-log',
      'skills.manage',
      'content.author',
      'content.review',
      'content.publish',
      'assessments.build',
      'assessments.publish',
      'candidates.manage',
      'candidates.invite',
      'interviews.view-rubric',
      'integrity.review',
      'reports.view',
      'reports.export',
      'integrations.manage',
      'api.manage-keys',
    ],
  },
  recruiter: {
    key: 'recruiter',
    label: 'Recruiter',
    description: 'Builds assessments, manages candidates, and tracks hiring pipeline progress.',
    permissions: [
      'assessments.build',
      'assessments.publish',
      'candidates.manage',
      'candidates.invite',
      'reports.view',
      'reports.export',
    ],
  },
  'hiring-manager': {
    key: 'hiring-manager',
    label: 'Hiring Manager',
    description: 'Reviews candidates, scorecards, and reports for their open roles.',
    permissions: ['candidates.manage', 'interviews.view-rubric', 'reports.view'],
  },
  interviewer: {
    key: 'interviewer',
    label: 'Interviewer',
    description: 'Conducts live interviews and submits structured scorecards.',
    permissions: ['interviews.conduct', 'interviews.view-rubric'],
  },
  'content-author': {
    key: 'content-author',
    label: 'Content Author',
    description: 'Authors and maintains questions in the shared and private question libraries.',
    permissions: ['content.author', 'skills.manage'],
  },
  auditor: {
    key: 'auditor',
    label: 'Auditor',
    description: 'Read-only access to audit logs, integrity review, and compliance reporting.',
    permissions: ['org.view-audit-log', 'integrity.review', 'reports.view'],
  },
  candidate: {
    key: 'candidate',
    label: 'Candidate',
    description: 'Takes assessments and interviews via the dedicated candidate experience.',
    permissions: [],
  },
};

export function getPermissionsForRoles(roleKeys: RoleKey[]): Permission[] {
  const set = new Set<Permission>();
  for (const key of roleKeys) {
    for (const permission of ROLES[key].permissions) {
      set.add(permission);
    }
  }
  return Array.from(set);
}
