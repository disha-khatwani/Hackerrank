export type InterviewKind = 'ai-interview' | 'live-interview';

export type InterviewSessionStatus =
  | 'scheduled'
  | 'on-demand-ready'
  | 'in-progress'
  | 'interrupted'
  | 'completed'
  | 'cancelled';

export interface InterviewTemplate {
  id: string;
  tenantId: string;
  title: string;
  roleId: string | null;
  kind: InterviewKind;
  durationMinutes: number;
  guidelines: string;
  rubricCriteria: Array<{ id: string; label: string; weight: number }>;
}

export interface InterviewSession {
  id: string;
  tenantId: string;
  templateId: string;
  kind: InterviewKind;
  candidateId: string;
  interviewerIds: string[];
  status: InterviewSessionStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  recordingConsent: boolean;
  recordingUrl?: string;
}

export interface TranscriptEntry {
  id: string;
  sessionId: string;
  timestamp: string;
  speaker: 'ai' | 'candidate' | 'interviewer';
  text: string;
}

export interface Scorecard {
  id: string;
  sessionId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending-review' | 'submitted';
  criteriaScores: Array<{ criteriaId: string; score: number; notes: string }>;
  overallRecommendation: 'strong-hire' | 'hire' | 'no-hire' | 'strong-no-hire' | null;
  aiAssistedSummary: string | null;
  submittedAt: string | null;
}

export type AiFluencyEventType =
  | 'prompt-sent'
  | 'suggestion-received'
  | 'suggestion-run'
  | 'suggestion-accepted'
  | 'suggestion-modified'
  | 'suggestion-rejected'
  | 'candidate-correction';

export interface AiFluencyEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  type: AiFluencyEventType;
  detail: string;
}

export interface AiFluencyReview {
  sessionId: string;
  events: AiFluencyEvent[];
  finalCode: string;
  aiGeneratedSummary: string | null;
  rubricScore: {
    planningScore: number;
    promptQualityScore: number;
    verificationScore: number;
    correctionScore: number;
    reviewerId: string | null;
    status: 'pending-review' | 'submitted';
  };
}

export type AgentActivityStepType = 'plan-proposed' | 'instruction-given' | 'change-made' | 'candidate-correction';

export interface AgentActivityStep {
  id: string;
  timestamp: string;
  type: AgentActivityStepType;
  description: string;
  diffSummary?: string;
}

export interface AgenticSession {
  sessionId: string;
  repositoryName: string;
  taskDescription: string;
  files: Array<{ path: string; content: string }>;
  activityTimeline: AgentActivityStep[];
  buildStatus: 'not-run' | 'running' | 'passed' | 'failed';
  testStatus: 'not-run' | 'running' | 'passed' | 'failed';
  finalDiffSummary: string;
}
