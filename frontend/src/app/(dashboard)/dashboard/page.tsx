"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Sparkles,
  FileText,
  Plus,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { STATUS_MAP, formatDate, formatDateTime, ApplicationStatus } from "@/lib/formatters";
import { useMockData } from "@/features/mock-context";

export default function DashboardPage() {
  const { applications, interviews, profile, resumes } = useMockData();

  // Aggregate metrics
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

    const upcomingInterviews = interviews.filter(
      (int) => new Date(int.interviewDate).getTime() > Date.now()
    );

    return {
      totalApplications: applications.length,
      byStatus: counts,
      upcomingInterviewsCount: upcomingInterviews.length,
      skillsCount: profile.skills.length,
      resumesCount: resumes.length,
      activePipelines: counts.APPLIED + counts.ONLINE_ASSESSMENT + counts.INTERVIEW,
    };
  }, [applications, interviews, profile.skills, resumes]);

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
      .slice(0, 4);
  }, [applications]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {profile.displayName.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Here is your live placement intelligence summary and recruitment pipeline progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/applications/new">
            <Button>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-blue-200 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Applications
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {metrics.totalApplications}
              </p>
              <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                {metrics.activePipelines} active in pipeline
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-purple-200 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Upcoming Interviews
              </p>
              <p className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">
                {metrics.upcomingInterviewsCount}
              </p>
              <p className="text-[11px] text-purple-500 font-medium mt-0.5">
                {interviews.length} total recorded
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-200 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Skill Inventory
              </p>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
                {metrics.skillsCount}
              </p>
              <p className="text-[11px] text-indigo-500 font-medium mt-0.5">
                Ready for Gap Analysis
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-200 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resumes Stored
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                {metrics.resumesCount}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                Encrypted in S3 Vault
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recruitment Pipeline Status Breakdown */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recruitment Pipeline Stage Distribution</CardTitle>
            <span className="text-xs text-slate-400 font-medium">Real-time status breakdown</span>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved</span>
              <span className="text-lg font-bold text-slate-700">{metrics.byStatus.SAVED}</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Applied</span>
              <span className="text-lg font-bold text-blue-700">{metrics.byStatus.APPLIED}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Assessment</span>
              <span className="text-lg font-bold text-amber-800">{metrics.byStatus.ONLINE_ASSESSMENT}</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/60 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Interview</span>
              <span className="text-lg font-bold text-purple-700">{metrics.byStatus.INTERVIEW}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Offer</span>
              <span className="text-lg font-bold text-emerald-700">{metrics.byStatus.OFFER}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/60 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-600 block">Rejected</span>
              <span className="text-lg font-bold text-rose-700">{metrics.byStatus.REJECTED}</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Withdrawn</span>
              <span className="text-lg font-bold text-gray-600">{metrics.byStatus.WITHDRAWN}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Applications */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-base">Recent Job Applications</CardTitle>
                <CardDescription>Track status changes and active recruitment rounds</CardDescription>
              </div>
              <Link href="/applications">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View all ({applications.length})
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {recentApplications.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">No applications recorded yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Start tracking your recruitment process by adding your first job application.
                    </p>
                  </div>
                  <Link href="/applications/new">
                    <Button size="sm">Add First Application</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentApplications.map((app) => {
                    const statusCfg = STATUS_MAP[app.status as ApplicationStatus] || STATUS_MAP.APPLIED;
                    return (
                      <div
                        key={app.applicationId}
                        className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {app.companyName}
                            </span>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${statusCfg.colorClass}`}
                            >
                              {statusCfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{app.jobTitle}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 hidden sm:inline">
                            {formatDate(app.applicationDate)}
                          </span>
                          <Link href={`/applications/${app.applicationId}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Upcoming Interviews & Skill Teaser */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-base">Upcoming Interviews</CardTitle>
                <CardDescription>Scheduled rounds & tests</CardDescription>
              </div>
              <Link href="/interviews">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  All
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingInterviews.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500">No upcoming interviews.</p>
                  <Link href="/interviews">
                    <Button variant="outline" size="sm" className="text-xs">
                      Schedule Round
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingInterviews.map((int) => {
                    const linkedApp = applications.find((a) => a.applicationId === int.applicationId);
                    return (
                      <div key={int.interviewId} className="p-4 space-y-1.5 hover:bg-slate-50/50">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {int.roundName}
                          </p>
                          <Badge variant="purple" size="sm">
                            {int.mode}
                          </Badge>
                        </div>
                        {linkedApp && (
                          <p className="text-[11px] text-slate-600 font-medium">
                            {linkedApp.companyName} &bull; {linkedApp.jobTitle}
                          </p>
                        )}
                        <p className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(int.interviewDate)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Skill-Gap Card */}
          <Card className="bg-indigo-50/40 border-indigo-200/80">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Deterministic Skill Gap Analysis</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare your declared skills ({profile.skills.length}) against target role descriptions with an explainable algorithm.
              </p>
              <Link href="/skill-analyzer">
                <Button size="sm" className="w-full justify-center bg-indigo-600 hover:bg-indigo-700">
                  Launch Skill Analyzer
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
