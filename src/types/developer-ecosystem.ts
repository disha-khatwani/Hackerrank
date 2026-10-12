export interface PracticeProblem {
  id: string;
  title: string;
  skillIds: string[];
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  solvedCount: number;
}

export interface PracticeAttempt {
  id: string;
  userId: string;
  problemId: string;
  status: 'in-progress' | 'solved' | 'attempted';
  bestRuntimeMs: number | null;
  attemptsCount: number;
  lastAttemptAt: string;
}

export type CompetitionVisibility = 'public' | 'tenant-private';
export type CompetitionStatus = 'upcoming' | 'live' | 'ended';

export interface Competition {
  id: string;
  tenantId: string | null;
  title: string;
  visibility: CompetitionVisibility;
  status: CompetitionStatus;
  startsAt: string;
  endsAt: string;
  participantCount: number;
  problemIds: string[];
}

export interface LeaderboardEntry {
  competitionId: string;
  rank: number;
  participantName: string;
  score: number;
  lastSubmissionAt: string;
}

export interface Certification {
  id: string;
  title: string;
  skillIds: string[];
  passThresholdPercent: number;
}

export interface CertificationCredential {
  id: string;
  certificationId: string;
  candidateId: string;
  issuedAt: string;
  expiresAt: string | null;
  revoked: boolean;
  publicVerificationUrl: string;
}

export interface DeveloperProfile {
  userId: string;
  displayName: string;
  headline: string;
  verifiedAssessments: Array<{ assessmentTitle: string; scorePercent: number; completedAt: string }>;
  certifications: string[];
  badges: string[];
  publicPageEnabled: boolean;
}

export interface JobMatchDiscoverableProfile {
  candidateId: string;
  optedIn: boolean;
  visibleSkillIds: string[];
  visibleCertificationIds: string[];
  selfDescribedExperience: string;
  optedInAt: string | null;
}

export interface LearningPath {
  id: string;
  tenantId: string;
  title: string;
  targetSkillId: string;
  checkpoints: Array<{ id: string; title: string; kind: 'reading' | 'guided-problem' | 'quiz'; completed: boolean }>;
}
