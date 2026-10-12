/** Deterministic PRNG (mulberry32) so mock data is stable across reloads and test runs. */
export function createSeededRandom(seed: number) {
  let a = seed;
  return function random(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(items: readonly T[], random: () => number): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) {
    throw new Error('pick() called on an empty array');
  }
  return item;
}

export function pickMany<T>(items: readonly T[], count: number, random: () => number): T[] {
  const pool = [...items];
  const result: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = Math.floor(random() * pool.length);
    result.push(...pool.splice(index, 1));
  }
  return result;
}

export function randomInt(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function daysAgo(n: number, from = new Date('2026-10-10T09:00:00Z')): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function daysFromNow(n: number, from = new Date('2026-10-10T09:00:00Z')): string {
  const d = new Date(from);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
