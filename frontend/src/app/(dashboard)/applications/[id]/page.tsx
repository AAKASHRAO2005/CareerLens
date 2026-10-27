"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Trash2,
  Building2,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
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
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Application Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested job application record does not exist or was deleted.
        </p>
        <Link href="/applications">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Applications
          </Button>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_MAP[application.status as ApplicationStatus] || STATUS_MAP.APPLIED;

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back and Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/skill-analyzer?applicationId=${application.applicationId}`}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Analyze Skills
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsInterviewModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Schedule Round
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            className="text-xs"
            title="Delete Application"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Details Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  {application.companyName}
                </CardTitle>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {application.jobTitle}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ID: {application.applicationId}
                </p>
              </div>
            </div>

            {/* Status Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                Stage:
              </span>
              <select
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${statusCfg.colorClass}`}
              >
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="ONLINE_ASSESSMENT">Assessment</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs">
            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider block">
                Application Date
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {formatDate(application.applicationDate)}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider block">
                Record Created
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {formatDateTime(application.createdAt)}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider block">
                Active Interview Rounds
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {linkedInterviews.length} Round{linkedInterviews.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Required Skills ({application.requiredSkills.length})
              </h4>
              <Link
                href={`/skill-analyzer?applicationId=${application.applicationId}`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Run Gap Analysis
              </Link>
            </div>
            {application.requiredSkills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills listed for this role.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {application.requiredSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="neutral"
                    className="py-1 px-3 text-xs font-medium"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Job Description
            </h4>
            <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {application.jobDescription || "No job description provided."}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Personal Notes
              </h4>
              <button
                type="button"
                onClick={() => {
                  setNotesDraft(application.notes || "");
                  setIsEditingNotes(!isEditingNotes);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {isEditingNotes ? "Cancel" : "Edit Notes"}
              </button>
            </div>
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <Button size="sm" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/60 text-xs text-slate-700 italic">
                {application.notes || "No notes recorded yet."}
              </div>
            )}
          </div>

          {/* Linked Interviews Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Scheduled Interview Rounds
                </h4>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInterviewModalOpen(true)}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Round
              </Button>
            </div>

            {linkedInterviews.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No interview rounds scheduled for this company yet.
              </div>
            ) : (
              <div className="space-y-2">
                {linkedInterviews.map((int) => (
                  <div
                    key={int.interviewId}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{int.roundName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDateTime(int.interviewDate)} &bull; Mode: {int.mode}
                      </p>
                      {int.notes && (
                        <p className="text-xs text-slate-600 mt-1 italic">
                          Prep notes: {int.notes}
                        </p>
                      )}
                    </div>
                    <Badge variant="purple" size="sm">
                      {int.mode}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal: Schedule Interview Round */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Schedule Interview Round"
        description={`Add an interview round for ${application.companyName}`}
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <Input
            label="Round Name / Title"
            placeholder="e.g. Technical Coding Round 1"
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Interview Date & Time"
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Mode
              </label>
              <select
                value={interviewMode}
                onChange={(e) =>
                  setInterviewMode(e.target.value as "ONLINE" | "IN_PERSON" | "PHONE")
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ONLINE">Online (Video)</option>
                <option value="IN_PERSON">In Person</option>
                <option value="PHONE">Phone Screen</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Preparation Notes
            </label>
            <textarea
              rows={3}
              placeholder="Topics to revise, meeting link, interviewer details..."
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInterviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Round
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
