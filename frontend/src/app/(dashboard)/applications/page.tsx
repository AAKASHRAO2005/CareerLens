"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { STATUS_MAP, formatDate, ApplicationStatus } from "@/lib/formatters";
import { useMockData } from "@/features/mock-context";

export default function ApplicationsPage() {
  const { applications, deleteApplication } = useMockData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Summary counts
  const stats = useMemo(() => {
    let active = 0;
    let interviews = 0;
    let offers = 0;

    applications.forEach((app) => {
      if (app.status === "APPLIED" || app.status === "ONLINE_ASSESSMENT" || app.status === "INTERVIEW") {
        active++;
      }
      if (app.status === "INTERVIEW") interviews++;
      if (app.status === "OFFER") offers++;
    });

    return {
      active,
      interviews,
      offers,
      avgMatch: "84.2%",
    };
  }, [applications]);

  // Status options for pill tabs
  const statusTabs = [
    { id: "ALL", label: "All Applications", count: applications.length },
    { id: "SAVED", label: "Saved", count: applications.filter((a) => a.status === "SAVED").length },
    { id: "APPLIED", label: "Applied", count: applications.filter((a) => a.status === "APPLIED").length },
    {
      id: "ONLINE_ASSESSMENT",
      label: "Assessments",
      count: applications.filter((a) => a.status === "ONLINE_ASSESSMENT").length,
    },
    {
      id: "INTERVIEW",
      label: "Interviews",
      count: applications.filter((a) => a.status === "INTERVIEW").length,
    },
    { id: "OFFER", label: "Offers", count: applications.filter((a) => a.status === "OFFER").length },
    {
      id: "REJECTED",
      label: "Archived",
      count: applications.filter((a) => a.status === "REJECTED" || a.status === "WITHDRAWN").length,
    },
  ];

  // Filtered and sorted applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesQuery =
          app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus =
          selectedStatus === "ALL"
            ? true
            : selectedStatus === "REJECTED"
            ? app.status === "REJECTED" || app.status === "WITHDRAWN"
            : app.status === selectedStatus;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [applications, searchQuery, selectedStatus, sortOrder]);

  const kanbanColumns = [
    { id: "SAVED", label: "Saved", color: "bg-surface-container" },
    { id: "APPLIED", label: "Applied", color: "bg-primary-fixed-dim" },
    { id: "ONLINE_ASSESSMENT", label: "Assessments", color: "bg-secondary-container" },
    { id: "INTERVIEW", label: "Interviews", color: "bg-secondary" },
    { id: "OFFER", label: "Offer Received", color: "bg-tertiary-fixed" },
  ];

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Job Applications
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Track and manage your multi-stage company recruitment processes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-surface-container-lowest border border-[#cbd5e1] rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md flex items-center transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-surface-container text-primary font-semibold shadow-sm"
                  : "text-outline hover:text-on-surface"
              }`}
              title="Table View"
            >
              <MaterialIcon name="table_rows" className="text-[18px]" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md flex items-center transition-colors cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-surface-container text-primary font-semibold shadow-sm"
                  : "text-outline hover:text-on-surface"
              }`}
              title="Kanban Board View"
            >
              <MaterialIcon name="view_kanban" className="text-[18px]" />
            </button>
          </div>

          <Link href="/applications/new">
            <button className="h-9 px-space-md bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer">
              <MaterialIcon name="add" className="text-[18px]" />
              <span>New Application</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Quick Stats Mosaic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Active Pipeline
            </span>
            <div className="font-headline-md text-headline-md text-primary mt-0.5">
              {stats.active} In Flight
            </div>
            <span className="font-caption text-caption text-on-surface-variant">Across all recruiters</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <MaterialIcon name="trending_up" className="text-[22px]" />
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Interviews Ahead
            </span>
            <div className="font-headline-md text-headline-md text-secondary mt-0.5">
              {stats.interviews} Scheduled
            </div>
            <span className="font-caption text-caption text-secondary">Next: This week</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
            <MaterialIcon name="calendar_clock" className="text-[22px]" />
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Offers in Hand
            </span>
            <div className="font-headline-md text-headline-md text-tertiary mt-0.5">
              {stats.offers} Finalized
            </div>
            <span className="font-caption text-caption text-on-surface-variant">Decision pending</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
            <MaterialIcon name="verified" className="text-[22px]" />
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Avg Skill Match
            </span>
            <div className="font-headline-md text-headline-md text-on-surface mt-0.5">
              {stats.avgMatch}
            </div>
            <span className="font-caption text-caption text-tertiary font-semibold">+6% vs campus peer group</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-outline">
            <MaterialIcon name="psychology" className="text-[22px]" />
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Toolbar */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm space-y-space-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-space-md">
          {/* Search Box */}
          <div className="flex-1 flex items-center gap-space-sm h-10 px-3 rounded-lg bg-surface-container-low text-on-surface-variant focus-within:bg-surface-container-lowest focus-within:shadow-sm border border-transparent focus-within:border-primary-container transition-all">
            <MaterialIcon name="search" className="text-[20px] text-outline" />
            <input
              type="text"
              placeholder="Search by company, role title, or required skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-outline hover:text-on-surface">
                <MaterialIcon name="close" className="text-[16px]" />
              </button>
            )}
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex items-center gap-space-sm flex-wrap">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="h-10 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md border-0 outline-none cursor-pointer"
            >
              <option value="newest">Applied Date (Newest)</option>
              <option value="oldest">Applied Date (Oldest)</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("ALL");
              }}
              className="h-10 px-3 text-outline hover:text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors cursor-pointer"
            >
              <MaterialIcon name="restart_alt" className="text-[18px]" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Pill Tabs for Quick Pipeline Status Filtering */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-nowrap">
          {statusTabs.map((tab) => {
            const isSelected = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? "bg-white/20 text-white" : "bg-surface-container text-outline"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Content Area: Table View or Kanban View */}
      {viewMode === "table" ? (
        <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface-container text-outline flex items-center justify-center mx-auto">
                <MaterialIcon name="work_off" className="text-[24px]" />
              </div>
              <p className="font-label-md text-label-md text-on-surface font-semibold">
                No matching applications found
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
                Try adjusting your search keywords or switching to another status tab.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-surface-container-low/50 font-label-sm text-label-sm uppercase tracking-wider text-outline">
                    <th className="py-3 px-space-lg">Company & Role</th>
                    <th className="py-3 px-space-md">Stage</th>
                    <th className="py-3 px-space-md">Location</th>
                    <th className="py-3 px-space-md">Salary / PPO</th>
                    <th className="py-3 px-space-md">Applied Date</th>
                    <th className="py-3 px-space-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] font-body-sm text-body-sm">
                  {filteredApplications.map((app) => {
                    const statusCfg = STATUS_MAP[app.status as ApplicationStatus] || STATUS_MAP.APPLIED;
                    const companyInitial = app.companyName ? app.companyName.slice(0, 2).toUpperCase() : "CO";

                    return (
                      <tr
                        key={app.applicationId}
                        className="hover:bg-surface-container-low/40 transition-colors"
                      >
                        <td className="py-3.5 px-space-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                              {companyInitial}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                                {app.companyName}
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                                {app.jobTitle}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md">
                          <span
                            className={`font-label-sm text-label-sm px-2.5 py-0.5 rounded-full border ${statusCfg.colorClass}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-space-md text-on-surface-variant">
                          {app.location || "Hybrid"}
                        </td>
                        <td className="py-3.5 px-space-md text-on-surface font-medium">
                          {app.salary || "Competitive"}
                        </td>
                        <td className="py-3.5 px-space-md text-outline">
                          {formatDate(app.applicationDate)}
                        </td>
                        <td className="py-3.5 px-space-lg text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/applications/${app.applicationId}`}
                              className="h-8 px-2.5 rounded-lg border border-[#cbd5e1] hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              <span>Details</span>
                              <MaterialIcon name="chevron_right" className="text-[16px]" />
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${app.companyName} application?`)) {
                                  deleteApplication(app.applicationId);
                                }
                              }}
                              className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container transition-colors cursor-pointer"
                              title="Delete application"
                            >
                              <MaterialIcon name="delete" className="text-[18px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-md items-start">
          {kanbanColumns.map((col) => {
            const columnApps = filteredApplications.filter((a) => a.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-surface-container-low/70 rounded-xl p-space-md border border-[#e2e8f0] flex flex-col gap-space-sm min-h-[500px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                  <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-lowest text-outline font-semibold">
                    {columnApps.length}
                  </span>
                </div>

                <div className="space-y-space-sm flex-1">
                  {columnApps.length === 0 ? (
                    <div className="py-8 text-center text-outline font-caption text-caption">
                      No items
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <Link
                        key={app.applicationId}
                        href={`/applications/${app.applicationId}`}
                        className="block p-space-md rounded-xl bg-surface-container-lowest border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#cbd5e1] transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                            {app.companyName}
                          </span>
                          <span className="font-caption text-caption text-outline">
                            {formatDate(app.applicationDate)}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
                          {app.jobTitle}
                        </p>
                        {app.salary && (
                          <div className="mt-2 pt-2 border-t border-[#f1f5f9] flex items-center justify-between font-caption text-caption text-outline">
                            <span>{app.location || "Hybrid"}</span>
                            <span className="font-semibold text-primary">{app.salary}</span>
                          </div>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
