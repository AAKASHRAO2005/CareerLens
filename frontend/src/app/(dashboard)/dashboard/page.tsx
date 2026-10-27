"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { STATUS_MAP, formatDate, formatDateTime, ApplicationStatus } from "@/lib/formatters";
import { useMockData } from "@/features/mock-context";

export default function DashboardPage() {
  const { applications, interviews, profile } = useMockData();

  // Metrics computation
  const metrics = useMemo(() => {
    const counts: Record<string, number> = {
      SAVED: 0,
      APPLIED: 0,
      ONLINE_ASSESSMENT: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    applications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    const upcoming = interviews.filter(
      (int) => new Date(int.interviewDate).getTime() > Date.now()
    );

    const totalApps = applications.length;
    const interviewCount = counts.INTERVIEW + counts.ONLINE_ASSESSMENT;
    const interviewRate = totalApps > 0 ? ((interviewCount / totalApps) * 100).toFixed(1) : "0.0";
    const offerRate = totalApps > 0 ? ((counts.OFFER / totalApps) * 100).toFixed(1) : "0.0";

    return {
      totalApplications: totalApps,
      byStatus: counts,
      upcomingInterviewsCount: upcoming.length,
      offersCount: counts.OFFER,
      awaitingCount: counts.APPLIED + counts.ONLINE_ASSESSMENT,
      interviewRate,
      offerRate,
    };
  }, [applications, interviews]);

  // Upcoming interviews sorted
  const upcomingInterviews = useMemo(() => {
    return [...interviews]
      .filter((int) => new Date(int.interviewDate).getTime() > Date.now())
      .sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime())
      .slice(0, 3);
  }, [interviews]);

  // Recent applications
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [applications]);

  const firstName = profile.displayName ? profile.displayName.split(" ")[0] : "Alex";

  return (
    <div className="flex flex-col gap-space-xl w-full">
      {/* 1. Header Welcome & Action Bar */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-[#e2e8f0]">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center flex-wrap gap-space-sm">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Good morning, {firstName} 👋
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Campus Placement Season 2025 • Phase 1 Active
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Here is your career placement trajectory and active application status for today.
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-space-sm">
          <Link href="/applications/new">
            <button className="h-9 px-space-md bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer">
              <MaterialIcon name="add" className="text-[18px]" />
              <span>Add Application</span>
            </button>
          </Link>
          <Link href="/skill-analyzer">
            <button className="h-9 px-space-md bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-[#cbd5e1] rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
              <MaterialIcon name="bolt" className="text-[18px] text-surface-tint" />
              <span>Analyze Skills</span>
            </button>
          </Link>
          <Link href="/resumes">
            <button className="h-9 px-space-md bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-[#cbd5e1] rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
              <MaterialIcon name="upload_file" className="text-[18px] text-outline" />
              <span>Upload Resume</span>
            </button>
          </Link>
          <Link href="/applications">
            <button
              aria-label="Export Summary"
              className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-[#cbd5e1] shadow-sm transition-colors cursor-pointer"
            >
              <MaterialIcon name="ios_share" className="text-[20px]" />
            </button>
          </Link>
        </div>
      </section>

      {/* 2. Metric KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Total Applications
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container text-primary">
              <MaterialIcon name="send" className="text-[18px]" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-space-sm">
              <span className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
                {metrics.totalApplications}
              </span>
              <span className="inline-flex items-center text-tertiary-container font-label-sm text-label-sm font-semibold bg-tertiary-fixed/60 px-1.5 py-0.5 rounded">
                <MaterialIcon name="arrow_upward" className="text-[14px]" />
                +3 this wk
              </span>
            </div>
            {/* Sparkline SVG */}
            <svg className="w-16 h-7 text-primary-container" fill="none" viewBox="0 0 64 24">
              <path
                d="M2 18 L16 14 L30 19 L44 9 L62 3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <circle cx="62" cy="3" fill="currentColor" r="2.5" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Interviews Scheduled
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container text-secondary">
              <MaterialIcon name="event" className="text-[18px]" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-space-sm">
              <span className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
                {interviews.length}
              </span>
              <span className="inline-flex items-center text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold bg-secondary-fixed px-2 py-0.5 rounded">
                {metrics.upcomingInterviewsCount} upcoming
              </span>
            </div>
            <span className="font-caption text-caption text-on-surface-variant font-medium">
              Next: Upcoming
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Offers Received
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container text-tertiary">
              <MaterialIcon name="verified" className="text-[18px]" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-space-sm">
              <span className="font-headline-xl text-headline-xl text-tertiary font-semibold tracking-tight">
                {metrics.offersCount}
              </span>
              <span className="inline-flex items-center text-on-tertiary-container font-label-sm text-label-sm font-semibold bg-tertiary-fixed px-2 py-0.5 rounded">
                Accepted / Open
              </span>
            </div>
            <span className="font-caption text-caption text-tertiary font-semibold">
              {metrics.offerRate}% Conv.
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Awaiting Response
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant">
              <MaterialIcon name="hourglass_top" className="text-[18px]" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-space-sm">
              <span className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
                {metrics.awaitingCount}
              </span>
              <span className="inline-flex items-center text-on-surface-variant font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded">
                Avg: 6 days
              </span>
            </div>
            <span className="font-caption text-caption text-outline font-medium">In review</span>
          </div>
        </div>
      </section>

      {/* 3. Visual Analytics & Pipeline Section (Funnel + Rate Badges) */}
      <section className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col justify-between gap-space-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Funnel Breakdown
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Recruitment Pipeline Visualizer
            </h2>
          </div>
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="px-2.5 py-1 rounded bg-surface-container-low text-primary font-label-sm text-label-sm font-semibold">
              Interview Rate: {metrics.interviewRate}%
            </span>
            <span className="px-2.5 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
              Offer Conversion: {metrics.offerRate}%
            </span>
          </div>
        </div>

        {/* Funnel Multi-segment Bar */}
        <div className="flex flex-col gap-space-sm">
          <div className="w-full h-3 rounded-full bg-surface-container-low overflow-hidden flex">
            <div
              className="h-full bg-outline-variant"
              style={{ width: `${Math.max(5, (metrics.byStatus.SAVED / (metrics.totalApplications || 1)) * 100)}%` }}
              title={`Saved: ${metrics.byStatus.SAVED}`}
            />
            <div
              className="h-full bg-primary-fixed-dim"
              style={{ width: `${Math.max(10, (metrics.byStatus.APPLIED / (metrics.totalApplications || 1)) * 100)}%` }}
              title={`Applied: ${metrics.byStatus.APPLIED}`}
            />
            <div
              className="h-full bg-secondary-container"
              style={{ width: `${Math.max(5, (metrics.byStatus.ONLINE_ASSESSMENT / (metrics.totalApplications || 1)) * 100)}%` }}
              title={`Assessments: ${metrics.byStatus.ONLINE_ASSESSMENT}`}
            />
            <div
              className="h-full bg-secondary"
              style={{ width: `${Math.max(5, (metrics.byStatus.INTERVIEW / (metrics.totalApplications || 1)) * 100)}%` }}
              title={`Interview: ${metrics.byStatus.INTERVIEW}`}
            />
            <div
              className="h-full bg-tertiary-fixed"
              style={{ width: `${Math.max(5, (metrics.byStatus.OFFER / (metrics.totalApplications || 1)) * 100)}%` }}
              title={`Offers: ${metrics.byStatus.OFFER}`}
            />
          </div>

          {/* Funnel Legend & Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-space-sm pt-space-xs text-center">
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span className="font-caption text-caption text-on-surface-variant">Saved</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {metrics.byStatus.SAVED}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span className="font-caption text-caption text-on-surface-variant">Applied</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {metrics.byStatus.APPLIED}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span className="font-caption text-caption text-on-surface-variant">Assessments</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {metrics.byStatus.ONLINE_ASSESSMENT}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span className="font-caption text-caption text-on-surface-variant">Technical</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {metrics.byStatus.INTERVIEW}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span className="font-caption text-caption text-on-surface-variant">Offers</span>
              <span className="font-headline-sm text-headline-sm text-tertiary font-semibold">
                {metrics.byStatus.OFFER}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col">
              <span className="font-caption text-caption text-on-surface-variant">Rejected</span>
              <span className="font-headline-sm text-headline-sm text-error font-semibold">
                {metrics.byStatus.REJECTED}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Two Columns: Upcoming Interviews Timeline & Recent Applications */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Recent Applications Table (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col justify-between gap-space-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Applications Activity
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Recent Submissions
              </h3>
            </div>
            <Link
              href="/applications"
              className="font-label-sm text-label-sm text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>View all ({applications.length})</span>
              <MaterialIcon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>

          <div className="divide-y divide-[#e2e8f0] -mx-space-xl">
            {recentApplications.map((app) => {
              const statusCfg = STATUS_MAP[app.status as ApplicationStatus] || STATUS_MAP.APPLIED;
              const companyInitial = app.companyName ? app.companyName.slice(0, 2).toUpperCase() : "CO";

              return (
                <div
                  key={app.applicationId}
                  className="px-space-xl py-3.5 flex items-center justify-between hover:bg-surface-container-low/60 transition-colors"
                >
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center font-bold text-xs text-primary flex-shrink-0">
                      {companyInitial}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          {app.companyName}
                        </span>
                        <span
                          className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full border ${statusCfg.colorClass}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        {app.jobTitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-md">
                    <span className="font-caption text-caption text-outline hidden sm:inline">
                      {formatDate(app.applicationDate)}
                    </span>
                    <Link
                      href={`/applications/${app.applicationId}`}
                      className="h-8 px-3 rounded-lg border border-[#cbd5e1] hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Review</span>
                      <MaterialIcon name="chevron_right" className="text-[16px]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Upcoming Interviews Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col justify-between gap-space-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Calendar Schedule
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Upcoming Interviews
              </h3>
            </div>
            <Link
              href="/interviews"
              className="font-label-sm text-label-sm text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>Schedule</span>
              <MaterialIcon name="add" className="text-[16px]" />
            </Link>
          </div>

          <div className="space-y-space-md">
            {upcomingInterviews.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant font-body-sm">
                No upcoming interviews scheduled.
              </div>
            ) : (
              upcomingInterviews.map((int) => {
                const linkedApp = applications.find(
                  (a) => a.applicationId === int.applicationId
                );
                return (
                  <div
                    key={int.interviewId}
                    className="p-space-md rounded-xl bg-surface-container-low border border-[#e2e8f0] flex flex-col gap-2 hover:border-[#cbd5e1] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        {int.roundName}
                      </span>
                      <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-medium">
                        {int.mode}
                      </span>
                    </div>
                    {linkedApp && (
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {linkedApp.companyName} • {linkedApp.jobTitle}
                      </span>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-caption text-caption text-primary font-semibold flex items-center gap-1">
                        <MaterialIcon name="schedule" className="text-[16px]" />
                        {formatDateTime(int.interviewDate)}
                      </span>
                      {int.meetingLink ? (
                        <a
                          href={int.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="h-7 px-2.5 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 hover:bg-primary transition-colors"
                        >
                          <MaterialIcon name="video_camera_front" className="text-[14px]" />
                          <span>Join</span>
                        </a>
                      ) : (
                        <Link
                          href="/interviews"
                          className="font-label-sm text-label-sm text-outline hover:text-on-surface"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Skill Analyzer Promotion */}
          <div className="p-space-md rounded-xl bg-surface-container border border-primary-fixed-dim flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
                <MaterialIcon name="insights" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  Skill Gap Evaluation
                </span>
                <span className="font-caption text-caption text-on-surface-variant truncate">
                  Deterministic keyword matching
                </span>
              </div>
            </div>
            <Link
              href="/skill-analyzer"
              className="h-8 px-3 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 flex-shrink-0 hover:bg-on-primary-fixed-variant transition-colors"
            >
              <span>Test</span>
              <MaterialIcon name="arrow_forward" className="text-[14px]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
