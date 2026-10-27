"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Please enter a valid campus email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"student" | "recruiter">("student");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "careerlens_auth_session",
        JSON.stringify({
          isAuthenticated: true,
          email: data.email,
          displayName: data.name,
          role,
        })
      );
    }
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  const fillDemoAccount = () => {
    setValue("name", "Akash Sharma", { shouldValidate: true });
    setValue("email", "akash.sharma@mit.edu", { shouldValidate: true });
    setValue("password", "Placement@2025", { shouldValidate: true });
    setValue("confirmPassword", "Placement@2025", { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
        {/* Left Column: Platform Overview & Value Prop (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
              <MaterialIcon name="explore" className="text-[22px]" />
            </div>
            <span className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
              CareerLens
            </span>
            <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-primary font-medium border border-primary-fixed-dim">
              Beta
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-semibold leading-tight">
              Join Your Campus Placement Workspace
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Centralized recruitment tracking, S3 encrypted resume storage, and deterministic skill
              matching engineered for students and universities.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-[#e2e8f0] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-container text-primary flex items-center justify-center flex-shrink-0">
                <MaterialIcon name="school" className="text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Institutional Integration
                </span>
                <span className="font-caption text-caption text-on-surface-variant">
                  Direct connection with university registrar & placement office
                </span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-[#e2e8f0] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center flex-shrink-0">
                <MaterialIcon name="verified" className="text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  No LLM Hallucinations
                </span>
                <span className="font-caption text-caption text-on-surface-variant">
                  Transparent, verifiable keyword analysis against ATS parameters
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Card (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-md p-space-xl sm:p-space-2xl flex flex-col gap-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                  Candidate Registration
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Create your verified student placement profile
                </p>
              </div>

              <button
                type="button"
                onClick={fillDemoAccount}
                className="self-start sm:self-auto inline-flex items-center gap-1 px-3 py-1 bg-surface-container text-primary hover:bg-surface-container-high rounded-full font-label-sm text-label-sm font-semibold transition-colors cursor-pointer border border-primary-fixed-dim"
              >
                <MaterialIcon name="bolt" className="text-[16px]" />
                <span>Pre-Fill Demo Data</span>
              </button>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-surface-container rounded-lg gap-1">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md font-label-md text-label-md transition-all cursor-pointer ${
                  role === "student"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <MaterialIcon name="school" className="text-[18px]" />
                <span>Student / Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md font-label-md text-label-md transition-all cursor-pointer ${
                  role === "recruiter"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <MaterialIcon name="domain" className="text-[18px]" />
                <span>Recruiter / Placement</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Akash Sharma"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  {...register("name")}
                />
                {errors.name && (
                  <span className="font-label-sm text-label-sm text-error font-medium">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Campus / Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="student@mit.edu"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="font-label-sm text-label-sm text-error font-medium">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    {...register("password")}
                  />
                  {errors.password && (
                    <span className="font-label-sm text-label-sm text-error font-medium">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <span className="font-label-sm text-label-sm text-error font-medium">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 mt-2 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <span>{isLoading ? "Creating Profile..." : "Create Placement Account"}</span>
                <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </button>
            </form>

            <p className="text-center font-body-sm text-body-sm text-on-surface-variant pt-2 border-t border-[#e2e8f0]">
              Already registered?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in to Campus Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
