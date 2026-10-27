"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  CalendarCheck2,
  FileText,
  User,
  Compass,
} from "lucide-react";
import { useMockData } from "@/features/mock-context";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Applications", href: "/applications", icon: Briefcase },
  { label: "Skill Analyzer", href: "/skill-analyzer", icon: Sparkles },
  { label: "Interviews", href: "/interviews", icon: CalendarCheck2 },
  { label: "Resume Vault", href: "/resumes", icon: FileText },
  { label: "Profile & Skills", href: "/profile", icon: User },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { profile } = useMockData();

  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-30 bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center h-16 px-6 border-b border-slate-100 gap-2.5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white shadow-sm">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">
            Career<span className="text-indigo-600">Lens</span>
          </span>
          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">
            Placement Intel
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <Link href="/profile" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs group-hover:bg-indigo-200 transition-colors">
            {initials || "ST"}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
              {profile.displayName}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{profile.email}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
