import type { IntegrityEvent, IntegrityFlag } from '@/types';
import { daysAgo } from '@/utils/random';
import { ATTEMPT_RESULTS } from './candidates';

const flaggedAttempt = ATTEMPT_RESULTS.find((a) => a.integritySummary);

export const INTEGRITY_EVENTS: IntegrityEvent[] = flaggedAttempt
  ? [
      {
        id: 'ie-001',
        attemptResultId: flaggedAttempt.id,
        type: 'tab-switch',
        occurredAt: daysAgo(3),
        detail: 'Candidate switched tabs for 12 seconds during section 2.',
        scopedToGuardedContext: true,
      },
      {
        id: 'ie-002',
        attemptResultId: flaggedAttempt.id,
        type: 'ai-generated-code-signature',
        occurredAt: daysAgo(3),
        detail: 'Submitted code shows strong structural similarity to common AI-assistant output patterns.',
        scopedToGuardedContext: true,
      },
    ]
  : [];

export const INTEGRITY_FLAGS: IntegrityFlag[] = flaggedAttempt
  ? [
      {
        id: 'flag-001',
        attemptResultId: flaggedAttempt.id,
        candidateId: flaggedAttempt.candidateId,
        contributingSignalIds: ['ie-001', 'ie-002'],
        sensitivityThreshold: 'medium',
        decision: 'pending',
        reviewerId: null,
        reviewerNotes: null,
        candidateExplanation: null,
        createdAt: daysAgo(3),
        resolvedAt: null,
      },
    ]
  : [];
