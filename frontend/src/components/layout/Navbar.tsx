"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useMockData } from "@/features/mock-context";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { profile, applications, interviews } = useMockData();

  const appCount = applications?.length || 18;
  const upcomingInterviews = interviews?.filter((i) => i.status === "SCHEDULED")?.length || 2;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", iconName: "space_dashboard" },
    {
      label: "Applications",
      href: "/applications",
      iconName: "view_kanban",
      badge: appCount,
    },
    { label: "Skill Gap Analyzer", href: "/skill-analyzer", iconName: "insights" },
    {
      label: "Interviews",
      href: "/interviews",
      iconName: "event_available",
      badge: `${upcomingInterviews} upcoming`,
    },
    { label: "Resumes", href: "/resumes", iconName: "description" },
    { label: "Profile", href: "/profile", iconName: "person" },
  ];

  const initials = profile.displayName
    ? profile.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AR";

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("careerlens_auth_session");
      localStorage.removeItem("careerlens_auth_session");
    }
    router.push("/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 md:left-[260px] right-0 h-16 bg-[#ffffff] border-b border-[#e2e8f0] z-40 flex items-center justify-between px-space-md sm:px-space-xl">
        {/* Left: Mobile hamburger & Global Search */}
        <div className="flex items-center gap-space-md flex-1 max-w-xl">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-on-surface md:hidden"
            aria-label="Toggle navigation menu"
          >
            <MaterialIcon name={mobileOpen ? "close" : "menu"} className="text-[22px]" />
          </button>

          <div className="flex items-center gap-space-sm w-full max-w-md h-9 px-3 rounded-lg border border-[#cbd5e1] bg-surface-container-lowest text-on-surface-variant focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container transition-all">
            <MaterialIcon name="search" className="text-[18px] text-outline" />
            <input
              type="text"
              placeholder="Search applications, skills, companies..."
              className="w-full bg-transparent border-0 outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant"
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 font-label-sm text-label-sm text-outline font-semibold bg-surface-container-low border border-outline-variant rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {/* Season Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant text-on-surface-variant font-label-sm text-label-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>MIT Tech Placement 2025</span>
          </div>

          {/* Quick Add Button */}
          <Link href="/applications/new">
            <button className="h-9 px-3 sm:px-space-md bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer">
              <MaterialIcon name="add" className="text-[18px]" />
              <span className="hidden sm:inline">Quick Add</span>
            </button>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              aria-label="Notifications"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#cbd5e1] hover:bg-surface-container-low text-on-surface-variant transition-colors relative cursor-pointer"
            >
              <MaterialIcon name="notifications" className="text-[20px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
            </button>
          </div>

          <div className="hidden sm:block h-6 w-px bg-[#e2e8f0]" />

          {/* User Avatar */}
          <Link href="/profile" className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-xs ring-1 ring-outline-variant hover:opacity-90 transition-opacity">
              {initials}
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#f8fafc] pb-4 pt-5 shadow-2xl border-r border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 pb-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
                  <MaterialIcon name="explore" className="text-[20px]" />
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  CareerLens
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1 text-outline hover:bg-surface-container"
              >
                <MaterialIcon name="close" className="text-[20px]" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 font-label-md text-label-md rounded-xl transition-colors",
                      isActive
                        ? "bg-surface-container-high text-primary font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MaterialIcon name={item.iconName} className="text-[20px]" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#e2e8f0] flex items-center justify-between">
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-xs">
                  {initials}
                </div>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  {profile.displayName || "Alex Rivera"}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-1 rounded-lg text-outline hover:text-error transition-colors"
                title="Sign Out"
              >
                <MaterialIcon name="logout" className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
