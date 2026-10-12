export type IntegritySignalType =
  | 'tab-switch'
  | 'focus-loss'
  | 'fullscreen-exit'
  | 'multiple-displays'
  | 'vm-indicator'
  | 'no-face-detected'
  | 'multiple-faces-detected'
  | 'clipboard-paste'
  | 'code-similarity'
  | 'ai-generated-code-signature'
  | 'secure-mode-violation';

export interface IntegrityEvent {
  id: string;
  attemptResultId: string;
  type: IntegritySignalType;
  occurredAt: string;
  detail: string;
  scopedToGuardedContext: boolean;
}

export type IntegrityFlagDecision = 'pending' | 'cleared' | 'confirmed-violation';

export interface IntegrityFlag {
  id: string;
  attemptResultId: string;
  candidateId: string;
  contributingSignalIds: string[];
  sensitivityThreshold: 'low' | 'medium' | 'high';
  decision: IntegrityFlagDecision;
  reviewerId: string | null;
  reviewerNotes: string | null;
  candidateExplanation: string | null;
  createdAt: string;
  resolvedAt: string | null;
}
