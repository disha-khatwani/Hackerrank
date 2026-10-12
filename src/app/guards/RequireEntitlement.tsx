import type { ReactNode } from 'react';
import type { ModuleKey } from '@/types';
import { useEntitlement } from '@/hooks/useEntitlement';
import { ModuleUnavailablePage } from '../StatusPages';

const MODULE_LABELS: Record<ModuleKey, string> = {
  skills: 'Skills & Role Management',
  'question-bank': 'Question Bank',
  'assessment-builder': 'Assessment Builder',
  candidates: 'Candidate Management',
  'ai-interviews': 'AI Interviews',
  'live-interviews': 'Live Technical Interview',
  'ai-fluency': 'AI Fluency Evaluation',
  'agentic-environment': 'Agentic Development Environment',
  integrity: 'Integrity & Proctoring',
  reporting: 'Hiring Analytics',
  integrations: 'ATS/HRIS Integrations',
  'api-management': 'API & Integrations',
  'internal-learning': 'Internal Skill Assessment',
  practice: 'Coding Practice',
  competitions: 'Competitions & Hackathons',
  certifications: 'Certifications',
  'job-matching': 'Job Matching',
  billing: 'Billing & Usage',
};

export function RequireEntitlement({ module, children }: { module: ModuleKey; children: ReactNode }) {
  const enabled = useEntitlement(module);
  if (!enabled) return <ModuleUnavailablePage moduleName={MODULE_LABELS[module]} />;
  return <>{children}</>;
}
