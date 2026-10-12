import {
  Award,
  BarChart3,
  Bot,
  Brain,
  Building2,
  Code2,
  FileText,
  Gauge,
  GitBranch,
  Globe,
  KeyRound,
  LayoutDashboard,
  type LucideProps,
  Plug,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Swords,
  Trophy,
  UserSearch,
  Users,
  Video,
  Wallet,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { ModuleKey, Permission } from '@/types';

export interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<LucideProps>;
  module?: ModuleKey;
  permission?: Permission;
  platformOnly?: boolean;
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/app', icon: LayoutDashboard }],
  },
  {
    label: 'Hiring',
    items: [
      { label: 'Skills & Roles', path: '/skills', icon: Brain, module: 'skills', permission: 'skills.manage' },
      {
        label: 'Question Bank',
        path: '/content',
        icon: FileText,
        module: 'question-bank',
        permission: 'content.author',
      },
      {
        label: 'Assessments',
        path: '/assessments',
        icon: ScrollText,
        module: 'assessment-builder',
        permission: 'assessments.build',
      },
      {
        label: 'Candidates',
        path: '/candidates',
        icon: Users,
        module: 'candidates',
        permission: 'candidates.manage',
      },
    ],
  },
  {
    label: 'Interviews',
    items: [
      { label: 'AI Interviews', path: '/interviews/ai', icon: Bot, module: 'ai-interviews' },
      { label: 'Live Interviews', path: '/interviews/live', icon: Video, module: 'live-interviews' },
      { label: 'AI Fluency', path: '/ai-fluency', icon: Gauge, module: 'ai-fluency' },
      { label: 'Agentic Environment', path: '/agentic-environment', icon: GitBranch, module: 'agentic-environment' },
      {
        label: 'Integrity Review',
        path: '/integrity',
        icon: ShieldCheck,
        module: 'integrity',
        permission: 'integrity.review',
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Reports', path: '/reports', icon: BarChart3, module: 'reporting', permission: 'reports.view' },
    ],
  },
  {
    label: 'Developer Ecosystem',
    items: [
      { label: 'Internal Learning', path: '/internal-learning', icon: Award, module: 'internal-learning' },
      { label: 'Coding Practice', path: '/practice', icon: Code2, module: 'practice' },
      { label: 'Competitions', path: '/competitions', icon: Trophy, module: 'competitions' },
      { label: 'Certifications', path: '/certifications', icon: Swords, module: 'certifications' },
      { label: 'Job Matching', path: '/job-matching', icon: UserSearch, module: 'job-matching' },
    ],
  },
  {
    label: 'Platform',
    items: [
      {
        label: 'Integrations',
        path: '/integrations',
        icon: Plug,
        module: 'integrations',
        permission: 'integrations.manage',
      },
      { label: 'API Management', path: '/api-management', icon: KeyRound, module: 'api-management', permission: 'api.manage-keys' },
      { label: 'Billing & Usage', path: '/billing', icon: Wallet, module: 'billing', permission: 'billing.manage' },
      { label: 'Organization', path: '/settings/organization', icon: Building2, permission: 'org.manage-users' },
      { label: 'Platform Admin', path: '/platform', icon: Globe, platformOnly: true },
    ],
  },
  {
    label: '',
    items: [{ label: 'Settings', path: '/settings', icon: Settings }],
  },
];

export const GLOBAL_SEARCH_SHORTCUT = '/';
export const GlobalSearchIcon = Search;
