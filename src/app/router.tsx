import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SkeletonTable } from '@/components/feedback/Skeleton';
import { AppShell } from './layouts/AppShell';
import { CandidateLayout } from './layouts/CandidateLayout';
import { RequireAuth } from './guards/RequireAuth';
import { RequirePermission } from './guards/RequirePermission';
import { RequireEntitlement } from './guards/RequireEntitlement';
import { NotFoundPage } from './StatusPages';

function lazyPage(importer: () => Promise<{ [key: string]: React.ComponentType }>, exportName: string) {
  const Component = lazy(async () => {
    const mod = await importer();
    return { default: mod[exportName] as React.ComponentType };
  });
  return (
    <Suspense fallback={<div className="p-6"><SkeletonTable rows={8} /></div>}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/app" replace /> },
  { path: '/login', element: lazyPage(() => import('@/features/auth/LoginPage'), 'LoginPage') },

  {
    path: '/candidate-session/:invitationId',
    element: <CandidateLayout />,
    children: [
      { index: true, element: lazyPage(() => import('@/features/candidate-assessment/pages/CandidateAssessmentPage'), 'CandidateAssessmentPage') },
    ],
  },

  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { path: 'app', element: lazyPage(() => import('@/features/dashboard/pages/DashboardPage'), 'DashboardPage') },

      {
        path: 'skills',
        element: (
          <RequireEntitlement module="skills">
            <RequirePermission permission="skills.manage">{lazyPage(() => import('@/features/skills/pages/SkillsPage'), 'SkillsPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },

      {
        path: 'content',
        element: (
          <RequireEntitlement module="question-bank">
            <RequirePermission permission="content.author">{lazyPage(() => import('@/features/question-bank/pages/QuestionBankPage'), 'QuestionBankPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },

      {
        path: 'assessments',
        element: (
          <RequireEntitlement module="assessment-builder">
            <RequirePermission permission="assessments.build">{lazyPage(() => import('@/features/assessment-builder/pages/AssessmentsListPage'), 'AssessmentsListPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },
      {
        path: 'assessments/new',
        element: (
          <RequireEntitlement module="assessment-builder">
            <RequirePermission permission="assessments.build">{lazyPage(() => import('@/features/assessment-builder/pages/AssessmentBuilderPage'), 'AssessmentBuilderPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },
      {
        path: 'assessments/:id',
        element: (
          <RequireEntitlement module="assessment-builder">
            <RequirePermission permission="assessments.build">{lazyPage(() => import('@/features/assessment-builder/pages/AssessmentDetailPage'), 'AssessmentDetailPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },

      {
        path: 'candidates',
        element: (
          <RequireEntitlement module="candidates">
            <RequirePermission permission="candidates.manage">{lazyPage(() => import('@/features/candidates/pages/CandidatesListPage'), 'CandidatesListPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },
      {
        path: 'candidates/:id',
        element: (
          <RequireEntitlement module="candidates">
            <RequirePermission permission="candidates.manage">{lazyPage(() => import('@/features/candidates/pages/CandidateDetailPage'), 'CandidateDetailPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },

      {
        path: 'interviews/ai',
        element: <RequireEntitlement module="ai-interviews">{lazyPage(() => import('@/features/ai-interviews/pages/AiInterviewsListPage'), 'AiInterviewsListPage')}</RequireEntitlement>,
      },
      {
        path: 'interviews/ai/:id',
        element: <RequireEntitlement module="ai-interviews">{lazyPage(() => import('@/features/ai-interviews/pages/AiInterviewDetailPage'), 'AiInterviewDetailPage')}</RequireEntitlement>,
      },
      {
        path: 'interviews/live',
        element: <RequireEntitlement module="live-interviews">{lazyPage(() => import('@/features/live-interviews/pages/LiveInterviewsPage'), 'LiveInterviewsPage')}</RequireEntitlement>,
      },
      {
        path: 'ai-fluency',
        element: <RequireEntitlement module="ai-fluency">{lazyPage(() => import('@/features/ai-fluency/pages/AiFluencyPage'), 'AiFluencyPage')}</RequireEntitlement>,
      },
      {
        path: 'agentic-environment',
        element: <RequireEntitlement module="agentic-environment">{lazyPage(() => import('@/features/agentic-environment/pages/AgenticEnvironmentPage'), 'AgenticEnvironmentPage')}</RequireEntitlement>,
      },
      {
        path: 'integrity',
        element: (
          <RequireEntitlement module="integrity">
            <RequirePermission permission="integrity.review">{lazyPage(() => import('@/features/integrity/pages/IntegrityPage'), 'IntegrityPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },

      {
        path: 'reports',
        element: (
          <RequireEntitlement module="reporting">
            <RequirePermission permission="reports.view">{lazyPage(() => import('@/features/reporting/pages/ReportingPage'), 'ReportingPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },

      {
        path: 'integrations',
        element: (
          <RequireEntitlement module="integrations">
            <RequirePermission permission="integrations.manage">{lazyPage(() => import('@/features/integrations/pages/IntegrationsPage'), 'IntegrationsPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },
      {
        path: 'api-management',
        element: (
          <RequireEntitlement module="api-management">
            <RequirePermission permission="api.manage-keys">{lazyPage(() => import('@/features/api-management/pages/ApiManagementPage'), 'ApiManagementPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },
      {
        path: 'billing',
        element: (
          <RequireEntitlement module="billing">
            <RequirePermission permission="billing.manage">{lazyPage(() => import('@/features/billing/pages/BillingPage'), 'BillingPage')}</RequirePermission>
          </RequireEntitlement>
        ),
      },

      {
        path: 'internal-learning',
        element: <RequireEntitlement module="internal-learning">{lazyPage(() => import('@/features/internal-learning/pages/InternalLearningPage'), 'InternalLearningPage')}</RequireEntitlement>,
      },
      {
        path: 'practice',
        element: <RequireEntitlement module="practice">{lazyPage(() => import('@/features/practice/pages/PracticePage'), 'PracticePage')}</RequireEntitlement>,
      },
      {
        path: 'competitions',
        element: <RequireEntitlement module="competitions">{lazyPage(() => import('@/features/competitions/pages/CompetitionsPage'), 'CompetitionsPage')}</RequireEntitlement>,
      },
      {
        path: 'certifications',
        element: <RequireEntitlement module="certifications">{lazyPage(() => import('@/features/certifications/pages/CertificationsPage'), 'CertificationsPage')}</RequireEntitlement>,
      },
      {
        path: 'job-matching',
        element: <RequireEntitlement module="job-matching">{lazyPage(() => import('@/features/job-matching/pages/JobMatchingPage'), 'JobMatchingPage')}</RequireEntitlement>,
      },
      { path: 'developer-profile', element: lazyPage(() => import('@/features/developer-profile/pages/DeveloperProfilePage'), 'DeveloperProfilePage') },

      { path: 'platform', element: lazyPage(() => import('@/features/platform-admin/pages/PlatformAdminPage'), 'PlatformAdminPage') },

      { path: 'settings', element: lazyPage(() => import('@/features/settings/pages/SettingsHubPage'), 'SettingsHubPage') },
      { path: 'settings/profile', element: lazyPage(() => import('@/features/settings/pages/UserProfilePage'), 'UserProfilePage') },
      {
        path: 'settings/organization',
        element: (
          <RequirePermission permission="org.manage-users">
            {lazyPage(() => import('@/features/organization/pages/OrganizationSettingsPage'), 'OrganizationSettingsPage')}
          </RequirePermission>
        ),
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
