import type { JobRole, Skill, SkillGapEntry } from '@/types';
import { createSeededRandom } from '@/utils/random';
import { db } from '../mocks/db';
import { simulateLatency } from './shared';

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return hash;
}

export const skillsService = {
  async listSkills(tenantId: string | null): Promise<Skill[]> {
    await simulateLatency();
    return db.skills.filter((s) => !s.isTenantPrivate || s.tenantId === tenantId);
  },

  async listRoles(tenantId: string | null): Promise<JobRole[]> {
    await simulateLatency();
    return db.jobRoles.filter((r) => !r.isTenantPrivate || r.tenantId === tenantId);
  },

  async getRole(roleId: string): Promise<JobRole | null> {
    await simulateLatency(120);
    return db.jobRoles.find((r) => r.id === roleId) ?? null;
  },

  async createPrivateSkill(tenantId: string, input: { name: string; domain: string; description?: string }): Promise<Skill> {
    await simulateLatency();
    const skill: Skill = {
      id: db.nextId('skl'),
      name: input.name,
      domain: input.domain,
      description: input.description,
      isEmergingAI: false,
      isTenantPrivate: true,
      tenantId,
    };
    db.skills.push(skill);
    db.appendAuditLog({ tenantId, actorId: 'current-user', actorName: 'Current user', action: `Created private skill: ${skill.name}`, targetType: 'Skill', targetId: skill.id });
    return skill;
  },

  /** Compares a tenant's candidate pool (by skillIds on recent attempts) against a role's target profile. */
  async getSkillGapForRole(tenantId: string, roleId: string): Promise<SkillGapEntry[]> {
    await simulateLatency();
    const role = db.jobRoles.find((r) => r.id === roleId);
    if (!role) return [];
    return role.skillProfile.map((req): SkillGapEntry => {
      const random = createSeededRandom(hashSeed(`${tenantId}:${roleId}:${req.skillId}`));
      const coverage = 40 + Math.round(random() * 55);
      const gapSeverity: SkillGapEntry['gapSeverity'] = coverage > 80 ? 'none' : coverage > 65 ? 'low' : coverage > 45 ? 'medium' : 'high';
      return {
        skillId: req.skillId,
        targetProficiency: req.targetProficiency,
        currentAverageProficiency: coverage > 50 ? req.targetProficiency : 'intermediate',
        coveragePercent: coverage,
        gapSeverity,
      };
    });
  },
};
