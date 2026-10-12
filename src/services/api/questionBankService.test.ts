import { describe, expect, it } from 'vitest';
import { questionBankService } from './questionBankService';

describe('questionBankService', () => {
  it('filters by natural-language search across title and tags (FR-CONT-02)', async () => {
    const result = await questionBankService.list({ search: 'recursion', tenantId: null });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((q) => `${q.title} ${q.summary} ${q.tags.join(' ')}`.toLowerCase().includes('recursion'))).toBe(
      true,
    );
  });

  it('filters by question type', async () => {
    const result = await questionBankService.list({ type: 'sql', tenantId: null }, undefined, { page: 1, pageSize: 50 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((q) => q.type === 'sql')).toBe(true);
  });

  it('excludes tenant-private questions from a different tenant', async () => {
    const result = await questionBankService.list({ tenantId: 'tenant-orbital' }, undefined, { page: 1, pageSize: 100 });
    expect(result.items.some((q) => q.tenantId === 'tenant-northwind' && q.visibility === 'tenant-private')).toBe(false);
  });

  it('publishing a question sets status to published and stamps publishedAt', async () => {
    const draft = await questionBankService.create({
      tenantId: 'tenant-northwind',
      title: 'New draft question',
      skillIds: ['skl-js'],
      roleIds: [],
      difficulty: 'easy',
      tags: [],
      status: 'draft',
      authorId: 'user-1',
      authorName: 'Test Author',
      visibility: 'tenant-private',
      summary: 'A new draft',
      type: 'subjective',
      prompt: 'Describe something',
      rubric: 'Clarity',
    });
    expect(draft.status).toBe('draft');

    const published = await questionBankService.publish(draft.id);
    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeDefined();
  });
});
