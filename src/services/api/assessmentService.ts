import type { Assessment, AssessmentStatus, CandidateInvitation } from '@/types';
import { daysFromNow } from '@/utils/random';
import { db } from '../mocks/db';
import { simulateLatency } from './shared';

export interface AssessmentDraftInput {
  title: string;
  description: string;
  roleId: string | null;
  skillIds: string[];
  sections: Assessment['sections'];
  defaultAiUsePolicy: Assessment['defaultAiUsePolicy'];
  passThresholdPercent: number;
  maxAttempts: number;
  accommodation: Assessment['accommodation'];
  integritySettings: Assessment['integritySettings'];
  creationMethod: Assessment['creationMethod'];
}

export const assessmentService = {
  async list(tenantId: string, status?: AssessmentStatus): Promise<Assessment[]> {
    await simulateLatency();
    return db.assessments.filter((a) => a.tenantId === tenantId && (!status || a.status === status));
  },

  async getById(id: string): Promise<Assessment | null> {
    await simulateLatency(150);
    return db.assessments.find((a) => a.id === id) ?? null;
  },

  async createDraft(tenantId: string, createdBy: string, input: AssessmentDraftInput): Promise<Assessment> {
    await simulateLatency();
    const assessment: Assessment = {
      id: db.nextId('asmt'),
      tenantId,
      title: input.title,
      description: input.description,
      roleId: input.roleId,
      skillIds: input.skillIds,
      status: 'draft',
      version: 1,
      creationMethod: input.creationMethod,
      sections: input.sections,
      variants: [],
      routingRules: [],
      defaultAiUsePolicy: input.defaultAiUsePolicy,
      passThresholdPercent: input.passThresholdPercent,
      maxAttempts: input.maxAttempts,
      accommodation: input.accommodation,
      integritySettings: input.integritySettings,
      createdBy,
      createdAt: new Date().toISOString(),
      totalDurationMinutes: input.sections.reduce((sum, s) => sum + s.timeLimitMinutes, 0),
    };
    db.assessments.unshift(assessment);
    db.appendAuditLog({
      tenantId,
      actorId: createdBy,
      actorName: 'Current user',
      action: `Created assessment draft: ${assessment.title}`,
      targetType: 'Assessment',
      targetId: assessment.id,
    });
    return assessment;
  },

  async updateDraft(id: string, patch: Partial<AssessmentDraftInput>): Promise<Assessment> {
    await simulateLatency();
    const assessment = db.assessments.find((a) => a.id === id);
    if (!assessment) throw new Error(`Unknown assessment: ${id}`);
    if (assessment.status === 'published') {
      throw new Error('Published assessments are locked. Edits create a new version.');
    }
    Object.assign(assessment, patch);
    if (patch.sections) {
      assessment.totalDurationMinutes = patch.sections.reduce((sum, s) => sum + s.timeLimitMinutes, 0);
    }
    return assessment;
  },

  async submitForReview(id: string): Promise<Assessment> {
    await simulateLatency();
    const assessment = db.assessments.find((a) => a.id === id);
    if (!assessment) throw new Error(`Unknown assessment: ${id}`);
    assessment.status = 'in-review';
    return assessment;
  },

  async publish(id: string): Promise<Assessment> {
    await simulateLatency();
    const assessment = db.assessments.find((a) => a.id === id);
    if (!assessment) throw new Error(`Unknown assessment: ${id}`);
    assessment.status = 'published';
    assessment.publishedAt = new Date().toISOString();
    assessment.version += 1;
    db.appendAuditLog({
      tenantId: assessment.tenantId,
      actorId: 'current-user',
      actorName: 'Current user',
      action: `Published assessment: ${assessment.title} (v${assessment.version})`,
      targetType: 'Assessment',
      targetId: assessment.id,
    });
    return assessment;
  },

  async archive(id: string): Promise<Assessment> {
    await simulateLatency();
    const assessment = db.assessments.find((a) => a.id === id);
    if (!assessment) throw new Error(`Unknown assessment: ${id}`);
    assessment.status = 'archived';
    return assessment;
  },

  async inviteCandidates(
    assessmentId: string,
    candidateIds: string[],
    variantId: string | null = null,
  ): Promise<CandidateInvitation[]> {
    await simulateLatency(350);
    const assessment = db.assessments.find((a) => a.id === assessmentId);
    if (!assessment) throw new Error(`Unknown assessment: ${assessmentId}`);
    const created: CandidateInvitation[] = candidateIds.map((candidateId) => ({
      id: db.nextId('inv'),
      tenantId: assessment.tenantId,
      assessmentId,
      candidateId,
      variantId,
      status: 'invited',
      invitedAt: new Date().toISOString(),
      expiresAt: daysFromNow(14),
      accessLinkToken: db.nextId('tok'),
    }));
    db.invitations.unshift(...created);
    db.appendAuditLog({
      tenantId: assessment.tenantId,
      actorId: 'current-user',
      actorName: 'Current user',
      action: `Invited ${created.length} candidate(s) to ${assessment.title}`,
      targetType: 'Assessment',
      targetId: assessmentId,
    });
    return created;
  },

  async listInvitations(assessmentId: string): Promise<CandidateInvitation[]> {
    await simulateLatency();
    return db.invitations.filter((i) => i.assessmentId === assessmentId);
  },

  async getInvitationById(id: string): Promise<CandidateInvitation | null> {
    await simulateLatency(150);
    return db.invitations.find((i) => i.id === id) ?? null;
  },
};
