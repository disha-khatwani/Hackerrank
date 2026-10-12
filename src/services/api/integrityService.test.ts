import { describe, expect, it } from 'vitest';
import { integrityService } from './integrityService';

describe('integrityService', () => {
  it('lists flags for a tenant, defaulting to pending human review (INT-12 absolute rule)', async () => {
    const flags = await integrityService.listFlags('tenant-northwind');
    expect(flags.length).toBeGreaterThan(0);
    expect(flags.every((f) => f.decision === 'pending' || f.resolvedAt !== null)).toBe(true);
  });

  it('only changes a flag decision through an explicit human reviewer action', async () => {
    const [flag] = await integrityService.listFlags('tenant-northwind', 'pending');
    expect(flag).toBeDefined();
    if (!flag) return;

    const resolved = await integrityService.resolveFlag(flag.id, 'cleared', 'reviewer-1', 'Reviewed recording, no violation found.');
    expect(resolved.decision).toBe('cleared');
    expect(resolved.reviewerId).toBe('reviewer-1');
    expect(resolved.resolvedAt).not.toBeNull();
  });

  it('returns the contributing signals for a flagged attempt', async () => {
    const flags = await integrityService.listFlags('tenant-northwind');
    const flag = flags[0];
    expect(flag).toBeDefined();
    if (!flag) return;

    const events = await integrityService.getEventsForAttempt(flag.attemptResultId);
    expect(events.length).toBeGreaterThan(0);
  });
});
