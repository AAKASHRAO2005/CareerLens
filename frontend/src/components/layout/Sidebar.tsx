"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useMockData } from "@/features/mock-context";

export interface NavItem {
  label: string;
  href: string;
  iconName: string;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, applications, interviews } = useMockData();

  const appCount = applications?.length || 18;
  const upcomingInterviews = interviews?.filter((i) => i.status === "SCHEDULED")?.length || 2;

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", iconName: "space_dashboard" },
    {
      label: "Applications",
      href: "/applications",
      iconName: "view_kanban",
      badge: appCount,
      badgeColor: "bg-surface-container text-on-surface-variant",
    },
    {
      label: "Skill Gap Analyzer",
      href: "/skill-analyzer",
      iconName: "insights",
    },
    {
      label: "Interviews",
      href: "/interviews",
      iconName: "event_available",
      badge: `${upcomingInterviews} upcoming`,
      badgeColor: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    },
    { label: "Resumes", href: "/resumes", iconName: "description" },
    { label: "Profile", href: "/profile", iconName: "person" },
  ];

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("careerlens_auth_session");
      localStorage.removeItem("careerlens_auth_session");
    }
    router.push("/login");
  };

  const initials = profile.displayName
    ? profile.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AR";

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#f8fafc] border-r border-[#e2e8f0] z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-16 px-space-lg flex items-center gap-space-sm border-b border-[#e2e8f0]">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm flex-shrink-0">
            <MaterialIcon name="explore" className="text-[20px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate">
                CareerLens
              </span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-primary font-medium border border-primary-fixed-dim">
                Beta
              </span>
            </div>
            <span className="font-caption text-caption text-on-surface-variant truncate">
              Campus Edition
            </span>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-space-md py-space-sm">
          <div className="flex items-center justify-between px-space-sm py-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Workspace
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-space-md space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-space-md py-2 rounded-xl transition-colors font-label-md text-label-md group",
                  isActive
                    ? "bg-surface-container-high text-primary font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <div className="flex items-center gap-space-md">
                  <MaterialIcon
                    name={item.iconName}
                    className={cn(
                      "text-[20px] transition-colors",
                      isActive ? "text-primary" : "text-outline group-hover:text-on-surface"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "font-label-sm text-label-sm px-1.5 py-0.5 rounded font-medium",
                      item.badgeColor || "bg-surface-container text-on-surface-variant"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Footer */}
      <div className="p-space-md border-t border-[#e2e8f0] bg-surface-container-lowest">
        <div className="flex items-center justify-between gap-space-sm p-space-sm rounded-xl hover:bg-surface-container-low transition-colors">
          <Link href="/profile" className="flex items-center gap-space-sm min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                {profile.displayName || "Alex Rivera"}
              </span>
              <span className="font-caption text-caption text-on-surface-variant truncate">
                {profile.university || "MIT"} • Class of 2025
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-0.5 text-on-surface-variant">
            <Link
              href="/profile"
              aria-label="Settings"
              className="p-1 rounded-lg hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <MaterialIcon name="settings" className="text-[18px]" />
            </Link>
            <button
              onClick={handleSignOut}
              aria-label="Logout"
              className="p-1 rounded-lg hover:text-error hover:bg-error-container transition-colors cursor-pointer"
            >
              <MaterialIcon name="logout" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
