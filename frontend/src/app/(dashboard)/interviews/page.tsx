"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/formatters";
import { useMockData } from "@/features/mock-context";

function InterviewsContent() {
  const searchParams = useSearchParams();
  const preselectedAppId = searchParams.get("applicationId") || "";

  const {
    interviews,
    applications,
    addInterview,
    deleteInterview,
  } = useMockData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(
    preselectedAppId || (applications.length > 0 ? applications[0].applicationId : "")
  );
  const [roundName, setRoundName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [mode, setMode] = useState<"ONLINE" | "IN_PERSON" | "PHONE">("ONLINE");
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "UPCOMING" | "PAST">("ALL");

  // Sorted interviews
  const sortedInterviews = useMemo(() => {
    return [...interviews]
      .filter((int) => {
        const matchesQuery =
          int.roundName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (int.notes && int.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        const isUpcoming = new Date(int.interviewDate).getTime() > Date.now();
        const matchesTab =
          filterTab === "ALL"
            ? true
            : filterTab === "UPCOMING"
            ? isUpcoming
            : !isUpcoming;

        return matchesQuery && matchesTab;
      })
      .sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime());
  }, [interviews, searchQuery, filterTab]);

  const upcomingCount = interviews.filter(
    (int) => new Date(int.interviewDate).getTime() > Date.now()
  ).length;

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !roundName.trim() || !interviewDate) return;

    addInterview({
      applicationId: selectedAppId,
      roundName: roundName.trim(),
      interviewDate: new Date(interviewDate).toISOString(),
      mode,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
    setRoundName("");
    setInterviewDate("");
    setNotes("");
  };

  const getModeIconName = (m: string) => {
    switch (m) {
      case "ONLINE":
        return "videocam";
      case "IN_PERSON":
        return "apartment";
      case "PHONE":
        return "call";
      default:
        return "event";
    }
  };

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Interview Schedules
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Track chronological interview rounds, test dates, preparation notes, and outcomes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-9 px-space-md bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          <MaterialIcon name="add" className="text-[18px]" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* 2. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
              Upcoming Rounds
            </span>
            <div className="font-headline-md text-headline-md text-secondary mt-1">
              {upcomingCount} Ahead
            </div>
            <span className="font-caption text-caption text-secondary">Next: This week</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
            <MaterialIcon name="calendar_month" className="text-[22px]" />
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
              Total Recorded
            </span>
            <div className="font-headline-md text-headline-md text-on-surface mt-1">
              {interviews.length} Rounds
            </div>
            <span className="font-caption text-caption text-tertiary font-semibold">85.7% Advance Rate</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <MaterialIcon name="verified" className="text-[22px]" />
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
              Active Pipelines
            </span>
            <div className="font-headline-md text-headline-md text-primary mt-1">
              {applications.length}
            </div>
            <span className="font-caption text-caption text-on-surface-variant truncate">
              Campus placement drives
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
            <MaterialIcon name="hub" className="text-[22px]" />
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
              Readiness Index
            </span>
            <div className="font-headline-md text-headline-md text-tertiary mt-1">94%</div>
            <span className="font-caption text-caption text-outline">Coursework Verified</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
            <MaterialIcon name="school" className="text-[22px]" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Controls Strip */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        {/* Search */}
        <div className="flex items-center gap-space-sm flex-1 max-w-md px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant focus-within:ring-1 focus-within:ring-primary-container transition-all">
          <MaterialIcon name="search" className="text-[18px] text-outline" />
          <input
            type="text"
            placeholder="Search interviewers, topics, round types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center p-1 bg-surface-container-low rounded-lg font-label-sm text-label-sm">
          <button
            onClick={() => setFilterTab("ALL")}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              filterTab === "ALL"
                ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All ({interviews.length})
          </button>
          <button
            onClick={() => setFilterTab("UPCOMING")}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              filterTab === "UPCOMING"
                ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilterTab("PAST")}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              filterTab === "PAST"
                ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Past ({interviews.length - upcomingCount})
          </button>
        </div>
      </div>

      {/* 4. Interview Cards Timeline */}
      {sortedInterviews.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] p-16 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-surface-container text-outline flex items-center justify-center mx-auto">
            <MaterialIcon name="event_busy" className="text-[24px]" />
          </div>
          <p className="font-label-md text-label-md text-on-surface font-semibold">
            No interview rounds match this filter
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
            Schedule a new round or clear your search query to view all dates.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <MaterialIcon name="add" className="text-[16px]" />
            <span>Schedule Round</span>
          </button>
        </div>
      ) : (
        <div className="space-y-space-md">
          {sortedInterviews.map((int) => {
            const linkedApp = applications.find((a) => a.applicationId === int.applicationId);
            const isUpcoming = new Date(int.interviewDate).getTime() > Date.now();

            return (
              <div
                key={int.interviewId}
                className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm hover:border-[#cbd5e1] hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-md"
              >
                <div className="flex items-start gap-space-md flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-surface-container-high text-primary flex items-center justify-center flex-shrink-0">
                    <MaterialIcon name={getModeIconName(int.mode)} className="text-[22px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                        {int.roundName}
                      </span>
                      <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-medium">
                        {int.mode}
                      </span>
                      {isUpcoming ? (
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-semibold">
                          Upcoming
                        </span>
                      ) : (
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-outline">
                          Completed
                        </span>
                      )}
                    </div>

                    {linkedApp && (
                      <Link
                        href={`/applications/${linkedApp.applicationId}`}
                        className="font-body-sm text-body-sm text-primary hover:underline font-medium mt-0.5 truncate"
                      >
                        {linkedApp.companyName} • {linkedApp.jobTitle}
                      </Link>
                    )}

                    <span className="font-caption text-caption text-outline flex items-center gap-1 mt-1">
                      <MaterialIcon name="schedule" className="text-[14px]" />
                      {formatDateTime(int.interviewDate)}
                    </span>

                    {int.notes && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant italic mt-1">
                        “{int.notes}”
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-space-sm self-end md:self-center flex-shrink-0">
                  {int.meetingLink ? (
                    <a
                      href={int.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 transition-colors"
                    >
                      <MaterialIcon name="videocam" className="text-[16px]" />
                      <span>Join Call</span>
                    </a>
                  ) : null}

                  {linkedApp && (
                    <Link
                      href={`/applications/${linkedApp.applicationId}`}
                      className="h-8 px-3 rounded-lg border border-[#cbd5e1] hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Review App</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Remove ${int.roundName}?`)) {
                        deleteInterview(int.interviewId);
                      }
                    }}
                    className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container transition-colors cursor-pointer"
                    title="Delete interview"
                  >
                    <MaterialIcon name="delete" className="text-[18px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Interview Round"
        description="Record an upcoming company assessment or technical interview."
      >
        <form onSubmit={handleCreateInterview} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Associated Job Application
            </label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md"
              required
            >
              {applications.map((app) => (
                <option key={app.applicationId} value={app.applicationId}>
                  {app.companyName} — {app.jobTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Round Name
            </label>
            <input
              type="text"
              placeholder="e.g. Coding Assessment, System Architecture"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              required
              className="h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              required
              className="h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Interview Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "ONLINE" | "IN_PERSON" | "PHONE")}
              className="h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md"
            >
              <option value="ONLINE">Online (Google Meet / Zoom)</option>
              <option value="IN_PERSON">In-Person (On-Campus)</option>
              <option value="PHONE">Phone Screen</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Preparation Notes
            </label>
            <textarea
              rows={3}
              placeholder="Key concepts to study, questions for interviewer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="p-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="h-9 px-4 rounded-lg border border-[#cbd5e1] text-on-surface font-label-md text-label-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function InterviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-outline font-label-md text-label-md">
          Loading Interviews...
        </div>
      }
    >
      <InterviewsContent />
    </Suspense>
  );
}
