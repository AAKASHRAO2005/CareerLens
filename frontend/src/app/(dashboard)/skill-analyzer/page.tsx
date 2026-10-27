"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { normalizeSkill } from "@/lib/formatters";
import { useMockData } from "@/features/mock-context";

function SkillAnalyzerContent() {
  const searchParams = useSearchParams();
  const initialAppId = searchParams.get("applicationId") || "";

  const { applications, profile } = useMockData();
  const [selectedAppId, setSelectedAppId] = useState<string>(
    initialAppId || (applications.length > 0 ? applications[0].applicationId : "")
  );

  const selectedApplication = applications.find((app) => app.applicationId === selectedAppId);

  // Deterministic Skill Matching Engine
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

    // Deduplicate required skills by normalized form
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Skill-Gap Analyzer
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Evaluate your declared profile readiness against target job requirements with transparent, explainable matching.
          </p>
        </div>

        <Link href="/profile">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Update Profile Skills ({profile.skills.length})
          </Button>
        </Link>
      </div>

      <Alert variant="info" title="Deterministic Match Aid">
        This is a rule-based skill comparison to assist your interview preparation, not a predictive hiring probability or black-box AI score.
      </Alert>

      {/* Target Application Selector */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Select Target Role</CardTitle>
          <CardDescription>
            Choose any tracked application to calculate matched and missing skills in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
              No applications available.{" "}
              <Link href="/applications/new" className="text-indigo-600 font-semibold underline">
                Add an application
              </Link>{" "}
              to run skill analysis.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {applications.map((app) => (
                  <option key={app.applicationId} value={app.applicationId}>
                    {app.companyName} — {app.jobTitle} ({app.requiredSkills.length} skills required)
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results Display */}
      {selectedApplication && (
        <div className="space-y-6">
          {/* Match Score Card */}
          <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Target Role
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {selectedApplication.jobTitle} at {selectedApplication.companyName}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Skill Alignment
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600">
                      {analysisResult.hasRequiredSkills
                        ? `${analysisResult.matchPercentage}%`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {analysisResult.hasRequiredSkills ? (
                <div className="space-y-2">
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        analysisResult.matchPercentage >= 75
                          ? "bg-emerald-500"
                          : analysisResult.matchPercentage >= 50
                          ? "bg-indigo-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${analysisResult.matchPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {analysisResult.matchedSkills.length} of{" "}
                      {selectedApplication.requiredSkills.length} required skills matched
                    </span>
                    <span className="font-semibold text-slate-700">
                      Method: NORMALIZED_SKILL_MATCH
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  This job application does not have any required skills recorded. Edit the application to add required skills for matching.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Breakdown: Matched vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <Card className="border-emerald-200/80">
              <CardHeader className="py-4 bg-emerald-50/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matched Skills ({analysisResult.matchedSkills.length})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <p className="text-xs text-slate-500">
                  Skills declared in your profile that directly satisfy the role requirements:
                </p>
                {analysisResult.matchedSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    None of the required skills currently match your profile.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {analysisResult.matchedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="success"
                        className="py-1 px-3 text-xs font-semibold"
                      >
                        ✓ {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Missing Skills */}
            <Card className="border-rose-200/80">
              <CardHeader className="py-4 bg-rose-50/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Missing Skills ({analysisResult.missingSkills.length})</span>
                  </div>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-indigo-600">
                      Add to profile
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <p className="text-xs text-slate-500">
                  Required skills not yet declared in your inventory (priority preparation focus):
                </p>
                {analysisResult.missingSkills.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-medium py-2">
                    Great news! You have declared all required skills for this application.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {analysisResult.missingSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="danger"
                        className="py-1 px-3 text-xs font-semibold"
                      >
                        ✕ {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillAnalyzerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading Skill Analyzer...</div>}>
      <SkillAnalyzerContent />
    </Suspense>
  );
}
