import { LayoutGrid } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/feedback/Toaster';

/** Minimal chrome layout for the candidate-facing assessment/interview experience — deliberately not the recruiter dashboard shell. */
export function CandidateLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      {/* Top accent strip */}
      <div className="h-0.5 bg-gradient-to-r from-primary via-primary-secondary to-primary-light" />
      <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-border bg-surface/90 px-5 backdrop-blur-sm">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30 text-white">
          <LayoutGrid className="size-3.5" />
        </span>
        <span className="text-body-2 font-semibold text-text-primary">Kombee Assessments</span>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
