"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { applicationSchema, ApplicationFormValues } from "@/schemas/application.schema";
import { useMockData } from "@/features/mock-context";

export default function NewApplicationPage() {
  const router = useRouter();
  const { addApplication } = useMockData();
  const [skillInput, setSkillInput] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "AWS",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workplaceMode, setWorkplaceMode] = useState<"Hybrid" | "Remote" | "On-site">("Hybrid");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: "",
      jobTitle: "",
      jobDescription: "",
      status: "APPLIED",
      applicationDate: new Date().toISOString().split("T")[0],
      notes: "",
      requiredSkills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
    },
  });

  const quickFillCompany = (name: string, role: string) => {
    setValue("companyName", name);
    setValue("jobTitle", role);
    setValue("notes", `Campus drive recruiter: placement@${name.toLowerCase().replace(/\s+/g, "")}.com`);
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!skillsList.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...skillsList, trimmed];
      setSkillsList(updated);
      setValue("requiredSkills", updated);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skillsList.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase());
    setSkillsList(updated);
    setValue("requiredSkills", updated);
  };

  const onSubmit = (data: ApplicationFormValues) => {
    setIsSubmitting(true);
    const created = addApplication({
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      jobDescription: data.jobDescription,
      requiredSkills: skillsList,
      status: data.status,
      applicationDate: data.applicationDate,
      notes: data.notes,
    });
    router.push(`/applications/${created.applicationId}`);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-space-lg">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/applications"
          className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors"
        >
          <MaterialIcon name="arrow_back" className="text-[18px]" />
          <span>Back to Applications</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-caption text-caption text-outline">Campus Drive 2025</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
            Draft
          </span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm p-space-xl sm:p-space-2xl flex flex-col gap-space-xl">
        {/* Title Header */}
        <div className="flex flex-col gap-1 border-b border-[#e2e8f0] pb-space-lg">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <MaterialIcon name="add_business" className="text-[20px]" />
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Add New Job Application
            </h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Track role requirements, interview pipeline milestones, and automatic skill match evaluations.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-space-xl">
          {/* Section 1: Company & Role Details */}
          <div className="flex flex-col gap-space-md">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              1. Target Company & Role Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {/* Company Name */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Company Name <span className="text-error">*</span>
                  </label>
                  <span className="font-caption text-caption text-tertiary flex items-center gap-0.5">
                    <MaterialIcon name="verified" className="text-[14px]" /> Verified Partner
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Stripe, TechNova, CloudPeak"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <span className="font-label-sm text-label-sm text-error font-medium">
                    {errors.companyName.message}
                  </span>
                )}

                {/* Quick Fills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="font-caption text-caption text-outline">Quick fill:</span>
                  <button
                    type="button"
                    onClick={() =>
                      quickFillCompany("TechNova Systems", "SWE I (Platform)")
                    }
                    className="px-2 py-0.5 rounded text-caption font-caption bg-surface-container hover:bg-surface-container-high text-primary font-medium transition-colors cursor-pointer"
                  >
                    TechNova
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      quickFillCompany("DataBridge Labs", "Backend Engineer")
                    }
                    className="px-2 py-0.5 rounded text-caption font-caption bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-medium transition-colors cursor-pointer"
                  >
                    DataBridge
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      quickFillCompany("CloudPeak AI", "Full Stack Developer")
                    }
                    className="px-2 py-0.5 rounded text-caption font-caption bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-medium transition-colors cursor-pointer"
                  >
                    CloudPeak
                  </button>
                </div>
              </div>

              {/* Job Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Job Title / Classification <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Graduate Software Engineer"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  {...register("jobTitle")}
                />
                {errors.jobTitle && (
                  <span className="font-label-sm text-label-sm text-error font-medium">
                    {errors.jobTitle.message}
                  </span>
                )}
                <span className="font-caption text-caption text-outline">
                  Syncs with campus department code MIT-EECS-2025
                </span>
              </div>
            </div>

            {/* Workplace mode & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Workplace Mode
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-lg text-label-md font-label-md">
                  {(["Hybrid", "Remote", "On-site"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWorkplaceMode(mode)}
                      className={`py-1.5 text-center rounded transition-all cursor-pointer ${
                        workplaceMode === mode
                          ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Office Location
                </label>
                <div className="relative">
                  <MaterialIcon
                    name="location_on"
                    className="absolute left-3 top-2.5 text-[18px] text-outline"
                  />
                  <input
                    type="text"
                    defaultValue="Boston, MA / Cambridge"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#cbd5e1] bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pipeline Stage & Application Date */}
          <div className="flex flex-col gap-space-md border-t border-[#e2e8f0] pt-space-lg">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              2. Pipeline Stage & Timeline
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Current Recruitment Status
                </label>
                <select
                  className="h-10 px-3 rounded-lg border border-[#cbd5e1] bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container cursor-pointer"
                  {...register("status")}
                >
                  <option value="SAVED">Saved (Bookmark)</option>
                  <option value="APPLIED">Applied (Resume Submitted)</option>
                  <option value="ONLINE_ASSESSMENT">Online Assessment (OA / Test)</option>
                  <option value="INTERVIEW">Interview Round (Technical / HR)</option>
                  <option value="OFFER">Offer Received (PPO / Offer Letter)</option>
                  <option value="REJECTED">Archived / Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
                {errors.status && (
                  <span className="font-label-sm text-label-sm text-error font-medium">
                    {errors.status.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Application Date
                </label>
                <input
                  type="date"
                  className="h-10 px-3 rounded-lg border border-[#cbd5e1] bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  {...register("applicationDate")}
                />
                {errors.applicationDate && (
                  <span className="font-label-sm text-label-sm text-error font-medium">
                    {errors.applicationDate.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Job Description & Extracted Skills */}
          <div className="flex flex-col gap-space-md border-t border-[#e2e8f0] pt-space-lg">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              3. Requirements & Target Skills
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Job Description / Eligibility Criteria
              </label>
              <textarea
                rows={4}
                placeholder="Paste job posting text, required qualifications, or key responsibilities..."
                className="w-full p-3 rounded-lg border border-[#cbd5e1] bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <span className="font-label-sm text-label-sm text-error font-medium">
                  {errors.jobDescription.message}
                </span>
              )}
            </div>

            {/* Skills Tag Editor */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Required Technical Skills (Used in Deterministic Gap Analysis)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Python, Docker, Kubernetes, GraphQL)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                  className="h-10 flex-1 px-3 rounded-lg border border-[#cbd5e1] bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="h-10 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <MaterialIcon name="add" className="text-[18px]" />
                  <span>Add Skill</span>
                </button>
              </div>

              {skillsList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-primary-fixed-dim text-primary font-label-sm text-label-sm font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="p-0.5 rounded-full hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
                      >
                        <MaterialIcon name="close" className="text-[14px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="flex flex-col gap-space-md border-t border-[#e2e8f0] pt-space-lg">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              4. Referral & Internal Notes
            </span>
            <textarea
              rows={3}
              placeholder="Referral alumni contact, interview preparation reminders, CTC structure..."
              className="w-full p-3 rounded-lg border border-[#cbd5e1] bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
              {...register("notes")}
            />
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-space-sm border-t border-[#e2e8f0] pt-space-lg">
            <Link href="/applications">
              <button
                type="button"
                className="h-10 px-space-lg rounded-lg border border-[#cbd5e1] hover:bg-surface-container text-on-surface font-label-md text-label-md font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-space-xl rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <MaterialIcon name="check" className="text-[18px]" />
              <span>{isSubmitting ? "Saving..." : "Save Application"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
