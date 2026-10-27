"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { normalizeSkill } from "@/lib/formatters";
import { useMockData } from "@/features/mock-context";

function SkillAnalyzerContent() {
  const searchParams = useSearchParams();
  const initialAppId = searchParams.get("applicationId") || "";

  const { applications, profile, updateProfile } = useMockData();
  const [selectedAppId, setSelectedAppId] = useState<string>(
    initialAppId || (applications.length > 0 ? applications[0].applicationId : "")
  );
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const selectedApplication = applications.find((app) => app.applicationId === selectedAppId);

  // Deterministic Matching Engine
  const analysisResult = useMemo(() => {
    if (!selectedApplication || !selectedApplication.requiredSkills.length) {
      return {
        hasRequiredSkills: false,
        matchedSkills: [] as string[],
        missingSkills: [] as string[],
        matchPercentage: 0,
      };
    }

    const normalizedProfileSkills = new Set(profile.skills.map((s) => normalizeSkill(s)));

    const matched: string[] = [];
    const missing: string[] = [];

    const seenNormalized = new Set<string>();
    const distinctRequired: string[] = [];
    for (const req of selectedApplication.requiredSkills) {
      const norm = normalizeSkill(req);
      if (!norm || seenNormalized.has(norm)) continue;
      seenNormalized.add(norm);
      distinctRequired.push(req.trim());
    }

    for (const reqSkill of distinctRequired) {
      const normalizedReq = normalizeSkill(reqSkill);
      if (normalizedProfileSkills.has(normalizedReq)) {
        matched.push(reqSkill);
      } else {
        missing.push(reqSkill);
      }
    }

    const percentage =
      distinctRequired.length > 0
        ? Math.round((matched.length / distinctRequired.length) * 100)
        : 0;

    return {
      hasRequiredSkills: true,
      matchedSkills: matched,
      missingSkills: missing,
      matchPercentage: percentage,
    };
  }, [selectedApplication, profile.skills]);

  const handleAddSkillToProfile = (skill: string) => {
    if (!profile.skills.includes(skill)) {
      updateProfile({ skills: [...profile.skills, skill] });
    }
  };

  const companyInitial = selectedApplication?.companyName
    ? selectedApplication.companyName.slice(0, 2).toUpperCase()
    : "TN";

  // SVG circle calculations for 0-100 gauge
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (analysisResult.matchPercentage / 100) * circumference;

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* 1. Header & Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm uppercase tracking-wider mb-0.5">
            <span>Career Readiness</span>
            <span>&bull;</span>
            <span>Placement Intelligence</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Skill Gap Analyzer
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Deterministic ATS keyword matching against institutional placement rubrics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-space-sm flex-wrap">
          {/* Target Application Dropdown */}
          <div className="relative inline-flex items-center bg-surface-container-lowest rounded-xl border border-[#cbd5e1] shadow-sm px-3 py-1.5 min-w-[260px]">
            <MaterialIcon name="corporate_fare" className="text-primary text-[20px] mr-2" />
            <div className="flex flex-col flex-1 min-w-0 pr-2">
              <span className="font-caption text-caption text-outline leading-none">
                Target Application
              </span>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="bg-transparent border-0 outline-none font-label-md text-label-md text-on-surface font-semibold truncate cursor-pointer p-0"
              >
                {applications.map((app) => (
                  <option key={app.applicationId} value={app.applicationId}>
                    {app.companyName} — {app.jobTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Link href="/profile">
            <button className="h-9 px-space-md bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-medium rounded-xl border border-[#cbd5e1] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
              <MaterialIcon name="tune" className="text-[18px] text-outline" />
              <span>Edit Skills ({profile.skills.length})</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Engine Disclaimer Banner */}
      {!bannerDismissed && (
        <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-md border border-[#e2e8f0] shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center flex-shrink-0 text-primary shadow-sm mt-0.5">
            <MaterialIcon name="verified" className="text-[20px]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Deterministic Match Protocol
              </span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                No LLM Hallucinations
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              This analysis objectively matches verifiable keywords and validated coursework against
              parsed role parameters. It does not synthesize hiring likelihoods or subjective scores.
            </p>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss banner"
            className="text-outline hover:text-on-surface p-1 rounded-lg transition-colors cursor-pointer"
          >
            <MaterialIcon name="close" className="text-[18px]" />
          </button>
        </div>
      )}

      {/* 3. 2-Column Split Layout */}
      {selectedApplication && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Main / Left Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
            {/* Target Role & Source Spec Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm p-space-xl flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-sm border-b border-[#e2e8f0]">
                <div className="flex items-center gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary font-headline-md text-headline-md font-bold shadow-sm flex-shrink-0">
                    {companyInitial}
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        {selectedApplication.companyName}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                        Tier 1 Placement
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {selectedApplication.jobTitle} • {selectedApplication.location || "Hybrid"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-1.5 rounded-lg border border-[#e2e8f0]">
                  <MaterialIcon name="description" className="text-[18px] text-primary" />
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-outline leading-tight">
                      Active Profile
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface font-medium truncate max-w-[160px]">
                      {profile.displayName || "Alex Rivera"}
                    </span>
                  </div>
                  <MaterialIcon name="check_circle" className="text-[16px] text-tertiary" />
                </div>
              </div>

              {/* Overall Match Summary Bar with Circular Gauge */}
              <div className="p-space-lg rounded-xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-lg">
                  <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        className="text-surface-dim"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        className="text-tertiary"
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-label-md text-label-md font-bold text-on-surface leading-none">
                        {analysisResult.matchPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Match Readiness Score
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {analysisResult.matchedSkills.length} of{" "}
                      {analysisResult.matchedSkills.length + analysisResult.missingSkills.length}{" "}
                      core requirements confirmed in candidate profile.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-surface-container-lowest text-primary font-label-sm text-label-sm font-semibold border border-primary-fixed-dim">
                    {analysisResult.matchPercentage >= 75
                      ? "High Alignment"
                      : analysisResult.matchPercentage >= 50
                      ? "Moderate Match"
                      : "Action Required"}
                  </span>
                </div>
              </div>

              {/* Matched Verified Skills */}
              <div className="flex flex-col gap-space-sm pt-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MaterialIcon name="check_circle" className="text-tertiary text-[20px]" />
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Matched Verified Skills ({analysisResult.matchedSkills.length})
                    </span>
                  </div>
                  <span className="font-caption text-caption text-tertiary font-semibold">
                    100% Verified
                  </span>
                </div>

                {analysisResult.matchedSkills.length === 0 ? (
                  <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                    No matching skills detected in your profile.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant border border-tertiary-fixed-dim font-label-sm text-label-sm font-semibold"
                      >
                        <MaterialIcon name="done" className="text-[14px]" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing ATS Keywords */}
              <div className="flex flex-col gap-space-sm pt-space-md border-t border-[#e2e8f0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MaterialIcon name="warning" className="text-secondary text-[20px]" />
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Missing ATS Keywords / Core Prerequisites ({analysisResult.missingSkills.length})
                    </span>
                  </div>
                  <span className="font-caption text-caption text-outline">
                    Click to add to profile
                  </span>
                </div>

                {analysisResult.missingSkills.length === 0 ? (
                  <div className="p-3 rounded-lg bg-tertiary-fixed/30 text-on-tertiary-fixed-variant font-body-sm text-body-sm flex items-center gap-2">
                    <MaterialIcon name="stars" className="text-[18px]" />
                    <span>Complete match! All target skills are declared in your profile.</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleAddSkillToProfile(skill)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-[#cbd5e1] hover:border-primary text-on-surface font-label-sm text-label-sm font-medium transition-colors cursor-pointer group"
                        title="Click to add to your profile skills"
                      >
                        <MaterialIcon
                          name="add"
                          className="text-[14px] text-outline group-hover:text-primary"
                        />
                        <span>{skill}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Recommended Coursework & ATS Checklist */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Recommended Coursework */}
            <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm p-space-xl flex flex-col gap-space-md">
              <div className="flex items-center gap-2 pb-1 border-b border-[#e2e8f0]">
                <MaterialIcon name="school" className="text-primary text-[20px]" />
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Campus Curriculum Bridge
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Recommended institutional courses mapped to these role requirements:
              </p>

              <div className="space-y-space-sm">
                <div className="p-space-md rounded-lg bg-surface-container-low border border-[#e2e8f0] flex flex-col gap-0.5">
                  <span className="font-label-sm text-label-sm text-primary font-bold">
                    6.824 • Distributed Systems
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Covers Raft consensus, RPC, fault tolerance, and cloud infra.
                  </span>
                </div>
                <div className="p-space-md rounded-lg bg-surface-container-low border border-[#e2e8f0] flex flex-col gap-0.5">
                  <span className="font-label-sm text-label-sm text-primary font-bold">
                    6.033 • Computer Systems Engineering
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Networking protocols, client-server models, security boundaries.
                  </span>
                </div>
              </div>
            </div>

            {/* ATS Compliance Checklist */}
            <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm p-space-xl flex flex-col gap-space-md">
              <div className="flex items-center gap-2 pb-1 border-b border-[#e2e8f0]">
                <MaterialIcon name="fact_check" className="text-tertiary text-[20px]" />
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Placement Checkpoints
                </span>
              </div>

              <div className="space-y-2 text-body-sm font-body-sm">
                <div className="flex items-center gap-2 text-on-surface">
                  <MaterialIcon name="check" className="text-tertiary text-[18px]" />
                  <span>Direct Campus Drive Applicant</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <MaterialIcon name="check" className="text-tertiary text-[18px]" />
                  <span>Standardized Single-Page PDF Format</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <MaterialIcon name="check" className="text-tertiary text-[18px]" />
                  <span>Verifiable Coursework Transcripts</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <MaterialIcon name="pending" className="text-outline text-[18px]" />
                  <span>Technical Assessment Scheduled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillAnalyzerPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-outline font-label-md text-label-md">
          Loading Skill Gap Analyzer...
        </div>
      }
    >
      <SkillAnalyzerContent />
    </Suspense>
  );
}
