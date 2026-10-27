"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid campus email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"student" | "recruiter">("student");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async () => {
    setIsLoading(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "careerlens_auth_session",
        JSON.stringify({
          isAuthenticated: true,
          email: "arivera@mit.edu",
          displayName: "Alex Rivera",
          role,
        })
      );
    }
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 500);
  };

  const fillDemoAccount = () => {
    setValue("email", "arivera@mit.edu", { shouldValidate: true });
    setValue("password", "Placement@2025", { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
        {/* Left Column: Platform Overview & Testimonial (5 cols) */}
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
              Institutional Placement &amp; Career Intelligence
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Centralized recruitment tracker with verifiable transcripts, direct S3 vault storage,
              and deterministic skill gap analysis for students and campus recruiters.
            </p>
          </div>

          {/* Testimonial Card */}
          <div className="p-space-lg bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-xs flex-shrink-0">
                  AR
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Alex Rivera
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    MIT Course 6-3 • Class of 2025
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full font-label-sm text-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                Offer Accepted
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant italic leading-relaxed">
              “Landed TechNova Systems Platform SWE ($160k package) within 2 weeks of the campus drive.
              Attested coursework transcripts and skill matches made application reviews instantaneous.”
            </p>
          </div>

          <div className="flex items-center justify-between text-on-surface-variant font-caption text-caption pt-1">
            <span className="flex items-center gap-1">
              <MaterialIcon name="account_balance" className="text-[16px] text-primary" />
              Partnered with MIT EECS Placement Office
            </span>
            <span>99.98% SSO Uptime</span>
          </div>
        </div>

        {/* Right Column: Institutional Sign-In Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-md p-space-xl sm:p-space-2xl flex flex-col gap-space-lg">
            {/* Header with Quick Fill Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                  Institutional Sign-In
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Access your verified campus workspace and recruiter pipelines
                </p>
              </div>

              <button
                type="button"
                onClick={fillDemoAccount}
                className="self-start sm:self-auto inline-flex items-center gap-1 px-3 py-1 bg-surface-container text-primary hover:bg-surface-container-high rounded-full font-label-sm text-label-sm font-semibold transition-colors cursor-pointer border border-primary-fixed-dim"
              >
                <MaterialIcon name="bolt" className="text-[16px]" />
                <span>Quick-Fill Demo (Alex Rivera)</span>
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

            {/* SSO Touchstone Button */}
            <div className="flex flex-col gap-space-sm">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="w-full flex items-center justify-between px-space-lg py-space-md bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary rounded-lg font-label-md text-label-md transition-all shadow-sm group cursor-pointer"
              >
                <div className="flex items-center gap-space-md">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center">
                    <MaterialIcon name="token" className="text-[20px] text-on-primary" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-label-md text-label-md font-semibold leading-none">
                      Continue with MIT Kerberos (Touchstone)
                    </span>
                    <span className="font-caption text-caption text-on-primary/80 mt-0.5">
                      Single Sign-On with Duo 2FA Hardware Keys
                    </span>
                  </div>
                </div>
                <MaterialIcon
                  name="arrow_forward"
                  className="text-[20px] group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full h-px bg-[#e2e8f0]" />
              <span className="absolute bg-surface-container-lowest px-space-md font-caption text-caption text-outline uppercase tracking-wider">
                or sign in with verified credentials
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Institutional Email
                </label>
                <div className="relative">
                  <MaterialIcon
                    name="mail"
                    className="absolute left-3 top-2.5 text-[18px] text-outline"
                  />
                  <input
                    type="email"
                    placeholder="username@mit.edu"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <span className="font-label-sm text-label-sm text-error font-medium">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Master Password
                  </label>
                  <a href="#" className="font-label-sm text-label-sm text-primary hover:underline">
                    Reset Password
                  </a>
                </div>
                <div className="relative">
                  <MaterialIcon
                    name="lock"
                    className="absolute left-3 top-2.5 text-[18px] text-outline"
                  />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <span className="font-label-sm text-label-sm text-error font-medium">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 mt-2 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <span>{isLoading ? "Authenticating..." : "Sign In to CareerLens"}</span>
                <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </button>
            </form>

            <p className="text-center font-body-sm text-body-sm text-on-surface-variant pt-2 border-t border-[#e2e8f0]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Register as Candidate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
