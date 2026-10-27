"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Compass, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NAV_ITEMS } from "./Sidebar";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Find current active item title
  const activeItem = NAV_ITEMS.find((item) =>
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href)
  );

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6 md:pl-72">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
              {activeItem?.label || "CareerLens"}
            </h1>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/applications/new">
            <Button size="sm" className="hidden sm:inline-flex">
              <Plus className="w-4 h-4" />
              New Application
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" title="Sign out / switch account">
              <LogOut className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pb-4 pt-5 shadow-xl">
            <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-base">
                  Career<span className="text-indigo-600">Lens</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 pt-2">
              <Link href="/applications/new" onClick={() => setMobileOpen(false)}>
                <Button className="w-full justify-center">
                  <Plus className="w-4 h-4" />
                  New Application
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
