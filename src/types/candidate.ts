export interface Candidate {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  appliedRole: string | null;
  source: 'direct-invite' | 'ats-sync' | 'bulk-import' | 'job-matching';
  createdAt: string;
  tags: string[];
  avatarUrl?: string;
  rank?: number;
  discoverableProfileOptIn: boolean;
}

export interface CandidateComparisonEntry {
  candidateId: string;
  overallScorePercent: number | null;
  skillScores: Array<{ skillId: string; scorePercent: number }>;
}

export interface ResultShareLink {
  id: string;
  attemptResultId: string;
  token: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
}
