/** Shared helpers for every mock service implementation. */

export type ServiceErrorCode = 'not-found' | 'forbidden' | 'validation' | 'conflict';

export class ServiceError extends Error {
  code: ServiceErrorCode;

  constructor(message: string, code: ServiceErrorCode = 'validation') {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

/** Simulates realistic network latency so loading states are visible and testable. */
export function simulateLatency(ms = 220 + Math.random() * 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function paginate<T>(items: T[], { page, pageSize }: PageRequest): PageResult<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}
