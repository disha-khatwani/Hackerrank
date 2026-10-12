import { db } from '../mocks/db';
import { simulateLatency } from './shared';

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface CompletionMetrics {
  invited: number;
  opened: number;
  completed: number;
  passed: number;
  failed: number;
  completionRatePercent: number;
  passRatePercent: number;
}

export interface SkillPerformanceEntry {
  skillId: string;
  averageScorePercent: number;
  attemptCount: number;
}

export const reportingService = {
  async getCompletionMetrics(tenantId: string): Promise<CompletionMetrics> {
    await simulateLatency();
    const invitations = db.invitations.filter((i) => i.tenantId === tenantId);
    const attempts = db.attemptResults.filter((a) => a.tenantId === tenantId);
    const completed = attempts.filter((a) => a.status === 'completed');
    const passed = completed.filter((a) => a.passed);
    const opened = invitations.filter((i) => i.status !== 'invited');
    return {
      invited: invitations.length,
      opened: opened.length,
      completed: completed.length,
      passed: passed.length,
      failed: completed.length - passed.length,
      completionRatePercent: invitations.length ? Math.round((completed.length / invitations.length) * 100) : 0,
      passRatePercent: completed.length ? Math.round((passed.length / completed.length) * 100) : 0,
    };
  },

  async getFunnel(tenantId: string): Promise<FunnelStage[]> {
    await simulateLatency();
    const invitations = db.invitations.filter((i) => i.tenantId === tenantId);
    const stageCounts: Record<string, number> = { invited: 0, opened: 0, 'in-progress': 0, completed: 0, expired: 0 };
    for (const inv of invitations) stageCounts[inv.status] = (stageCounts[inv.status] ?? 0) + 1;
    return [
      { stage: 'Invited', count: invitations.length },
      { stage: 'Opened', count: invitations.filter((i) => i.status !== 'invited').length },
      { stage: 'In progress', count: stageCounts['in-progress'] ?? 0 },
      { stage: 'Completed', count: stageCounts['completed'] ?? 0 },
    ];
  },

  async getSkillPerformance(tenantId: string): Promise<SkillPerformanceEntry[]> {
    await simulateLatency();
    const assessments = db.assessments.filter((a) => a.tenantId === tenantId);
    const bySkill = new Map<string, { total: number; count: number }>();
    for (const assessment of assessments) {
      const attempts = db.attemptResults.filter((a) => a.assessmentId === assessment.id && a.overallScorePercent !== null);
      for (const skillId of assessment.skillIds) {
        const entry = bySkill.get(skillId) ?? { total: 0, count: 0 };
        for (const attempt of attempts) {
          entry.total += attempt.overallScorePercent ?? 0;
          entry.count += 1;
        }
        bySkill.set(skillId, entry);
      }
    }
    return Array.from(bySkill.entries())
      .filter(([, v]) => v.count > 0)
      .map(([skillId, v]) => ({ skillId, averageScorePercent: Math.round(v.total / v.count), attemptCount: v.count }));
  },

  async getCandidateComparison(candidateIds: string[]) {
    await simulateLatency();
    return candidateIds.map((candidateId) => {
      const attempts = db.attemptResults.filter((a) => a.candidateId === candidateId && a.overallScorePercent !== null);
      const overall = attempts.length
        ? Math.round(attempts.reduce((sum, a) => sum + (a.overallScorePercent ?? 0), 0) / attempts.length)
        : null;
      return { candidateId, overallScorePercent: overall, attemptCount: attempts.length };
    });
  },

  async getUsageAndCost(tenantId: string) {
    await simulateLatency();
    const records = db.usageRecords.filter((r) => r.tenantId === tenantId);
    const byModule = new Map<string, { quantity: number; cost: number }>();
    for (const record of records) {
      const entry = byModule.get(record.module) ?? { quantity: 0, cost: 0 };
      entry.quantity += record.quantity;
      entry.cost += record.costOfGoodsUsd;
      byModule.set(record.module, entry);
    }
    return Array.from(byModule.entries()).map(([module, v]) => ({ module, ...v }));
  },
};
