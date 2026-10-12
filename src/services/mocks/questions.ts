import type { DifficultyLevel, Question, QuestionBase, QuestionStatus } from '@/types';
import { daysAgo } from '@/utils/random';

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${String(counter).padStart(4, '0')}`;
}

function base(partial: {
  title: string;
  skillIds: string[];
  roleIds?: string[];
  difficulty: DifficultyLevel;
  tags: string[];
  status?: QuestionStatus;
  authorId: string;
  authorName: string;
  summary: string;
  tenantId?: string | null;
  visibility?: QuestionBase['visibility'];
  usageCount?: number;
}): QuestionBase {
  const status = partial.status ?? 'published';
  return {
    id: nextId('q'),
    tenantId: partial.tenantId ?? null,
    title: partial.title,
    skillIds: partial.skillIds,
    roleIds: partial.roleIds ?? [],
    difficulty: partial.difficulty,
    tags: partial.tags,
    status,
    authorId: partial.authorId,
    authorName: partial.authorName,
    version: 1,
    isLatestVersion: true,
    createdAt: daysAgo(200),
    updatedAt: daysAgo(40),
    publishedAt: status === 'published' ? daysAgo(180) : undefined,
    visibility: partial.visibility ?? 'platform-shared',
    summary: partial.summary,
    usageCount: partial.usageCount ?? 0,
    leakReviewStatus: 'clear',
  };
}

const author = { authorId: 'user-nw-author', authorName: 'Riya Kapoor' };
const platformAuthor = { authorId: 'user-platform-admin', authorName: 'Kombee Content Team' };

export const QUESTIONS: Question[] = [
  // Multiple choice
  {
    ...base({
      title: 'Event loop execution order',
      skillIds: ['skl-js'],
      difficulty: 'medium',
      tags: ['async', 'event-loop'],
      summary: 'Tests understanding of microtask vs macrotask ordering in the JS event loop.',
      usageCount: 412,
      ...platformAuthor,
    }),
    type: 'multiple-choice',
    prompt: 'Given the following snippet, what is the exact console output order?',
    options: [
      { id: 'o1', text: '1, 2, 3, 4', isCorrect: false },
      { id: 'o2', text: '1, 4, 2, 3', isCorrect: true },
      { id: 'o3', text: '4, 1, 2, 3', isCorrect: false },
      { id: 'o4', text: '1, 3, 2, 4', isCorrect: false },
    ],
    allowMultipleAnswers: false,
  },
  {
    ...base({
      title: 'SOLID principles identification',
      skillIds: ['skl-system-design'],
      difficulty: 'easy',
      tags: ['design-principles'],
      summary: 'Identifies which SOLID principle a refactor example demonstrates.',
      usageCount: 801,
      ...platformAuthor,
    }),
    type: 'multiple-choice',
    prompt: 'Which SOLID principle does extracting the notification logic into a strategy interface satisfy?',
    options: [
      { id: 'o1', text: 'Single Responsibility', isCorrect: false },
      { id: 'o2', text: 'Open/Closed', isCorrect: true },
      { id: 'o3', text: 'Liskov Substitution', isCorrect: false },
      { id: 'o4', text: 'Dependency Inversion', isCorrect: false },
    ],
    allowMultipleAnswers: false,
  },
  {
    ...base({
      title: 'RAG pipeline failure modes',
      skillIds: ['skl-rag'],
      difficulty: 'medium',
      tags: ['rag', 'generative-ai'],
      summary: 'Checks awareness of common retrieval-augmented generation failure modes.',
      usageCount: 56,
      ...platformAuthor,
    }),
    type: 'multiple-choice',
    prompt: 'Select every option that is a known RAG failure mode.',
    options: [
      { id: 'o1', text: 'Chunking that splits semantically related content', isCorrect: true },
      { id: 'o2', text: 'Stale embeddings after a source document changes', isCorrect: true },
      { id: 'o3', text: 'Vector dimensionality always being too low', isCorrect: false },
      { id: 'o4', text: 'Retrieval returning irrelevant but high-similarity chunks', isCorrect: true },
    ],
    allowMultipleAnswers: true,
  },

  // Coding (general + domain variants)
  {
    ...base({
      title: 'Merge overlapping intervals',
      skillIds: ['skl-js', 'skl-ts'],
      roleIds: ['role-frontend-eng-ii'],
      difficulty: 'medium',
      tags: ['arrays', 'sorting'],
      summary: 'Classic interval-merging problem with input/output grading.',
      usageCount: 1204,
      ...platformAuthor,
    }),
    type: 'coding',
    codingDomain: 'general',
    prompt: 'Given a list of intervals, merge all overlapping intervals and return the result sorted by start.',
    starterCode: { typescript: 'function mergeIntervals(intervals: number[][]): number[][] {\n  // TODO\n}\n' },
    languages: ['typescript', 'python', 'java', 'go'],
    testCases: [
      { id: 't1', input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
      { id: 't2', input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isHidden: true },
    ],
    referenceSolution: 'function mergeIntervals(intervals) { /* sorted sweep */ }',
    referenceSolutionVerified: true,
  },
  {
    ...base({
      title: 'Rate limiter: token bucket',
      skillIds: ['skl-go', 'skl-system-design'],
      roleIds: ['role-backend-eng-senior'],
      difficulty: 'hard',
      tags: ['concurrency', 'system-design'],
      summary: 'Implements a thread-safe token-bucket rate limiter.',
      usageCount: 318,
      ...platformAuthor,
    }),
    type: 'coding',
    codingDomain: 'backend',
    prompt: 'Implement a concurrency-safe token bucket rate limiter with configurable refill rate.',
    starterCode: { go: 'type RateLimiter struct {\n  // TODO\n}\n' },
    languages: ['go', 'java'],
    testCases: [
      { id: 't1', input: 'capacity=5, refill=1/s, 7 requests in 1s', expectedOutput: '5 allowed, 2 denied', isHidden: false },
    ],
    referenceSolution: 'type RateLimiter struct { /* mutex-guarded bucket */ }',
    referenceSolutionVerified: true,
  },
  {
    ...base({
      title: 'Battery-aware background sync',
      skillIds: ['skl-ios'],
      roleIds: ['role-mobile-eng'],
      difficulty: 'medium',
      tags: ['mobile', 'background-tasks'],
      summary: 'Schedules a background sync task respecting iOS battery and network constraints.',
      usageCount: 94,
      ...author,
      tenantId: null,
    }),
    type: 'coding',
    codingDomain: 'mobile',
    prompt: 'Using BGTaskScheduler, implement a background sync that defers when battery is below 20%.',
    starterCode: { swift: 'func scheduleSync() {\n  // TODO\n}\n' },
    languages: ['swift'],
    testCases: [{ id: 't1', input: 'battery=15%', expectedOutput: 'sync deferred', isHidden: false }],
    referenceSolution: 'func scheduleSync() { /* BGTaskScheduler config */ }',
    referenceSolutionVerified: true,
  },
  {
    ...base({
      title: 'Churn prediction feature pipeline',
      skillIds: ['skl-python', 'skl-pandas', 'skl-ml'],
      roleIds: ['role-data-scientist'],
      difficulty: 'hard',
      tags: ['data-science', 'feature-engineering'],
      summary: 'Builds a leakage-free feature pipeline for a churn classifier.',
      usageCount: 142,
      ...platformAuthor,
    }),
    type: 'coding',
    codingDomain: 'data-science',
    prompt: 'Given raw event logs, build a feature pipeline for churn prediction without label leakage.',
    starterCode: { python: 'def build_features(events_df):\n    # TODO\n    pass\n' },
    languages: ['python'],
    testCases: [{ id: 't1', input: 'sample_events.csv', expectedOutput: 'features.csv matches schema', isHidden: true }],
    referenceSolution: 'def build_features(events_df): ...',
    referenceSolutionVerified: true,
  },
  {
    ...base({
      title: 'Flaky test triage',
      skillIds: ['skl-qa-auto'],
      roleIds: ['role-qa-eng'],
      difficulty: 'medium',
      tags: ['testing', 'ci'],
      summary: 'Diagnoses and fixes a flaky end-to-end test caused by a race condition.',
      usageCount: 67,
      ...author,
    }),
    type: 'coding',
    codingDomain: 'qa',
    prompt: 'This Playwright test fails intermittently. Identify the race condition and fix it.',
    starterCode: { typescript: "test('checkout flow', async ({ page }) => { /* flaky */ });" },
    languages: ['typescript'],
    testCases: [{ id: 't1', input: '50 repeated runs', expectedOutput: '0 failures', isHidden: false }],
    referenceSolution: "test('checkout flow', async ({ page }) => { await page.waitForSelector(...) });",
    referenceSolutionVerified: true,
  },
  {
    ...base({
      title: 'Zero-downtime deployment pipeline',
      skillIds: ['skl-k8s', 'skl-cicd'],
      roleIds: ['role-devops-eng'],
      difficulty: 'hard',
      tags: ['devops', 'kubernetes'],
      summary: 'Writes a rolling-update Kubernetes manifest with proper readiness gating.',
      usageCount: 201,
      ...platformAuthor,
    }),
    type: 'coding',
    codingDomain: 'devops',
    prompt: 'Configure a Deployment manifest for zero-downtime rolling updates with a readiness probe.',
    starterCode: { yaml: 'apiVersion: apps/v1\nkind: Deployment\n# TODO' },
    languages: ['yaml'],
    testCases: [{ id: 't1', input: 'rollout under load', expectedOutput: '0 dropped requests', isHidden: true }],
    referenceSolution: 'apiVersion: apps/v1\nkind: Deployment\nspec:\n  strategy:\n    type: RollingUpdate',
    referenceSolutionVerified: true,
  },
  {
    ...base({
      title: 'Code review: N+1 query',
      skillIds: ['skl-code-review', 'skl-sql'],
      difficulty: 'medium',
      tags: ['code-review', 'performance'],
      summary: 'Reviews a pull request and identifies an N+1 query performance regression.',
      usageCount: 88,
      ...platformAuthor,
    }),
    type: 'coding',
    codingDomain: 'code-review',
    prompt: 'Review this diff and leave comments identifying any performance or correctness issues.',
    starterCode: { typescript: '// diff provided in the review panel' },
    languages: ['typescript'],
    testCases: [],
    referenceSolution: 'Flag N+1 query in getOrdersForUsers(); recommend a single JOIN query.',
    referenceSolutionVerified: true,
  },

  // HTML/CSS/JS
  {
    ...base({
      title: 'Responsive pricing cards',
      skillIds: ['skl-css', 'skl-accessibility'],
      roleIds: ['role-frontend-eng-ii'],
      difficulty: 'easy',
      tags: ['css', 'responsive'],
      summary: 'Builds an accessible, responsive 3-column pricing layout from a static mock.',
      usageCount: 523,
      ...platformAuthor,
    }),
    type: 'html-css-js',
    prompt: 'Recreate the provided pricing card design. It must remain usable down to 320px width and pass contrast checks.',
    starterHtml: '<section class="pricing"></section>',
    starterCss: '.pricing { /* TODO */ }',
    starterJs: '',
    visualAssertions: ['contrast-ratio >= 4.5:1', 'no horizontal scroll at 320px'],
  },
  {
    ...base({
      title: 'Accessible modal dialog',
      skillIds: ['skl-js', 'skl-accessibility'],
      difficulty: 'medium',
      tags: ['a11y', 'dom'],
      summary: 'Implements a modal with focus trapping and correct ARIA roles.',
      usageCount: 276,
      ...platformAuthor,
    }),
    type: 'html-css-js',
    prompt: 'Make the provided modal keyboard-accessible: focus trap, Escape to close, and return focus on close.',
    starterHtml: '<div id="modal-root"></div>',
    starterCss: '',
    starterJs: 'function openModal() {\n  // TODO\n}\n',
    visualAssertions: ['focus trapped inside dialog', 'role="dialog" present'],
  },

  // SQL
  {
    ...base({
      title: 'Top customers by revenue',
      skillIds: ['skl-sql'],
      difficulty: 'medium',
      tags: ['sql', 'aggregation'],
      summary: 'Writes a query ranking customers by trailing 90-day revenue with ties handled.',
      usageCount: 654,
      ...platformAuthor,
    }),
    type: 'sql',
    prompt: 'Write a query returning the top 10 customers by revenue in the last 90 days, ties broken by customer_id.',
    schemaScript: 'CREATE TABLE orders (id INT, customer_id INT, amount NUMERIC, created_at DATE);',
    seedDataScript: "INSERT INTO orders VALUES (1, 100, 250.00, '2026-08-01');",
    referenceQuery:
      'SELECT customer_id, SUM(amount) AS revenue FROM orders WHERE created_at >= CURRENT_DATE - 90 GROUP BY customer_id ORDER BY revenue DESC, customer_id LIMIT 10;',
    referenceSolutionVerified: true,
  },
  {
    ...base({
      title: 'Detect duplicate shipping addresses',
      skillIds: ['skl-sql'],
      difficulty: 'hard',
      tags: ['sql', 'window-functions'],
      summary: 'Uses window functions to flag duplicate normalized shipping addresses.',
      usageCount: 121,
      ...author,
    }),
    type: 'sql',
    prompt: 'Flag every order whose normalized shipping address matches another order from a different customer.',
    schemaScript: 'CREATE TABLE shipments (order_id INT, customer_id INT, address_normalized TEXT);',
    seedDataScript: "INSERT INTO shipments VALUES (1, 10, '221B BAKER ST');",
    referenceQuery:
      'SELECT * FROM shipments s WHERE EXISTS (SELECT 1 FROM shipments s2 WHERE s2.address_normalized = s.address_normalized AND s2.customer_id <> s.customer_id);',
    referenceSolutionVerified: true,
  },

  // Approximate solution
  {
    ...base({
      title: 'Estimate server capacity',
      skillIds: ['skl-system-design'],
      difficulty: 'medium',
      tags: ['estimation', 'capacity-planning'],
      summary: 'Partial-credit numeric estimation of required server count under given QPS and latency budgets.',
      usageCount: 203,
      ...platformAuthor,
    }),
    type: 'approximate-solution',
    prompt: 'Given 50,000 QPS peak, 8ms average handling time, and 70% target utilization, estimate the server count needed.',
    acceptableAnswerRange: { min: 570, max: 630 },
    partialCreditRules: 'Full credit within ±5% of 600; half credit within ±15%; method shown earns partial credit regardless.',
  },

  // Repository
  {
    ...base({
      title: 'Fix pagination bug in orders-service',
      skillIds: ['skl-node', 'skl-sql'],
      roleIds: ['role-backend-eng-senior'],
      difficulty: 'hard',
      tags: ['repository', 'bug-fix'],
      summary: 'Multi-file repository bug fix: off-by-one error in cursor-based pagination.',
      usageCount: 39,
      ...platformAuthor,
      visibility: 'platform-shared',
    }),
    type: 'repository',
    prompt: 'The /orders endpoint skips the first record of every page after the first. Find and fix the root cause.',
    repositoryUrl: 'https://github.com/kombee-content/orders-service-task',
    taskKind: 'bug-fix',
    buildCommand: 'npm run build',
    testCommand: 'npm test',
    buildVerified: true,
  },
  {
    ...base({
      title: 'Add rate limiting middleware',
      skillIds: ['skl-node', 'skl-system-design'],
      difficulty: 'medium',
      tags: ['repository', 'feature'],
      summary: 'Multi-file repository feature task: add configurable rate-limiting middleware to an Express API.',
      usageCount: 22,
      ...author,
    }),
    type: 'repository',
    prompt: 'Add a configurable, per-route rate-limiting middleware to the provided Express application.',
    repositoryUrl: 'https://github.com/kombee-content/express-api-task',
    taskKind: 'feature-implementation',
    buildCommand: 'npm run build',
    testCommand: 'npm test',
    buildVerified: true,
  },

  // Prompt engineering
  {
    ...base({
      title: 'Prompt a support-ticket classifier',
      skillIds: ['skl-prompt-eng'],
      difficulty: 'medium',
      tags: ['prompt-engineering'],
      summary: 'Designs a prompt that reliably classifies support tickets into 5 categories with few-shot examples.',
      usageCount: 71,
      ...platformAuthor,
    }),
    type: 'prompt-engineering',
    prompt: 'Design a system + few-shot prompt that classifies support tickets into exactly 5 categories, including edge cases.',
    targetOutcome: '>= 92% accuracy on the held-out ticket set, with calibrated "uncertain" fallback.',
    ragContextDocuments: ['category-definitions.md', 'historical-tickets-sample.csv'],
    rubric: 'Score: category coverage, few-shot example quality, handling of ambiguous tickets, structured output format.',
  },
  {
    ...base({
      title: 'Design a RAG grounding strategy',
      skillIds: ['skl-rag'],
      difficulty: 'hard',
      tags: ['rag', 'prompt-engineering'],
      summary: 'Designs retrieval + prompt strategy to minimize hallucination on a legal-document Q&A system.',
      usageCount: 29,
      ...platformAuthor,
    }),
    type: 'prompt-engineering',
    prompt: 'Design the chunking, retrieval, and prompt strategy for a legal-document Q&A assistant that must never fabricate a citation.',
    targetOutcome: 'Zero fabricated citations across the 40-question eval set.',
    ragContextDocuments: ['sample-contracts/'],
    rubric: 'Score: chunking strategy soundness, citation grounding, refusal behavior when context is insufficient.',
  },

  // Whiteboard
  {
    ...base({
      title: 'Design a URL shortener',
      skillIds: ['skl-system-design'],
      roleIds: ['role-backend-eng-senior'],
      difficulty: 'hard',
      tags: ['system-design', 'whiteboard'],
      summary: 'Free-form system design diagram for a URL shortener at 10K writes/sec.',
      usageCount: 445,
      ...platformAuthor,
    }),
    type: 'whiteboard',
    prompt: 'Design a URL shortener handling 10,000 writes/sec and 200,000 reads/sec. Diagram components and data flow.',
    rubric: 'Score: ID generation strategy, caching layer, database choice and sharding, handling of hot keys.',
  },

  // Sentence completion
  {
    ...base({
      title: 'HTTP status code recall',
      skillIds: ['skl-node'],
      difficulty: 'easy',
      tags: ['fundamentals'],
      summary: 'Fill-in-the-blank recall of HTTP status code semantics.',
      usageCount: 390,
      ...platformAuthor,
    }),
    type: 'sentence-completion',
    promptTemplate: 'A ___1___ response means the request succeeded but there is no content to return, while ___2___ means the resource moved permanently.',
    blanks: [
      { id: 'b1', acceptableAnswers: ['204', '204 No Content'] },
      { id: 'b2', acceptableAnswers: ['301', '301 Moved Permanently'] },
    ],
  },

  // File upload
  {
    ...base({
      title: 'Architecture decision record',
      skillIds: ['skl-system-design'],
      difficulty: 'medium',
      tags: ['writing', 'architecture'],
      summary: 'Candidate uploads an ADR document proposing a migration strategy.',
      usageCount: 18,
      ...author,
    }),
    type: 'file-upload',
    prompt: 'Upload an Architecture Decision Record proposing how you would migrate the monolith to services incrementally.',
    acceptedFormats: ['.pdf', '.md', '.docx'],
    maxFileSizeMb: 10,
  },

  // Subjective
  {
    ...base({
      title: 'Explain a production incident you resolved',
      skillIds: ['skl-system-design'],
      difficulty: 'medium',
      tags: ['behavioral', 'writing'],
      summary: 'Open-ended written response evaluated against a rubric by a human reviewer.',
      usageCount: 512,
      ...platformAuthor,
    }),
    type: 'subjective',
    prompt: 'Describe a production incident you diagnosed and resolved. What was the root cause and what changed afterward?',
    rubric: 'Score: clarity of root-cause reasoning, ownership, concrete follow-up actions taken.',
    wordLimit: 400,
  },
  {
    ...base({
      title: 'Critique a flawed caching strategy',
      skillIds: ['skl-system-design'],
      difficulty: 'medium',
      tags: ['behavioral'],
      status: 'in-review',
      summary: 'Candidate critiques a described caching approach and proposes an alternative.',
      usageCount: 4,
      ...author,
    }),
    type: 'subjective',
    prompt: 'The team caches every API response for 24 hours regardless of endpoint. Critique this approach and propose improvements.',
    rubric: 'Score: identification of staleness/invalidation issues, per-endpoint reasoning, concrete alternative.',
    wordLimit: 350,
  },

  // A couple of drafts / flagged for the content library states
  {
    ...base({
      title: 'Kubernetes operator reconciliation loop',
      skillIds: ['skl-k8s'],
      difficulty: 'expert',
      tags: ['kubernetes', 'operators'],
      status: 'draft',
      summary: 'Draft coding question on writing a correct reconciliation loop for a custom operator.',
      usageCount: 0,
      ...author,
    }),
    type: 'coding',
    codingDomain: 'devops',
    prompt: 'Implement the Reconcile() function for a custom CRD controller, handling drift and deletion.',
    starterCode: { go: 'func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {\n  // TODO\n}' },
    languages: ['go'],
    testCases: [],
    referenceSolution: '',
    referenceSolutionVerified: false,
  },
  {
    ...base({
      title: 'Binary search variants',
      skillIds: ['skl-js'],
      difficulty: 'easy',
      tags: ['arrays', 'search'],
      status: 'flagged',
      summary: 'Flagged for a suspected public leak found during the scheduled web scan.',
      usageCount: 2301,
      ...platformAuthor,
    }),
    type: 'coding',
    codingDomain: 'general',
    prompt: 'Implement binary search and its leftmost/rightmost insertion-point variants.',
    starterCode: { typescript: 'function binarySearch(arr: number[], target: number): number {\n  // TODO\n}' },
    languages: ['typescript', 'python'],
    testCases: [{ id: 't1', input: '[1,2,2,2,5], 2', expectedOutput: '1', isHidden: false }],
    referenceSolution: 'function binarySearch(arr, target) { /* ... */ }',
    referenceSolutionVerified: true,
  },
];

export const QUESTION_WEB_LEAK_FLAGS = [
  {
    id: 'leak-0001',
    questionId: QUESTIONS.find((q) => q.status === 'flagged')?.id ?? '',
    source: 'codeshare-forum.example.com/t/892341',
    confidence: 'high' as const,
    detectedAt: daysAgo(6),
    reviewStatus: 'pending-review' as const,
  },
];
