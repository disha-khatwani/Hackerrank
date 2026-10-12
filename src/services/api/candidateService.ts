import type { AttemptResult, Candidate, CandidateInvitation, ResultShareLink } from '@/types';
import { daysFromNow } from '@/utils/random';
import { db } from '../mocks/db';
import { type PageResult, paginate, simulateLatency } from './shared';

export interface CandidateFilters {
  search?: string;
  tags?: string[];
  appliedRole?: string;
}

export const candidateService = {
  async list(
    tenantId: string,
    filters: CandidateFilters = {},
    page = { page: 1, pageSize: 10 },
  ): Promise<PageResult<Candidate>> {
    await simulateLatency();
    let results = db.candidates.filter((c) => c.tenantId === tenantId);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      results = results.filter((c) => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term));
    }
    if (filters.appliedRole) results = results.filter((c) => c.appliedRole === filters.appliedRole);
    if (filters.tags?.length) results = results.filter((c) => c.tags.some((t) => filters.tags?.includes(t)));
    return paginate(results, page);
  },

  async getById(id: string): Promise<Candidate | null> {
    await simulateLatency(120);
    return db.candidates.find((c) => c.id === id) ?? null;
  },

  async getInvitationsForCandidate(candidateId: string): Promise<CandidateInvitation[]> {
    await simulateLatency(120);
    return db.invitations.filter((i) => i.candidateId === candidateId);
  },

  async getAttemptsForCandidate(candidateId: string): Promise<AttemptResult[]> {
    await simulateLatency(120);
    return db.attemptResults.filter((a) => a.candidateId === candidateId);
  },

  async getAttemptResult(attemptId: string): Promise<AttemptResult | null> {
    await simulateLatency(150);
    return db.attemptResults.find((a) => a.id === attemptId) ?? null;
  },

  async overrideScore(attemptId: string, scorePercent: number, reason: string, reviewerId: string): Promise<AttemptResult> {
    await simulateLatency();
    const attempt = db.attemptResults.find((a) => a.id === attemptId);
    if (!attempt) throw new Error(`Unknown attempt: ${attemptId}`);
    attempt.manualOverride = { scorePercent, reason, reviewerId };
    attempt.passed = scorePercent >= 70;
    db.appendAuditLog({
      tenantId: attempt.tenantId,
      actorId: reviewerId,
      actorName: 'Current user',
      action: `Manually overrode score to ${scorePercent}% (${reason})`,
      targetType: 'AttemptResult',
      targetId: attempt.id,
    });
    return attempt;
  },

  async createShareLink(attemptResultId: string, createdBy: string): Promise<ResultShareLink> {
    await simulateLatency();
    const link: ResultShareLink = {
      id: db.nextId('share'),
      attemptResultId,
      token: db.nextId('tok'),
      createdBy,
      createdAt: new Date().toISOString(),
      expiresAt: daysFromNow(7),
      revoked: false,
    };
    return link;
  },

  async bulkImport(tenantId: string, rows: Array<{ name: string; email: string; appliedRole?: string }>): Promise<Candidate[]> {
    await simulateLatency(400);
    const created: Candidate[] = rows.map((row) => ({
      id: db.nextId('cand'),
      tenantId,
      name: row.name,
      email: row.email,
      appliedRole: row.appliedRole ?? null,
      source: 'bulk-import',
      createdAt: new Date().toISOString(),
      tags: [],
      discoverableProfileOptIn: false,
    }));
    db.candidates.unshift(...created);
    db.appendAuditLog({
      tenantId,
      actorId: 'current-user',
      actorName: 'Current user',
      action: `Bulk-imported ${created.length} candidate(s)`,
      targetType: 'Candidate',
      targetId: 'bulk',
    });
    return created;
  },
};
