import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MockDataProvider } from "@/features/mock-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MockDataProvider>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-72 max-w-7xl w-full">
            {children}
          </main>
        </div>
      </div>
    </MockDataProvider>
  );
}
