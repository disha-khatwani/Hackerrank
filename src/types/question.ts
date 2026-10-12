/**
 * Question types, per FRD §6 / FR-QT-01. Each type is a first-class
 * discriminant with its own authoring/grading shape — not a generic type
 * with optional fields.
 *
 * DOCUMENTED DECISION: the FRD's published type list names several
 * engineering-domain variants (mobile, data science, front-end, back-end,
 * full-stack, DevOps, cloud, QA, code review) alongside "coding" and
 * "code repository." Functionally these domain variants all use the same
 * authoring/answer mechanics as `coding` (an editor, a language/stack, and
 * test-case or build/run validation) — only the tech stack, starter
 * scaffold, and tagging differ. They are modeled as `codingDomain` on the
 * `coding` type rather than as nine near-duplicate top-level interfaces,
 * which would otherwise differ from `coding` only in that one field.
 * `html-css-js`, `sql`, `repository`, and `approximate-solution` keep their
 * own discriminants because their answer surface or grading model is
 * genuinely different (a rendered preview pane, a query result diff, a
 * multi-file repo checkout, partial-credit numeric/algorithmic grading).
 */
export type QuestionTypeId =
  | 'multiple-choice'
  | 'coding'
  | 'html-css-js'
  | 'sql'
  | 'approximate-solution'
  | 'repository'
  | 'prompt-engineering'
  | 'whiteboard'
  | 'sentence-completion'
  | 'file-upload'
  | 'subjective';

export type CodingDomain =
  | 'general'
  | 'mobile'
  | 'data-science'
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'devops'
  | 'cloud'
  | 'qa'
  | 'code-review';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export type QuestionStatus = 'draft' | 'in-review' | 'published' | 'flagged' | 'retired';

export interface QuestionBase {
  id: string;
  tenantId: string | null;
  title: string;
  skillIds: string[];
  roleIds: string[];
  difficulty: DifficultyLevel;
  tags: string[];
  status: QuestionStatus;
  authorId: string;
  authorName: string;
  version: number;
  isLatestVersion: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  visibility: 'platform-shared' | 'tenant-private' | 'team-private';
  summary: string;
  usageCount: number;
  leakReviewStatus: 'clear' | 'flagged' | 'confirmed-leak' | null;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple-choice';
  prompt: string;
  options: MultipleChoiceOption[];
  allowMultipleAnswers: boolean;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface CodingQuestion extends QuestionBase {
  type: 'coding';
  codingDomain: CodingDomain;
  prompt: string;
  starterCode: Partial<Record<string, string>>;
  languages: string[];
  testCases: TestCase[];
  referenceSolution: string;
  referenceSolutionVerified: boolean;
}

export interface HtmlCssJsQuestion extends QuestionBase {
  type: 'html-css-js';
  prompt: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  visualAssertions: string[];
}

export interface SqlQuestion extends QuestionBase {
  type: 'sql';
  prompt: string;
  schemaScript: string;
  seedDataScript: string;
  referenceQuery: string;
  referenceSolutionVerified: boolean;
}

export interface ApproximateSolutionQuestion extends QuestionBase {
  type: 'approximate-solution';
  prompt: string;
  acceptableAnswerRange: { min: number; max: number };
  partialCreditRules: string;
}

export interface RepositoryQuestion extends QuestionBase {
  type: 'repository';
  prompt: string;
  repositoryUrl: string;
  taskKind: 'bug-fix' | 'feature-implementation' | 'code-review';
  buildCommand: string;
  testCommand: string;
  buildVerified: boolean;
}

export interface PromptEngineeringQuestion extends QuestionBase {
  type: 'prompt-engineering';
  prompt: string;
  targetOutcome: string;
  ragContextDocuments: string[];
  rubric: string;
}

export interface WhiteboardQuestion extends QuestionBase {
  type: 'whiteboard';
  prompt: string;
  rubric: string;
}

export interface SentenceCompletionQuestion extends QuestionBase {
  type: 'sentence-completion';
  promptTemplate: string;
  blanks: Array<{ id: string; acceptableAnswers: string[] }>;
}

export interface FileUploadQuestion extends QuestionBase {
  type: 'file-upload';
  prompt: string;
  acceptedFormats: string[];
  maxFileSizeMb: number;
}

export interface SubjectiveQuestion extends QuestionBase {
  type: 'subjective';
  prompt: string;
  rubric: string;
  wordLimit?: number;
}

export type Question =
  | MultipleChoiceQuestion
  | CodingQuestion
  | HtmlCssJsQuestion
  | SqlQuestion
  | ApproximateSolutionQuestion
  | RepositoryQuestion
  | PromptEngineeringQuestion
  | WhiteboardQuestion
  | SentenceCompletionQuestion
  | FileUploadQuestion
  | SubjectiveQuestion;

/**
 * Built-in `Omit` does not distribute over unions (it collapses to the
 * union's common keys only), which silently drops every type-specific field
 * from the `Question` discriminated union. This variant distributes so
 * `DistributiveOmit<Question, 'id'>` keeps each member's own shape.
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K & keyof T> : never;

export const QUESTION_TYPE_LABELS: Record<QuestionTypeId, string> = {
  'multiple-choice': 'Multiple Choice',
  coding: 'Coding',
  'html-css-js': 'HTML / CSS / JavaScript',
  sql: 'Database / SQL',
  'approximate-solution': 'Approximate Solution',
  repository: 'Code Repository',
  'prompt-engineering': 'AI / Prompt Engineering',
  whiteboard: 'Whiteboard / Diagram',
  'sentence-completion': 'Sentence Completion',
  'file-upload': 'File Upload',
  subjective: 'Subjective / Essay',
};
