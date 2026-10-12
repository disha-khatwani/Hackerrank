import type { AuditLogEntry, ModuleCatalogEntry, Notification } from '@/types';
import { daysAgo } from '@/utils/random';

export const AUDIT_LOG: AuditLogEntry[] = [
  { id: 'audit-1', tenantId: 'tenant-northwind', actorId: 'user-nw-admin', actorName: 'Jordan Lee', action: 'Published assessment', targetType: 'Assessment', targetId: 'asmt-frontend-ii', occurredAt: daysAgo(110) },
  { id: 'audit-2', tenantId: 'tenant-northwind', actorId: 'user-nw-recruiter', actorName: 'Sam Patel', action: 'Invited 6 candidates', targetType: 'Assessment', targetId: 'asmt-backend-senior', occurredAt: daysAgo(40) },
  { id: 'audit-3', tenantId: 'tenant-northwind', actorId: 'user-nw-owner', actorName: 'Alexis Morgan', action: 'Enabled module', targetType: 'Module', targetId: 'ai-fluency', occurredAt: daysAgo(35) },
  { id: 'audit-4', tenantId: 'tenant-northwind', actorId: 'user-nw-auditor', actorName: 'Morgan Blake', action: 'Reviewed integrity flag', targetType: 'IntegrityFlag', targetId: 'flag-001', occurredAt: daysAgo(3) },
  { id: 'audit-5', tenantId: 'tenant-northwind', actorId: 'user-nw-admin', actorName: 'Jordan Lee', action: 'Added API key', targetType: 'ApiKey', targetId: 'key-002', occurredAt: daysAgo(90) },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', userId: 'user-nw-owner', title: 'Scorecard pending review', body: 'Dana Whitfield has a scorecard awaiting submission for Ava Bennett.', createdAt: daysAgo(1), read: false, link: '/interviews/ai' },
  { id: 'notif-2', userId: 'user-nw-owner', title: 'Integrity flag raised', body: 'A flag was raised on a Senior Backend Engineer attempt and needs review.', createdAt: daysAgo(3), read: false, link: '/integrity' },
  { id: 'notif-3', userId: 'user-nw-owner', title: 'Webhook delivery failed', body: 'One delivery to hooks.northwind.com failed after 3 attempts.', createdAt: daysAgo(5), read: true, link: '/integrations' },
];

export const MODULE_CATALOG: ModuleCatalogEntry[] = [
  { module: 'skills', name: 'Skills & Role Management', description: 'Hierarchical skills taxonomy, role profiles, and gap analysis.', category: 'platform', pricingModel: 'flat' },
  { module: 'question-bank', name: 'Question Bank', description: 'Shared and private question libraries across every supported type.', category: 'hiring', pricingModel: 'flat' },
  { module: 'assessment-builder', name: 'Assessment Builder', description: 'Guided assessment creation, publishing, and candidate routing.', category: 'hiring', pricingModel: 'per-usage' },
  { module: 'candidates', name: 'Candidate Management', description: 'Candidate directory, invitations, and pipeline tracking.', category: 'hiring', pricingModel: 'per-seat' },
  { module: 'ai-interviews', name: 'AI Interviews', description: 'Adaptive, AI-conducted technical interviews.', category: 'interviewing', pricingModel: 'per-usage' },
  { module: 'live-interviews', name: 'Live Technical Interviews', description: 'Collaborative live interviews with structured scorecards.', category: 'interviewing', pricingModel: 'per-usage' },
  { module: 'ai-fluency', name: 'AI Fluency Evaluation', description: 'IDE-activity based evaluation of AI-assisted development skill.', category: 'interviewing', pricingModel: 'per-usage' },
  { module: 'agentic-environment', name: 'Agentic Development Environment', description: 'Evaluate candidates directing an AI coding agent in a real repo.', category: 'interviewing', pricingModel: 'per-usage' },
  { module: 'integrity', name: 'Integrity & Proctoring', description: 'Proctoring signals, plagiarism and AI-code detection, human review.', category: 'hiring', pricingModel: 'per-usage' },
  { module: 'reporting', name: 'Hiring Analytics', description: 'Funnel, fairness, and skill-performance reporting.', category: 'platform', pricingModel: 'flat' },
  { module: 'integrations', name: 'ATS/HRIS Integrations', description: 'Named integrations with Greenhouse, Lever, Workday, and more.', category: 'platform', pricingModel: 'flat' },
  { module: 'api-management', name: 'API & Webhooks', description: 'Full-capability API, embeddable widget, and webhook delivery.', category: 'platform', pricingModel: 'per-usage' },
  { module: 'internal-learning', name: 'Internal Skill Assessment', description: 'Employee skill profiles, gap analysis, and learning paths.', category: 'developer-ecosystem', pricingModel: 'per-seat' },
  { module: 'practice', name: 'Coding Practice', description: 'Public practice catalogue with unlimited retries.', category: 'developer-ecosystem', pricingModel: 'flat' },
  { module: 'competitions', name: 'Competitions & Hackathons', description: 'Time-boxed competitions with live leaderboards.', category: 'developer-ecosystem', pricingModel: 'per-usage' },
  { module: 'certifications', name: 'Certifications', description: 'Proctored certification tests with verifiable credentials.', category: 'developer-ecosystem', pricingModel: 'per-usage' },
  { module: 'job-matching', name: 'Job Matching', description: 'Opt-in discoverable candidate profiles for open roles.', category: 'developer-ecosystem', pricingModel: 'flat' },
  { module: 'billing', name: 'Billing & Usage', description: 'Subscription, usage, and cost-of-goods visibility.', category: 'platform', pricingModel: 'flat' },
];
