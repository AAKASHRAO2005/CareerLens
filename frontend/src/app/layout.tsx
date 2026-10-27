import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerLens — Placement Intelligence Platform",
  description: "A centralized, serverless platform for tracking job applications, evaluating skill gaps, and managing placement preparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary">
        {children}
      </body>
    </html>
  );
}
