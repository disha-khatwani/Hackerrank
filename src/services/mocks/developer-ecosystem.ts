import type {
  Certification,
  Competition,
  DeveloperProfile,
  JobMatchDiscoverableProfile,
  LearningPath,
  PracticeProblem,
} from '@/types';
import { daysAgo, daysFromNow } from '@/utils/random';

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  { id: 'prac-1', title: 'Two Sum', skillIds: ['skl-js'], topic: 'Arrays', difficulty: 'easy', solvedCount: 48213 },
  { id: 'prac-2', title: 'Longest Substring Without Repeating Characters', skillIds: ['skl-js'], topic: 'Strings', difficulty: 'medium', solvedCount: 31022 },
  { id: 'prac-3', title: 'LRU Cache', skillIds: ['skl-system-design'], topic: 'Design', difficulty: 'hard', solvedCount: 12044 },
  { id: 'prac-4', title: 'Kth Largest Element in a Stream', skillIds: ['skl-python'], topic: 'Heaps', difficulty: 'medium', solvedCount: 9833 },
  { id: 'prac-5', title: 'Word Ladder', skillIds: ['skl-go'], topic: 'Graphs', difficulty: 'hard', solvedCount: 6120 },
  { id: 'prac-6', title: 'Valid Parentheses', skillIds: ['skl-js'], topic: 'Stacks', difficulty: 'easy', solvedCount: 58210 },
];

export const COMPETITIONS: Competition[] = [
  { id: 'comp-1', tenantId: null, title: 'Kombee Winter Code Sprint', visibility: 'public', status: 'upcoming', startsAt: daysFromNow(10), endsAt: daysFromNow(10), participantCount: 1240, problemIds: ['prac-1', 'prac-3'] },
  { id: 'comp-2', tenantId: 'tenant-northwind', title: 'Northwind Internal Hackathon', visibility: 'tenant-private', status: 'live', startsAt: daysAgo(0), endsAt: daysFromNow(1), participantCount: 38, problemIds: ['prac-2', 'prac-4'] },
  { id: 'comp-3', tenantId: null, title: 'Algorithms League — Round 4', visibility: 'public', status: 'ended', startsAt: daysAgo(20), endsAt: daysAgo(19), participantCount: 3021, problemIds: ['prac-5'] },
];

export const CERTIFICATIONS: Certification[] = [
  { id: 'cert-1', title: 'React Proficiency Certification', skillIds: ['skl-react'], passThresholdPercent: 75 },
  { id: 'cert-2', title: 'SQL Mastery Certification', skillIds: ['skl-sql'], passThresholdPercent: 80 },
  { id: 'cert-3', title: 'Kubernetes Operations Certification', skillIds: ['skl-k8s'], passThresholdPercent: 70 },
];

export const DEVELOPER_PROFILES: DeveloperProfile[] = [
  {
    userId: 'cand-northwind-001',
    displayName: 'Ava Bennett',
    headline: 'Frontend engineer focused on accessible design systems',
    verifiedAssessments: [{ assessmentTitle: 'Frontend Engineer II — Screening', scorePercent: 88, completedAt: daysAgo(5) }],
    certifications: ['cert-1'],
    badges: ['10-day practice streak', 'Competition finalist'],
    publicPageEnabled: true,
  },
];

export const JOB_MATCH_PROFILES: JobMatchDiscoverableProfile[] = [
  {
    candidateId: 'cand-northwind-001',
    optedIn: true,
    visibleSkillIds: ['skl-react', 'skl-js', 'skl-accessibility'],
    visibleCertificationIds: ['cert-1'],
    selfDescribedExperience: '4 years building accessible, component-driven web applications.',
    optedInAt: daysAgo(30),
  },
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'lp-1',
    tenantId: 'tenant-northwind',
    title: 'Close the Kubernetes Gap',
    targetSkillId: 'skl-k8s',
    checkpoints: [
      { id: 'cp1', title: 'Read: Kubernetes Core Concepts', kind: 'reading', completed: true },
      { id: 'cp2', title: 'Guided problem: write a Deployment manifest', kind: 'guided-problem', completed: true },
      { id: 'cp3', title: 'Checkpoint quiz: scheduling & networking', kind: 'quiz', completed: false },
    ],
  },
];
