"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Clock,
  Video,
  MapPin,
  Phone,
  Trash2,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
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

  // Sort interviews chronologically by interviewDate
  const sortedInterviews = useMemo(() => {
    return [...interviews].sort((a, b) => {
      return new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime();
    });
  }, [interviews]);

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

  const getModeIcon = (interviewMode: string) => {
    switch (interviewMode) {
      case "ONLINE":
        return <Video className="w-4 h-4 text-purple-600" />;
      case "IN_PERSON":
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case "PHONE":
        return <Phone className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Interview Schedules
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track chronological interview rounds, test dates, preparation notes, and outcomes.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Schedule Interview
        </Button>
      </div>

      {sortedInterviews.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-semibold text-slate-800">
                No interview rounds scheduled yet
              </h3>
              <p className="text-xs text-slate-500">
                Link an interview round to any active job application to keep track of dates, meeting links, and prep notes.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Schedule First Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedInterviews.map((int) => {
            const linkedApp = applications.find((a) => a.applicationId === int.applicationId);
            const isUpcoming = new Date(int.interviewDate).getTime() > Date.now();

            return (
              <Card
                key={int.interviewId}
                className="hover:border-purple-200 transition-all hover:shadow-sm"
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                        {getModeIcon(int.mode)}
                        <span>{int.mode}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {int.roundName}
                      </h3>
                      {isUpcoming ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Upcoming
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>

                    {linkedApp && (
                      <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <Link
                          href={`/applications/${linkedApp.applicationId}`}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {linkedApp.companyName} &bull; {linkedApp.jobTitle}
                        </Link>
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      <span className="font-medium text-slate-800">
                        {formatDateTime(int.interviewDate)}
                      </span>
                    </div>

                    {int.notes && (
                      <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600 italic">
                        Prep notes: {int.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {linkedApp && (
                      <Link href={`/applications/${linkedApp.applicationId}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          View Application
                        </Button>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteInterview(int.interviewId)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Interview Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Schedule Interview */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Interview Round"
        description="Record round details and preparation notes for your interview."
      >
        <form onSubmit={handleCreateInterview} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Linked Job Application
            </label>
            {applications.length === 0 ? (
              <p className="text-xs text-rose-600">
                You have no applications. Create an application first before scheduling an interview.
              </p>
            ) : (
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {applications.map((app) => (
                  <option key={app.applicationId} value={app.applicationId}>
                    {app.companyName} — {app.jobTitle}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Input
            label="Round Name / Title"
            placeholder="e.g. Technical Coding Round 1, System Design, HR"
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
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as "ONLINE" | "IN_PERSON" | "PHONE")
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
              placeholder="Meeting link, interviewers, concepts to revise..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={applications.length === 0}>
              Save Round
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function InterviewsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading Interviews...</div>}>
      <InterviewsContent />
    </Suspense>
  );
}
