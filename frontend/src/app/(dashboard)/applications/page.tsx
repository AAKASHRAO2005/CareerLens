"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Briefcase, Trash2, ArrowUpRight, Calendar, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { STATUS_MAP, formatDate, ApplicationStatus } from "@/lib/formatters";
import { useMockData } from "@/features/mock-context";

export default function ApplicationsPage() {
  const { applications, deleteApplication } = useMockData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesQuery =
          app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus =
          selectedStatus === "ALL" || app.status === selectedStatus;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [applications, searchQuery, selectedStatus, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Job Applications
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage your multi-stage company recruitment processes.
          </p>
        </div>
        <Link href="/applications/new">
          <Button>
            <Plus className="w-4 h-4 mr-1.5" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, role, or required skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
            >
              <option value="ALL">All Statuses ({applications.length})</option>
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="ONLINE_ASSESSMENT">Assessment</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="h-10 px-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-semibold text-slate-800">
                {applications.length === 0
                  ? "No applications in your tracker"
                  : "No matching applications found"}
              </h3>
              <p className="text-xs text-slate-500">
                {applications.length === 0
                  ? "Record job descriptions, deadline dates, and status stages to stay organized during placement season."
                  : "Try clearing your search query or selecting a different status filter."}
              </p>
            </div>
            {applications.length === 0 ? (
              <Link href="/applications/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Your First Application
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("ALL");
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => {
            const statusCfg = STATUS_MAP[app.status as ApplicationStatus] || STATUS_MAP.APPLIED;
            return (
              <Card
                key={app.applicationId}
                className="hover:border-indigo-200 transition-all hover:shadow-md"
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {app.companyName}
                      </h3>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-sm font-medium text-slate-700">
                        {app.jobTitle}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusCfg.colorClass}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>

                    {app.jobDescription && (
                      <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl leading-relaxed">
                        {app.jobDescription}
                      </p>
                    )}

                    {/* Required Skills tags */}
                    {app.requiredSkills && app.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {app.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Applied: {formatDate(app.applicationDate)}
                      </span>
                      {app.notes && (
                        <span className="truncate max-w-xs text-slate-500 italic">
                          Note: {app.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <Link href={`/skill-analyzer?applicationId=${app.applicationId}`}>
                      <Button variant="ghost" size="sm" className="text-xs gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        <Sparkles className="w-3.5 h-3.5" />
                        Skills
                      </Button>
                    </Link>
                    <Link href={`/applications/${app.applicationId}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Details
                        <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteApplication(app.applicationId)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Application"
                      aria-label={`Delete ${app.companyName}`}
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
    </div>
  );
}
