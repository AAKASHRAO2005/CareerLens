"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Compass, ArrowRight, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Please enter a valid email address"),
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const onSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Simulated auth delay for Phase 2 UI verification
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  const fillDemoAccount = () => {
    setValue("name", "Akash Sharma", { shouldValidate: true });
    setValue("email", "akash.new@student.university.edu", { shouldValidate: true });
    setValue("password", "Placement@2026", { shouldValidate: true });
    setValue("confirmPassword", "Placement@2026", { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
              <Compass className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-2xl">
              Career<span className="text-indigo-600">Lens</span>
            </span>
          </Link>
          <p className="text-sm text-slate-500">Create your account to start managing recruitment</p>
        </div>

        {/* Demo Helper Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Fast registration test?</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAccount}
            className="font-bold underline text-indigo-700 hover:text-indigo-900"
          >
            Pre-fill Form
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Get started with placement intelligence and skill analysis</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="danger">
                  {errorMessage}
                </Alert>
              )}

              <Input
                label="Full Name"
                placeholder="Akash Sharma"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="akash@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 8 chars, 1 uppercase, 1 digit"
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <p className="text-[11px] text-slate-500">
                Accounts are secured via Amazon Cognito User Pools with strict user isolation.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Register & Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="text-center text-xs text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
