import type {
  AgenticSession,
  AiFluencyReview,
  InterviewKind,
  InterviewSession,
  InterviewTemplate,
  Scorecard,
} from '@/types';
import { db } from '../mocks/db';
import { simulateLatency } from './shared';

export const interviewService = {
  async listTemplates(tenantId: string, kind?: InterviewKind): Promise<InterviewTemplate[]> {
    await simulateLatency();
    return db.interviewTemplates.filter((t) => t.tenantId === tenantId && (!kind || t.kind === kind));
  },

  async listSessions(tenantId: string, kind?: InterviewKind): Promise<InterviewSession[]> {
    await simulateLatency();
    return db.interviewSessions.filter((s) => s.tenantId === tenantId && (!kind || s.kind === kind));
  },

  async getSession(id: string): Promise<InterviewSession | null> {
    await simulateLatency(150);
    return db.interviewSessions.find((s) => s.id === id) ?? null;
  },

  async getScorecard(sessionId: string): Promise<Scorecard | null> {
    await simulateLatency(150);
    return db.scorecards.find((s) => s.sessionId === sessionId) ?? null;
  },

  async submitScorecard(scorecardId: string, overallRecommendation: Scorecard['overallRecommendation']): Promise<Scorecard> {
    await simulateLatency();
    const card = db.scorecards.find((s) => s.id === scorecardId);
    if (!card) throw new Error(`Unknown scorecard: ${scorecardId}`);
    card.status = 'submitted';
    card.overallRecommendation = overallRecommendation;
    card.submittedAt = new Date().toISOString();
    return card;
  },

  async getAiFluencyReview(sessionId: string): Promise<AiFluencyReview | null> {
    await simulateLatency(150);
    return db.aiFluencyReviews.find((r) => r.sessionId === sessionId) ?? null;
  },

  async submitAiFluencyScore(sessionId: string, reviewerId: string, scores: AiFluencyReview['rubricScore']): Promise<AiFluencyReview> {
    await simulateLatency();
    const review = db.aiFluencyReviews.find((r) => r.sessionId === sessionId);
    if (!review) throw new Error(`Unknown AI Fluency review: ${sessionId}`);
    review.rubricScore = { ...scores, reviewerId, status: 'submitted' };
    return review;
  },

  async listAgenticSessions(): Promise<AgenticSession[]> {
    await simulateLatency();
    return db.agenticSessions;
  },

  async getAgenticSession(sessionId: string): Promise<AgenticSession | null> {
    await simulateLatency(150);
    return db.agenticSessions.find((s) => s.sessionId === sessionId) ?? null;
  },
};
