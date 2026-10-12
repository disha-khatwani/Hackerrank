import type { AttemptResult, Candidate, CandidateInvitation } from '@/types';
import { createSeededRandom, daysAgo, daysFromNow, pick, randomInt } from '@/utils/random';
import { ASSESSMENTS } from './assessments';

const FIRST_NAMES = [
  'Ava', 'Noah', 'Mia', 'Liam', 'Zoe', 'Ethan', 'Isla', 'Kabir', 'Sofia', 'Arjun',
  'Lena', 'Omar', 'Priya', 'Mateo', 'Nina', 'Caleb', 'Yuki', 'Ravi', 'Grace', 'Diego',
  'Amara', 'Felix', 'Ines', 'Tobias', 'Nadia', 'Leo', 'Saanvi', 'Marcus',
];
const LAST_NAMES = [
  'Bennett', 'Okafor', 'Rossi', 'Kapoor', 'Nilsson', 'Garcia', 'Chen', 'Dubois',
  'Mehta', 'Larsen', 'Silva', 'Novak', 'Haddad', 'Fischer', 'Takahashi', 'Osei',
];

const random = createSeededRandom(42);

function makeCandidate(index: number, tenantId: string, role: string): Candidate {
  const first = pick(FIRST_NAMES, random);
  const last = pick(LAST_NAMES, random);
  return {
    id: `cand-${tenantId.slice(7)}-${String(index).padStart(3, '0')}`,
    tenantId,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    appliedRole: role,
    source: pick(['direct-invite', 'ats-sync', 'bulk-import', 'job-matching'] as const, random),
    createdAt: daysAgo(randomInt(1, 150, random)),
    tags: random() > 0.7 ? ['referral'] : [],
    discoverableProfileOptIn: random() > 0.6,
  };
}

const ROLE_BY_ASSESSMENT: Record<string, string> = {
  'asmt-frontend-ii': 'Frontend Engineer II',
  'asmt-backend-senior': 'Senior Backend Engineer — Go',
  'asmt-ai-engineer': 'AI Engineer',
  'asmt-data-scientist': 'Data Scientist',
  'asmt-qa-automation': 'QA Automation Engineer',
};

export const CANDIDATES: Candidate[] = [];
export const INVITATIONS: CandidateInvitation[] = [];
export const ATTEMPT_RESULTS: AttemptResult[] = [];

let candidateCounter = 0;
const INVITABLE_ASSESSMENTS = ASSESSMENTS.filter((a) => a.status === 'published' || a.status === 'archived');

for (const assessment of INVITABLE_ASSESSMENTS) {
  const candidateCount = randomInt(4, 7, random);
  for (let i = 0; i < candidateCount; i++) {
    candidateCounter += 1;
    const candidate = makeCandidate(candidateCounter, assessment.tenantId, ROLE_BY_ASSESSMENT[assessment.id] ?? 'Candidate');
    CANDIDATES.push(candidate);

    const invitedAt = daysAgo(randomInt(2, 60, random));
    const statusRoll = random();
    const status: CandidateInvitation['status'] =
      statusRoll > 0.85 ? 'expired' : statusRoll > 0.6 ? 'completed' : statusRoll > 0.35 ? 'in-progress' : statusRoll > 0.15 ? 'opened' : 'invited';

    const invitation: CandidateInvitation = {
      id: `inv-${candidate.id}`,
      tenantId: assessment.tenantId,
      assessmentId: assessment.id,
      candidateId: candidate.id,
      variantId: assessment.variants[0]?.id ?? null,
      status,
      invitedAt,
      expiresAt: daysFromNow(14, new Date(invitedAt)),
      accessLinkToken: `tok_${candidate.id}`,
    };
    INVITATIONS.push(invitation);

    if (status === 'completed' || status === 'in-progress') {
      const passed = random() > 0.35;
      const score = status === 'completed' ? randomInt(passed ? assessment.passThresholdPercent : 20, passed ? 98 : assessment.passThresholdPercent - 1, random) : null;
      const attemptStatus: AttemptResult['status'] = status === 'completed' ? 'completed' : 'in-progress';
      ATTEMPT_RESULTS.push({
        id: `att-${candidate.id}`,
        tenantId: assessment.tenantId,
        assessmentId: assessment.id,
        candidateId: candidate.id,
        invitationId: invitation.id,
        status: attemptStatus,
        startedAt: daysAgo(randomInt(1, 10, random)),
        submittedAt: status === 'completed' ? daysAgo(randomInt(0, 9, random)) : null,
        overallScorePercent: score,
        passed: status === 'completed' ? passed : null,
        manualOverride: null,
        answers: assessment.sections.map((section, idx) => ({
          questionId: section.questionPoolIds[0] ?? `unknown-${idx}`,
          autoScorePercent: score,
          manualScorePercent: null,
          timeSpentSeconds: randomInt(120, section.timeLimitMinutes * 60, random),
          flaggedForReview: random() > 0.9,
        })),
        integritySummary:
          random() > 0.8
            ? { signalCount: randomInt(1, 3, random), sensitivityThreshold: assessment.integritySettings.sensitivityThreshold, requiresHumanReview: true }
            : null,
      });
    }
  }
}
