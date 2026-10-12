import type { DifficultyLevel } from './question';

export type AiUsePolicy = 'guarded' | 'unguarded';

export type AssessmentStatus = 'draft' | 'in-review' | 'published' | 'archived';

export interface AssessmentSection {
  id: string;
  title: string;
  timeLimitMinutes: number;
  questionPoolIds: string[];
  questionsToDraw: number;
  difficulty: DifficultyLevel | 'mixed';
  aiUsePolicy: AiUsePolicy;
}

export interface AssessmentVariant {
  id: string;
  label: string;
  sectionOverrides: Partial<Record<string, string[]>>;
}

export interface CandidateRoutingRule {
  id: string;
  basedOn: 'role-seniority' | 'prior-screening' | 'manual';
  condition: string;
  routeToVariantId: string;
}

export interface AssessmentAccommodation {
  extraTimePercent: number;
  cameraFree: boolean;
  notes?: string;
}

export interface Assessment {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  roleId: string | null;
  skillIds: string[];
  status: AssessmentStatus;
  version: number;
  creationMethod: 'scratch' | 'template' | 'duplicate' | 'ai-assisted';
  sections: AssessmentSection[];
  variants: AssessmentVariant[];
  routingRules: CandidateRoutingRule[];
  defaultAiUsePolicy: AiUsePolicy;
  passThresholdPercent: number;
  maxAttempts: number;
  accommodation: AssessmentAccommodation;
  integritySettings: {
    secureMode: boolean;
    identityCheck: boolean;
    screenshotMonitoring: boolean;
    sensitivityThreshold: 'low' | 'medium' | 'high';
  };
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
  totalDurationMinutes: number;
}

export type InvitationStatus = 'invited' | 'opened' | 'in-progress' | 'completed' | 'expired';

export interface CandidateInvitation {
  id: string;
  tenantId: string;
  assessmentId: string;
  candidateId: string;
  variantId: string | null;
  status: InvitationStatus;
  invitedAt: string;
  expiresAt: string;
  accessLinkToken: string;
}

export type AttemptStatus =
  | 'not-started'
  | 'in-progress'
  | 'submitted'
  | 'completed'
  | 'interrupted'
  | 'failed-technical';

export interface AttemptAnswer {
  questionId: string;
  autoScorePercent: number | null;
  manualScorePercent: number | null;
  timeSpentSeconds: number;
  flaggedForReview: boolean;
}

export interface AttemptResult {
  id: string;
  tenantId: string;
  assessmentId: string;
  candidateId: string;
  invitationId: string;
  status: AttemptStatus;
  startedAt: string | null;
  submittedAt: string | null;
  overallScorePercent: number | null;
  passed: boolean | null;
  manualOverride: { scorePercent: number; reason: string; reviewerId: string } | null;
  answers: AttemptAnswer[];
  integritySummary: {
    signalCount: number;
    sensitivityThreshold: 'low' | 'medium' | 'high';
    requiresHumanReview: boolean;
  } | null;
}
