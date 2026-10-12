export type RoleKey =
  | 'platform-admin'
  | 'tenant-owner'
  | 'tenant-admin'
  | 'recruiter'
  | 'hiring-manager'
  | 'interviewer'
  | 'content-author'
  | 'auditor'
  | 'candidate';

export type Permission =
  | 'tenant.manage'
  | 'org.manage-users'
  | 'org.manage-teams'
  | 'org.view-audit-log'
  | 'skills.manage'
  | 'content.author'
  | 'content.review'
  | 'content.publish'
  | 'assessments.build'
  | 'assessments.publish'
  | 'candidates.manage'
  | 'candidates.invite'
  | 'interviews.conduct'
  | 'interviews.view-rubric'
  | 'integrity.review'
  | 'reports.view'
  | 'reports.export'
  | 'integrations.manage'
  | 'api.manage-keys'
  | 'billing.manage'
  | 'platform.manage-tenants';

export interface Role {
  key: RoleKey;
  label: string;
  description: string;
  permissions: Permission[];
  isCustom?: boolean;
}

export interface User {
  id: string;
  tenantId: string | null;
  name: string;
  email: string;
  avatarUrl?: string;
  roles: RoleKey[];
  teamIds: string[];
  status: 'active' | 'invited' | 'disabled';
  lastActiveAt?: string;
}

export interface Session {
  user: User;
  tenantId: string | null;
  activeRole: RoleKey;
  permissions: Permission[];
}
