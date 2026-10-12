import type { AgenticSession, AiFluencyReview, InterviewSession, InterviewTemplate, Scorecard } from '@/types';
import { daysAgo, daysFromNow } from '@/utils/random';

export const INTERVIEW_TEMPLATES: InterviewTemplate[] = [
  {
    id: 'tmpl-ai-frontend',
    tenantId: 'tenant-northwind',
    title: 'Frontend Engineer — AI Interview',
    roleId: 'role-frontend-eng-ii',
    kind: 'ai-interview',
    durationMinutes: 40,
    guidelines: 'Focus on component composition, state management tradeoffs, and accessibility instincts.',
    rubricCriteria: [
      { id: 'r1', label: 'Problem decomposition', weight: 0.3 },
      { id: 'r2', label: 'Code quality', weight: 0.3 },
      { id: 'r3', label: 'Communication', weight: 0.2 },
      { id: 'r4', label: 'Accessibility awareness', weight: 0.2 },
    ],
  },
  {
    id: 'tmpl-live-backend',
    tenantId: 'tenant-northwind',
    title: 'Senior Backend Engineer — Live Interview',
    roleId: 'role-backend-eng-senior',
    kind: 'live-interview',
    durationMinutes: 60,
    guidelines: 'Pair on the distributed-cache design problem. Probe for consistency/availability tradeoffs.',
    rubricCriteria: [
      { id: 'r1', label: 'System design depth', weight: 0.4 },
      { id: 'r2', label: 'Tradeoff articulation', weight: 0.3 },
      { id: 'r3', label: 'Collaboration', weight: 0.3 },
    ],
  },
];

export const INTERVIEW_SESSIONS: InterviewSession[] = [
  {
    id: 'ivs-001',
    tenantId: 'tenant-northwind',
    templateId: 'tmpl-ai-frontend',
    kind: 'ai-interview',
    candidateId: 'cand-northwind-001',
    interviewerIds: [],
    status: 'completed',
    scheduledAt: null,
    startedAt: daysAgo(6),
    completedAt: daysAgo(6),
    recordingConsent: true,
    recordingUrl: 'mock://recordings/ivs-001',
  },
  {
    id: 'ivs-002',
    tenantId: 'tenant-northwind',
    templateId: 'tmpl-live-backend',
    kind: 'live-interview',
    candidateId: 'cand-northwind-008',
    interviewerIds: ['user-nw-interviewer'],
    status: 'scheduled',
    scheduledAt: daysFromNow(2),
    startedAt: null,
    completedAt: null,
    recordingConsent: false,
  },
  {
    id: 'ivs-003',
    tenantId: 'tenant-northwind',
    templateId: 'tmpl-ai-frontend',
    kind: 'ai-interview',
    candidateId: 'cand-northwind-003',
    interviewerIds: [],
    status: 'in-progress',
    scheduledAt: null,
    startedAt: daysAgo(0),
    completedAt: null,
    recordingConsent: true,
  },
];

export const SCORECARDS: Scorecard[] = [
  {
    id: 'sc-001',
    sessionId: 'ivs-001',
    reviewerId: 'user-nw-hm',
    reviewerName: 'Dana Whitfield',
    status: 'pending-review',
    criteriaScores: [
      { criteriaId: 'r1', score: 4, notes: 'Decomposed the problem into clear subcomponents quickly.' },
      { criteriaId: 'r2', score: 3, notes: 'Readable, but missed memoization opportunity.' },
      { criteriaId: 'r3', score: 4, notes: '' },
      { criteriaId: 'r4', score: 3, notes: 'Mentioned aria-live but did not implement it.' },
    ],
    overallRecommendation: null,
    aiAssistedSummary: 'Candidate structured the component cleanly and reasoned aloud about tradeoffs; accessibility was discussed but not fully implemented. (AI-generated, advisory only.)',
    submittedAt: null,
  },
];

export const AI_FLUENCY_REVIEWS: AiFluencyReview[] = [
  {
    sessionId: 'asmt-ai-engineer',
    events: [
      { id: 'ev1', sessionId: 'asmt-ai-engineer', timestamp: daysAgo(2), type: 'prompt-sent', detail: 'Asked the assistant to draft a retry wrapper for the API client.' },
      { id: 'ev2', sessionId: 'asmt-ai-engineer', timestamp: daysAgo(2), type: 'suggestion-received', detail: 'Assistant proposed an exponential backoff implementation.' },
      { id: 'ev3', sessionId: 'asmt-ai-engineer', timestamp: daysAgo(2), type: 'suggestion-run', detail: 'Candidate ran the suggestion against the existing test suite before accepting.' },
      { id: 'ev4', sessionId: 'asmt-ai-engineer', timestamp: daysAgo(2), type: 'suggestion-modified', detail: 'Candidate added jitter to avoid thundering-herd retries — a gap the suggestion missed.' },
      { id: 'ev5', sessionId: 'asmt-ai-engineer', timestamp: daysAgo(2), type: 'candidate-correction', detail: 'Candidate caught and fixed an off-by-one in the max-retry count the AI introduced.' },
    ],
    finalCode: 'export async function withRetry(fn, opts) { /* final, candidate-verified implementation */ }',
    aiGeneratedSummary: 'Candidate tested suggestions before accepting and proactively corrected an AI-introduced bug. (AI-generated, advisory only — not the score of record.)',
    rubricScore: {
      planningScore: 4,
      promptQualityScore: 4,
      verificationScore: 5,
      correctionScore: 5,
      reviewerId: null,
      status: 'pending-review',
    },
  },
];

export const AGENTIC_SESSIONS: AgenticSession[] = [
  {
    sessionId: 'agentic-001',
    repositoryName: 'inventory-service',
    taskDescription: 'Add idempotency keys to the POST /orders endpoint to prevent duplicate order creation on retry.',
    files: [
      { path: 'src/routes/orders.ts', content: 'router.post("/orders", async (req, res) => { /* seed */ });' },
      { path: 'src/db/schema.sql', content: 'CREATE TABLE orders (id UUID PRIMARY KEY, idempotency_key TEXT);' },
    ],
    activityTimeline: [
      { id: 'a1', timestamp: daysAgo(1), type: 'plan-proposed', description: 'Agent proposed adding a unique idempotency_key column and a lookup-before-insert check.' },
      { id: 'a2', timestamp: daysAgo(1), type: 'instruction-given', description: 'Candidate approved the plan but asked the agent to also handle concurrent duplicate requests.' },
      { id: 'a3', timestamp: daysAgo(1), type: 'change-made', description: 'Agent added a unique constraint and catch-and-return-existing-order logic.', diffSummary: '+18 -2 across 2 files' },
      { id: 'a4', timestamp: daysAgo(1), type: 'candidate-correction', description: 'Candidate corrected the agent\'s error handling, which was swallowing the unique-constraint violation instead of returning the original order.' },
    ],
    buildStatus: 'passed',
    testStatus: 'passed',
    finalDiffSummary: '+24 -3 across 2 files, 3 new tests added',
  },
];
