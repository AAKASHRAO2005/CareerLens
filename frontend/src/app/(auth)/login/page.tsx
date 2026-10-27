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

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
    setAuthError(null);

    // Simulated auth delay for Phase 2 UI verification
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  const fillDemoAccount = () => {
    setValue("email", "student@example.com", { shouldValidate: true });
    setValue("password", "Placement@2026", { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
              <Compass className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-2xl">
              Career<span className="text-indigo-600">Lens</span>
            </span>
          </Link>
          <p className="text-sm text-slate-500">Sign in to your placement intelligence account</p>
        </div>

        {/* Demo Helper Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Evaluating the MVP?</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAccount}
            className="font-bold underline text-indigo-700 hover:text-indigo-900"
          >
            Fill Demo Credentials
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your student or job seeker credentials below</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {authError && (
                <Alert variant="danger">
                  {authError}
                </Alert>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="student@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Remember me
                </label>
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </a>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign In
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="text-center text-xs text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Register here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
