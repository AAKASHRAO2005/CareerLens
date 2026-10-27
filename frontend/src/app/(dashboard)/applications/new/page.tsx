"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Briefcase, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { applicationSchema, ApplicationFormValues } from "@/schemas/application.schema";
import { useMockData } from "@/features/mock-context";

export default function NewApplicationPage() {
  const router = useRouter();
  const { addApplication } = useMockData();
  const [skillInput, setSkillInput] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      requiredSkills: [],
    },
  });

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Placement Record</span>
          </div>
          <CardTitle className="text-xl">Create Job Application</CardTitle>
          <CardDescription>
            Enter role details and target requirements for tracking and skill matching.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                placeholder="e.g. Acme Cloud Corp"
                error={errors.companyName?.message}
                {...register("companyName")}
              />
              <Input
                label="Job Title / Role"
                placeholder="e.g. Junior Software Engineer"
                error={errors.jobTitle?.message}
                {...register("jobTitle")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Recruitment Stage
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register("status")}
                >
                  <option value="SAVED">Saved</option>
                  <option value="APPLIED">Applied</option>
                  <option value="ONLINE_ASSESSMENT">Online Assessment</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
                {errors.status && (
                  <p className="text-xs text-rose-600 font-medium">{errors.status.message}</p>
                )}
              </div>
              <Input
                label="Application Date"
                type="date"
                error={errors.applicationDate?.message}
                {...register("applicationDate")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Job Description
              </label>
              <textarea
                rows={4}
                placeholder="Paste job description, responsibilities, or eligibility requirements..."
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <p className="text-xs text-rose-600 font-medium">
                  {errors.jobDescription.message}
                </p>
              )}
            </div>

            {/* Required Skills Tag Editor */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Required Skills
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add required skill (e.g. Python, SQL, AWS, Docker)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                  className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {skillsList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {skillsList.map((skill) => (
                    <Badge
                      key={skill}
                      variant="neutral"
                      className="gap-1.5 py-1 px-3 text-xs font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="rounded-full hover:bg-slate-200 p-0.5 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-500">
                These skills will be matched against your profile in the Skill-Gap Analyzer.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Personal Notes
              </label>
              <textarea
                rows={3}
                placeholder="Referral contact, application link, notes..."
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register("notes")}
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <Link href="/applications">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              <Plus className="w-4 h-4 mr-1" />
              Save Application
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
