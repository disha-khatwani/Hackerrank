/**
 * Single in-memory mock "database" for the whole app. Every mock service
 * reads and writes through this module so that, e.g., an assessment created
 * in the builder immediately shows up in candidate management and
 * reporting. Resets on page reload — this is a front-end demo data layer,
 * not persistence; see docs/ARCHITECTURE.md.
 */
import type {
  ApiKeyMetadata,
  Assessment,
  AttemptResult,
  AuditLogEntry,
  Candidate,
  CandidateInvitation,
  IntegrityFlag,
  JobRole,
  Notification,
  Question,
  Skill,
  Tenant,
  User,
  WebhookDelivery,
  WebhookEndpoint,
} from '@/types';
import { ASSESSMENTS } from './assessments';
import { ATTEMPT_RESULTS, CANDIDATES, INVITATIONS } from './candidates';
import { AGENTIC_SESSIONS, AI_FLUENCY_REVIEWS, INTERVIEW_SESSIONS, INTERVIEW_TEMPLATES, SCORECARDS } from './interviews';
import { INTEGRITY_EVENTS, INTEGRITY_FLAGS } from './integrity';
import { API_KEYS, NAMED_INTEGRATIONS, USAGE_RECORDS, WEBHOOK_DELIVERIES, WEBHOOK_ENDPOINTS } from './integrations';
import { AUDIT_LOG, MODULE_CATALOG, NOTIFICATIONS } from './platform';
import { QUESTIONS } from './questions';
import { JOB_ROLES, SKILLS } from './skills';
import { TEAMS, TENANTS } from './tenants';
import { USERS } from './users';
import {
  CERTIFICATIONS,
  COMPETITIONS,
  DEVELOPER_PROFILES,
  JOB_MATCH_PROFILES,
  LEARNING_PATHS,
  PRACTICE_PROBLEMS,
} from './developer-ecosystem';

function clone<T>(value: T): T {
  return structuredClone(value);
}

class MockDatabase {
  tenants: Tenant[] = clone(TENANTS);
  teams = clone(TEAMS);
  users: User[] = clone(USERS);
  skills: Skill[] = clone(SKILLS);
  jobRoles: JobRole[] = clone(JOB_ROLES);
  questions: Question[] = clone(QUESTIONS);
  assessments: Assessment[] = clone(ASSESSMENTS);
  candidates: Candidate[] = clone(CANDIDATES);
  invitations: CandidateInvitation[] = clone(INVITATIONS);
  attemptResults: AttemptResult[] = clone(ATTEMPT_RESULTS);
  interviewTemplates = clone(INTERVIEW_TEMPLATES);
  interviewSessions = clone(INTERVIEW_SESSIONS);
  scorecards = clone(SCORECARDS);
  aiFluencyReviews = clone(AI_FLUENCY_REVIEWS);
  agenticSessions = clone(AGENTIC_SESSIONS);
  integrityEvents = clone(INTEGRITY_EVENTS);
  integrityFlags: IntegrityFlag[] = clone(INTEGRITY_FLAGS);
  apiKeys: ApiKeyMetadata[] = clone(API_KEYS);
  webhookEndpoints: WebhookEndpoint[] = clone(WEBHOOK_ENDPOINTS);
  webhookDeliveries: WebhookDelivery[] = clone(WEBHOOK_DELIVERIES);
  namedIntegrations = clone(NAMED_INTEGRATIONS);
  usageRecords = clone(USAGE_RECORDS);
  auditLog: AuditLogEntry[] = clone(AUDIT_LOG);
  notifications: Notification[] = clone(NOTIFICATIONS);
  moduleCatalog = clone(MODULE_CATALOG);
  practiceProblems = clone(PRACTICE_PROBLEMS);
  competitions = clone(COMPETITIONS);
  certifications = clone(CERTIFICATIONS);
  developerProfiles = clone(DEVELOPER_PROFILES);
  jobMatchProfiles = clone(JOB_MATCH_PROFILES);
  learningPaths = clone(LEARNING_PATHS);

  nextId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'occurredAt'>): void {
    this.auditLog.unshift({
      ...entry,
      id: this.nextId('audit'),
      occurredAt: new Date().toISOString(),
    });
  }
}

export const db = new MockDatabase();
