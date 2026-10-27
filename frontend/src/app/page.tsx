import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-on-primary shadow-md">
            <MaterialIcon name="explore" className="text-[24px]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                CareerLens
              </span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-primary font-semibold border border-primary-fixed-dim">
                Beta
              </span>
            </div>
            <span className="block font-caption text-caption uppercase tracking-wider text-outline font-semibold -mt-0.5">
              Placement Intelligence Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="h-9 px-4 rounded-lg border border-[#cbd5e1] hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors">
              Sign In
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="h-9 px-4 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all">
              <span>Open Dashboard</span>
              <MaterialIcon name="arrow_forward" className="text-[18px]" />
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-primary-fixed-dim text-primary font-label-sm text-label-sm font-semibold mx-auto">
          <MaterialIcon name="verified" className="text-[18px]" />
          <span>Campus Placement Season 2025 • Phase 1 Active</span>
        </div>

        <h1 className="font-headline-xl text-headline-xl sm:text-5xl md:text-6xl text-on-surface tracking-tight font-bold max-w-4xl mx-auto">
          Take control of your campus and off-campus placements.
        </h1>

        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Track job applications across recruitment stages, evaluate skill gaps against target roles with explainable, deterministic metrics, and manage encrypted resume versions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto h-11 px-8 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer">
              <span>Explore Dashboard Demo</span>
              <MaterialIcon name="arrow_forward" className="text-[20px]" />
            </button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto h-11 px-8 rounded-lg border border-[#cbd5e1] hover:bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold transition-colors cursor-pointer">
              Candidate SSO Sign In
            </button>
          </Link>
        </div>

        {/* Feature Grid Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-12 text-left">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <MaterialIcon name="view_kanban" className="text-[20px]" />
            </div>
            <h3 className="font-label-md text-label-md text-on-surface font-semibold">
              Application Tracker
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Track multi-stage recruitment cycles from Applied to Offer with status badges and notes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-surface-container text-surface-tint flex items-center justify-center">
              <MaterialIcon name="bolt" className="text-[20px]" />
            </div>
            <h3 className="font-label-md text-label-md text-on-surface font-semibold">
              Skill-Gap Analyzer
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Transparent, deterministic skill matching algorithm comparing requirements with your profile.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high text-secondary flex items-center justify-center">
              <MaterialIcon name="event_available" className="text-[20px]" />
            </div>
            <h3 className="font-label-md text-label-md text-on-surface font-semibold">
              Interview Schedules
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Manage chronological interview rounds, test dates, preparation notes, and meeting links.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center">
              <MaterialIcon name="description" className="text-[20px]" />
            </div>
            <h3 className="font-label-md text-label-md text-on-surface font-semibold">
              Private Resume Vault
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Upload PDF resumes directly to encrypted Amazon S3 buckets with presigned URLs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-surface-container-lowest py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between font-caption text-caption text-on-surface-variant gap-2">
          <span>CareerLens — Placement Intelligence Platform &bull; Google Stitch Design</span>
          <span>100% Serverless Architecture (Zero EC2)</span>
        </div>
      </footer>
    </div>
  );
}
