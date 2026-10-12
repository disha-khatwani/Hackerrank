export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  id: string;
  name: string;
  domain: string;
  parentSkillId?: string;
  isEmergingAI: boolean;
  isTenantPrivate: boolean;
  tenantId?: string;
  description?: string;
}

export interface JobRole {
  id: string;
  title: string;
  category: string;
  isTenantPrivate: boolean;
  tenantId?: string;
  skillProfile: RoleSkillRequirement[];
}

export interface RoleSkillRequirement {
  skillId: string;
  targetProficiency: ProficiencyLevel;
  weight: number;
}

export interface SkillGapEntry {
  skillId: string;
  targetProficiency: ProficiencyLevel;
  currentAverageProficiency: ProficiencyLevel | null;
  coveragePercent: number;
  gapSeverity: 'none' | 'low' | 'medium' | 'high';
}
