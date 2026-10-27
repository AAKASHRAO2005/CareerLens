import Link from "next/link";
import { Compass, Briefcase, Sparkles, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-xl">
              Career<span className="text-indigo-600">Lens</span>
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold -mt-1">
              Placement Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">
              Open Dashboard
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          Placement Management & Preparation Intelligence
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto">
          Take control of your campus and off-campus placements.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
          Track job applications across companies, evaluate skill gaps against real job requirements with explainable metrics, schedule interviews, and organize private resume versions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-base">
              Explore Dashboard Demo
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
              Create Free Account
            </Button>
          </Link>
        </div>

        {/* Feature Grid Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-12 text-left">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Application Tracker</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track multi-stage recruitment cycles from Applied to Offer with status badges and notes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Skill-Gap Analyzer</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transparent, deterministic skill matching algorithm comparing requirements with your profile.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Interview Schedules</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manage chronological interview rounds, dates, preparation notes, and outcomes in one view.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Private Resume Vault</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload PDF resumes directly to encrypted Amazon S3 buckets with time-limited presigned URLs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>CareerLens — Placement Intelligence Platform &bull; AWS Serverless</span>
          <span>Built for Technical Hiring Assessment</span>
        </div>
      </footer>
    </div>
  );
}
