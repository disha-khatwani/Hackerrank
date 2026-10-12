import { db } from '../mocks/db';
import { simulateLatency } from './shared';

export const developerEcosystemService = {
  async listPracticeProblems() {
    await simulateLatency();
    return db.practiceProblems;
  },

  async listCompetitions() {
    await simulateLatency();
    return db.competitions;
  },

  async listCertifications() {
    await simulateLatency();
    return db.certifications;
  },

  async getDeveloperProfile(userId: string) {
    await simulateLatency();
    return db.developerProfiles.find((p) => p.userId === userId) ?? null;
  },

  async getJobMatchProfile(candidateId: string) {
    await simulateLatency();
    return db.jobMatchProfiles.find((p) => p.candidateId === candidateId) ?? null;
  },

  async setJobMatchOptIn(candidateId: string, optedIn: boolean) {
    await simulateLatency();
    let profile = db.jobMatchProfiles.find((p) => p.candidateId === candidateId);
    if (!profile) {
      profile = {
        candidateId,
        optedIn,
        visibleSkillIds: [],
        visibleCertificationIds: [],
        selfDescribedExperience: '',
        optedInAt: optedIn ? new Date().toISOString() : null,
      };
      db.jobMatchProfiles.push(profile);
    } else {
      profile.optedIn = optedIn;
      profile.optedInAt = optedIn ? new Date().toISOString() : null;
    }
    return profile;
  },

  async listLearningPaths(tenantId: string) {
    await simulateLatency();
    return db.learningPaths.filter((lp) => lp.tenantId === tenantId);
  },
};

export const notificationService = {
  async list(userId: string) {
    await simulateLatency(100);
    return db.notifications.filter((n) => n.userId === userId);
  },

  async markRead(notificationId: string) {
    await simulateLatency(80);
    const notification = db.notifications.find((n) => n.id === notificationId);
    if (notification) notification.read = true;
    return notification ?? null;
  },
};
