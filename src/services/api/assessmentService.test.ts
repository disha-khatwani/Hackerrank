import { describe, expect, it } from 'vitest';
import { assessmentService } from './assessmentService';

const BASE_INPUT = {
  title: 'Test Assessment',
  description: 'A test assessment',
  roleId: null,
  skillIds: ['skl-js'],
  sections: [
    {
      id: 'sec-1',
      title: 'Section 1',
      timeLimitMinutes: 30,
      questionPoolIds: ['q-0001'],
      questionsToDraw: 1,
      difficulty: 'mixed' as const,
      aiUsePolicy: 'guarded' as const,
    },
  ],
  defaultAiUsePolicy: 'guarded' as const,
  passThresholdPercent: 70,
  maxAttempts: 1,
  accommodation: { extraTimePercent: 0, cameraFree: true },
  integritySettings: { secureMode: true, identityCheck: true, screenshotMonitoring: false, sensitivityThreshold: 'medium' as const },
  creationMethod: 'scratch' as const,
};

describe('assessmentService', () => {
  it('creates a draft assessment that starts unpublished', async () => {
    const draft = await assessmentService.createDraft('tenant-northwind', 'user-1', BASE_INPUT);
    expect(draft.status).toBe('draft');
    expect(draft.version).toBe(1);
    expect(draft.totalDurationMinutes).toBe(30);
  });

  it('allows editing a draft but locks it after publish (BUILD-07)', async () => {
    const draft = await assessmentService.createDraft('tenant-northwind', 'user-1', BASE_INPUT);

    await expect(assessmentService.updateDraft(draft.id, { title: 'Renamed' })).resolves.toMatchObject({ title: 'Renamed' });

    const published = await assessmentService.publish(draft.id);
    expect(published.status).toBe('published');
    expect(published.version).toBe(2);

    await expect(assessmentService.updateDraft(draft.id, { title: 'Should fail' })).rejects.toThrow(/locked/i);
  });

  it('invites candidates and reflects them in listInvitations (cross-feature consistency)', async () => {
    const draft = await assessmentService.createDraft('tenant-northwind', 'user-1', BASE_INPUT);
    await assessmentService.publish(draft.id);

    const invitations = await assessmentService.inviteCandidates(draft.id, ['cand-northwind-001', 'cand-northwind-002']);
    expect(invitations).toHaveLength(2);
    expect(invitations.every((i) => i.status === 'invited')).toBe(true);

    const listed = await assessmentService.listInvitations(draft.id);
    expect(listed.map((i) => i.candidateId).sort()).toEqual(['cand-northwind-001', 'cand-northwind-002'].sort());
  });
});
