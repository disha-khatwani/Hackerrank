import type { DifficultyLevel, DistributiveOmit, Question, QuestionStatus, QuestionTypeId } from '@/types';
import { db } from '../mocks/db';
import { type PageResult, paginate, simulateLatency } from './shared';

export interface QuestionFilters {
  search?: string;
  skillIds?: string[];
  roleIds?: string[];
  difficulty?: DifficultyLevel;
  type?: QuestionTypeId;
  status?: QuestionStatus;
  authorId?: string;
  tenantId?: string | null;
}

export interface QuestionSort {
  field: 'title' | 'updatedAt' | 'usageCount' | 'difficulty';
  direction: 'asc' | 'desc';
}

function matchesSearch(question: Question, search: string): boolean {
  const haystack = `${question.title} ${question.summary} ${question.tags.join(' ')}`.toLowerCase();
  return search
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export const questionBankService = {
  async list(
    filters: QuestionFilters,
    sort: QuestionSort = { field: 'updatedAt', direction: 'desc' },
    page = { page: 1, pageSize: 10 },
  ): Promise<PageResult<Question>> {
    await simulateLatency();
    let results = db.questions.filter((q) => q.isLatestVersion);

    results = results.filter((q) => q.visibility === 'platform-shared' || q.tenantId === filters.tenantId);

    if (filters.search) results = results.filter((q) => matchesSearch(q, filters.search as string));
    if (filters.skillIds?.length) results = results.filter((q) => q.skillIds.some((s) => filters.skillIds?.includes(s)));
    if (filters.roleIds?.length) results = results.filter((q) => q.roleIds.some((r) => filters.roleIds?.includes(r)));
    if (filters.difficulty) results = results.filter((q) => q.difficulty === filters.difficulty);
    if (filters.type) results = results.filter((q) => q.type === filters.type);
    if (filters.status) results = results.filter((q) => q.status === filters.status);
    if (filters.authorId) results = results.filter((q) => q.authorId === filters.authorId);

    const sorted = [...results].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      if (sort.field === 'title') return a.title.localeCompare(b.title) * dir;
      if (sort.field === 'usageCount') return (a.usageCount - b.usageCount) * dir;
      if (sort.field === 'difficulty') {
        const order: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];
        return (order.indexOf(a.difficulty) - order.indexOf(b.difficulty)) * dir;
      }
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
    });

    return paginate(sorted, page);
  },

  async getById(id: string): Promise<Question | null> {
    await simulateLatency(150);
    return db.questions.find((q) => q.id === id) ?? null;
  },

  async getVersionHistory(id: string): Promise<Question[]> {
    await simulateLatency(150);
    const target = db.questions.find((q) => q.id === id);
    if (!target) return [];
    return db.questions.filter((q) => q.title === target.title && q.authorId === target.authorId);
  },

  async create(question: DistributiveOmit<Question, 'id' | 'version' | 'isLatestVersion' | 'createdAt' | 'updatedAt' | 'usageCount' | 'leakReviewStatus'>): Promise<Question> {
    await simulateLatency();
    const created = {
      ...question,
      id: db.nextId('q'),
      version: 1,
      isLatestVersion: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      leakReviewStatus: null,
    } as Question;
    db.questions.unshift(created);
    db.appendAuditLog({
      tenantId: created.tenantId ?? 'platform',
      actorId: 'current-user',
      actorName: 'Current user',
      action: `Authored question: ${created.title}`,
      targetType: 'Question',
      targetId: created.id,
    });
    return created;
  },

  async publish(id: string): Promise<Question> {
    await simulateLatency();
    const question = db.questions.find((q) => q.id === id);
    if (!question) throw new Error(`Unknown question: ${id}`);
    question.status = 'published';
    question.publishedAt = new Date().toISOString();
    db.appendAuditLog({
      tenantId: question.tenantId ?? 'platform',
      actorId: 'current-user',
      actorName: 'Current user',
      action: `Published question: ${question.title}`,
      targetType: 'Question',
      targetId: question.id,
    });
    return question;
  },

  async retire(id: string, reason: string): Promise<Question> {
    await simulateLatency();
    const question = db.questions.find((q) => q.id === id);
    if (!question) throw new Error(`Unknown question: ${id}`);
    question.status = 'retired';
    db.appendAuditLog({
      tenantId: question.tenantId ?? 'platform',
      actorId: 'current-user',
      actorName: 'Current user',
      action: `Retired question: ${question.title} (${reason})`,
      targetType: 'Question',
      targetId: question.id,
    });
    return question;
  },

  async updateStatus(id: string, status: QuestionStatus): Promise<Question> {
    await simulateLatency();
    const question = db.questions.find((q) => q.id === id);
    if (!question) throw new Error(`Unknown question: ${id}`);
    question.status = status;
    return question;
  },
};
