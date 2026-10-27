"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Modal } from "@/components/ui/Modal";
import { STATUS_MAP, formatDate, formatDateTime, ApplicationStatus } from "@/lib/formatters";
import { useMockData } from "@/features/mock-context";

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  const router = useRouter();

  const {
    getApplication,
    updateApplication,
    deleteApplication,
    getInterviewsByApplication,
    addInterview,
  } = useMockData();

  const application = getApplication(applicationId);
  const linkedInterviews = getInterviewsByApplication(applicationId);

  // Modal states
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [roundName, setRoundName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewMode, setInterviewMode] = useState<"ONLINE" | "IN_PERSON" | "PHONE">("ONLINE");
  const [interviewNotes, setInterviewNotes] = useState("");

  // Edit notes state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(application?.notes || "");

  if (!application) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-error-container text-error flex items-center justify-center mx-auto">
          <MaterialIcon name="error" className="text-[28px]" />
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface">Application Not Found</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          The requested job application record does not exist or was deleted.
        </p>
        <Link href="/applications">
          <button className="h-9 px-4 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">
            Back to Applications
          </button>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_MAP[application.status as ApplicationStatus] || STATUS_MAP.APPLIED;
  const companyInitial = application.companyName ? application.companyName.slice(0, 2).toUpperCase() : "CO";

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    updateApplication(application.applicationId, { status: newStatus });
  };

  const handleSaveNotes = () => {
    updateApplication(application.applicationId, { notes: notesDraft });
    setIsEditingNotes(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${application.companyName}?`)) {
      deleteApplication(application.applicationId);
      router.push("/applications");
    }
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundName.trim() || !interviewDate) return;

    addInterview({
      applicationId: application.applicationId,
      roundName: roundName.trim(),
      interviewDate: new Date(interviewDate).toISOString(),
      mode: interviewMode,
      notes: interviewNotes.trim(),
    });

    setIsInterviewModalOpen(false);
    setRoundName("");
    setInterviewDate("");
    setInterviewNotes("");
  };

  const stages: { id: ApplicationStatus; label: string }[] = [
    { id: "SAVED", label: "Saved" },
    { id: "APPLIED", label: "Applied" },
    { id: "ONLINE_ASSESSMENT", label: "Assessment" },
    { id: "INTERVIEW", label: "Interview" },
    { id: "OFFER", label: "Offer" },
  ];

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <Link
            href="/applications"
            className="w-9 h-9 rounded-lg border border-[#cbd5e1] hover:bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <MaterialIcon name="arrow_back" className="text-[20px]" />
          </Link>
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-surface-container text-primary font-bold text-sm flex items-center justify-center shadow-sm">
              {companyInitial}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  {application.companyName}
                </h1>
                <span
                  className={`font-label-sm text-label-sm px-2.5 py-0.5 rounded-full border ${statusCfg.colorClass}`}
                >
                  {statusCfg.label}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {application.jobTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <Link href={`/skill-analyzer?applicationId=${application.applicationId}`}>
            <button className="h-9 px-space-md bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-[#cbd5e1] rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
              <MaterialIcon name="bolt" className="text-[18px] text-surface-tint" />
              <span>Skill Match</span>
            </button>
          </Link>

          <button
            onClick={() => setIsInterviewModalOpen(true)}
            className="h-9 px-space-md bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-[#cbd5e1] rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <MaterialIcon name="calendar_today" className="text-[18px] text-secondary" />
            <span>Schedule Round</span>
          </button>

          <button
            onClick={handleDelete}
            className="h-9 px-3 rounded-lg border border-error-container text-error hover:bg-error-container/40 font-label-md text-label-md transition-colors cursor-pointer"
            title="Delete application"
          >
            <MaterialIcon name="delete" className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* 2. Pipeline Stage Trail Selector */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
            Recruitment Funnel Stage
          </span>
          <span className="font-caption text-caption text-outline">
            Applied: {formatDate(application.applicationDate)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {stages.map((st, idx) => {
            const isCurrent = application.status === st.id;
            return (
              <button
                key={st.id}
                onClick={() => handleStatusChange(st.id)}
                className={`py-2 px-3 rounded-lg font-label-md text-label-md font-semibold flex items-center justify-between transition-all cursor-pointer border ${
                  isCurrent
                    ? "bg-primary text-on-primary border-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border-transparent"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-[11px] opacity-70">{idx + 1}.</span>
                  <span>{st.label}</span>
                </span>
                {isCurrent && <MaterialIcon name="check" className="text-[16px]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (8 cols): Snapshot, Job Description, Linked Interviews */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
          {/* Position Snapshot Grid */}
          <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] p-space-xl shadow-sm flex flex-col gap-space-md">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Position Snapshot
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
              <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-outline">Office Mode</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
                  {application.location || "Hybrid"}
                </span>
                <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                  Cambridge, MA
                </span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-outline">Package / CTC</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
                  {application.salary || "Competitive"}
                </span>
                <span className="font-caption text-caption text-tertiary font-semibold mt-0.5">
                  Verified Tier 1
                </span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-outline">Application Date</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
                  {formatDate(application.applicationDate)}
                </span>
                <span className="font-caption text-caption text-primary font-semibold mt-0.5">
                  Campus Drive
                </span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-outline">Rounds Recorded</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
                  {linkedInterviews.length}
                </span>
                <span className="font-caption text-caption text-outline mt-0.5">In schedule</span>
              </div>
            </div>
          </div>

          {/* Job Description & Required Skills */}
          <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] p-space-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Job Description & Scope
              </span>
              <span className="font-caption text-caption text-outline">MIT-EECS Department Track</span>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">
              {application.jobDescription || "No detailed job description supplied for this record."}
            </p>

            <div className="flex flex-col gap-2 pt-space-sm border-t border-[#e2e8f0]">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Required Technical Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {application.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-surface-container border border-primary-fixed-dim text-primary font-label-sm text-label-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interview Timeline for this application */}
          <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] p-space-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Interview Rounds & Debriefs
              </span>
              <button
                onClick={() => setIsInterviewModalOpen(true)}
                className="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MaterialIcon name="add" className="text-[16px]" />
                <span>Add Round</span>
              </button>
            </div>

            {linkedInterviews.length === 0 ? (
              <div className="py-6 text-center text-on-surface-variant font-body-sm">
                No interviews scheduled yet for this application.
              </div>
            ) : (
              <div className="space-y-space-sm">
                {linkedInterviews.map((int) => (
                  <div
                    key={int.interviewId}
                    className="p-space-md rounded-xl bg-surface-container-low border border-[#e2e8f0] flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        {int.roundName}
                      </span>
                      <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-medium">
                        {int.mode}
                      </span>
                    </div>
                    <span className="font-caption text-caption text-primary font-semibold flex items-center gap-1">
                      <MaterialIcon name="schedule" className="text-[14px]" />
                      {formatDateTime(int.interviewDate)}
                    </span>
                    {int.notes && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant italic mt-1">
                        “{int.notes}”
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Notes & Recruiter Contacts */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] p-space-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Candidate Notes
              </span>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="font-label-sm text-label-sm text-primary hover:underline font-semibold cursor-pointer"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="font-label-sm text-label-sm text-tertiary hover:underline font-semibold cursor-pointer"
                >
                  Save
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="flex flex-col gap-2">
                <textarea
                  rows={5}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#cbd5e1] font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
                <button
                  onClick={handleSaveNotes}
                  className="h-8 px-3 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold self-end cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
            ) : (
              <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-wrap">
                {application.notes || "No candidate notes recorded yet."}
              </p>
            )}
          </div>

          {/* Quick Match CTA Card */}
          <div className="bg-surface-container-low rounded-xl border border-primary-fixed-dim p-space-lg flex flex-col gap-space-sm">
            <div className="flex items-center gap-2 text-primary font-semibold font-label-md text-label-md">
              <MaterialIcon name="bolt" className="text-[20px]" />
              <span>Skill Match Readiness</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Run deterministic matching against your declared profile skills to discover missing keywords and coursework recommendations.
            </p>
            <Link href={`/skill-analyzer?applicationId=${application.applicationId}`}>
              <button className="w-full h-9 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <span>Evaluate Skill Gap</span>
                <MaterialIcon name="arrow_forward" className="text-[16px]" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Schedule Interview Round"
        description={`Record an upcoming evaluation round for ${application.companyName}.`}
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Round Name
            </label>
            <input
              type="text"
              placeholder="e.g. Technical Round 1 (System Design)"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              required
              className="h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Interview Date & Time
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
              value={interviewMode}
              onChange={(e) => setInterviewMode(e.target.value as "ONLINE" | "IN_PERSON" | "PHONE")}
              className="h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md"
            >
              <option value="ONLINE">Online (Google Meet / Zoom)</option>
              <option value="IN_PERSON">In-Person (On-Campus)</option>
              <option value="PHONE">Phone Screen</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Preparation / Debrief Notes
            </label>
            <textarea
              rows={3}
              placeholder="Interviewer names, topics to review..."
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              className="p-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setIsInterviewModalOpen(false)}
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
