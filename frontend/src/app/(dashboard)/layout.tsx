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
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 w-full md:pl-[260px] pt-16 bg-background">
            <div className="max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </MockDataProvider>
  );
}
