import { ApplicationStatus } from "@/lib/formatters";

export interface DashboardRecentApplication {
  applicationId: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  applicationDate?: string;
  createdAt: string;
}

export interface DashboardUpcomingInterview {
  interviewId: string;
  applicationId: string;
  roundName: string;
  interviewDate: string;
  mode: string;
}

export interface DashboardSummary {
  totalApplications: number;
  activeInterviews: number;
  resumesCount: number;
  skillsCount: number;
  statusCounts: Record<ApplicationStatus, number>;
  recentApplications: DashboardRecentApplication[];
  upcomingInterviews: DashboardUpcomingInterview[];
}
