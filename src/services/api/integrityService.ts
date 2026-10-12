import type { IntegrityEvent, IntegrityFlag, IntegrityFlagDecision } from '@/types';
import { db } from '../mocks/db';
import { simulateLatency } from './shared';

export const integrityService = {
  async listFlags(tenantId: string, decision?: IntegrityFlagDecision): Promise<IntegrityFlag[]> {
    await simulateLatency();
    const attemptIds = new Set(db.attemptResults.filter((a) => a.tenantId === tenantId).map((a) => a.id));
    return db.integrityFlags.filter((f) => attemptIds.has(f.attemptResultId) && (!decision || f.decision === decision));
  },

  async getEventsForAttempt(attemptResultId: string): Promise<IntegrityEvent[]> {
    await simulateLatency(150);
    return db.integrityEvents.filter((e) => e.attemptResultId === attemptResultId);
  },

  async resolveFlag(
    flagId: string,
    decision: IntegrityFlagDecision,
    reviewerId: string,
    reviewerNotes: string,
  ): Promise<IntegrityFlag> {
    await simulateLatency();
    const flag = db.integrityFlags.find((f) => f.id === flagId);
    if (!flag) throw new Error(`Unknown integrity flag: ${flagId}`);
    flag.decision = decision;
    flag.reviewerId = reviewerId;
    flag.reviewerNotes = reviewerNotes;
    flag.resolvedAt = new Date().toISOString();
    db.appendAuditLog({
      tenantId: 'current-tenant',
      actorId: reviewerId,
      actorName: 'Current user',
      action: `Resolved integrity flag as "${decision}"`,
      targetType: 'IntegrityFlag',
      targetId: flag.id,
    });
    return flag;
  },
};
