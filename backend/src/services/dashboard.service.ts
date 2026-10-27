import { ApplicationRepository } from "../repositories/applications.repo.js";
import { ProfileRepository } from "../repositories/dynamodb.repo.js";
import { InterviewRepository } from "../repositories/interviews.repo.js";
import { ResumeRepository } from "../repositories/resumes.repo.js";
import { AuthUser, ApplicationStatus } from "../types/backend.types.js";

export interface DashboardSummaryData {
  totalApplications: number;
  activeInterviews: number;
  resumesCount: number;
  skillsCount: number;
  statusCounts: Record<ApplicationStatus, number>;
  recentApplications: Array<{
    applicationId: string;
    companyName: string;
    jobTitle: string;
    status: ApplicationStatus;
    applicationDate?: string;
    createdAt: string;
  }>;
  upcomingInterviews: Array<{
    interviewId: string;
    applicationId: string;
    companyName?: string;
    jobTitle?: string;
    roundName: string;
    interviewDate: string;
    mode: string;
  }>;
}

export const DashboardService = {
  async getDashboardSummary(user: AuthUser): Promise<DashboardSummaryData> {
    // 1. Fetch applications for candidate via GSI2
    const { items: applications } = await ApplicationRepository.listApplications(
      user.userId,
      undefined,
      50
    );

    // 2. Fetch candidate's profile to count skills
    const profile = await ProfileRepository.getProfile(user.userId);
    const skillsCount = profile?.skills ? profile.skills.length : 0;

    // 3. Aggregate application counts by status
    const statusCounts: Record<ApplicationStatus, number> = {
      SAVED: 0,
      APPLIED: 0,
      ONLINE_ASSESSMENT: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    for (const app of applications) {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    }

    // 4. Extract top 5 recent applications
    const recentApplications = applications.slice(0, 5).map((app) => ({
      applicationId: app.applicationId,
      companyName: app.companyName,
      jobTitle: app.jobTitle,
      status: app.status,
      applicationDate: app.applicationDate,
      createdAt: app.createdAt,
    }));

    // 5. Query upcoming interviews via GSI3 (chronological, earliest upcoming first)
    const upcomingRecords = await InterviewRepository.listInterviews(user.userId, true, 5);
    const upcomingInterviews = upcomingRecords.map((int) => ({
      interviewId: int.interviewId,
      applicationId: int.applicationId,
      companyName: int.companyName,
      jobTitle: int.jobTitle,
      roundName: int.roundName,
      interviewDate: int.interviewDate,
      mode: int.mode,
    }));

    // 6. Query candidate's stored resumes
    const resumes = await ResumeRepository.listResumeMetadata(user.userId);
    const readyResumes = resumes.filter((r) => r.status === "READY");

    // Active interviews is either interviews in stage or upcoming rounds
    const activeInterviews = Math.max(statusCounts.INTERVIEW, upcomingInterviews.length);

    return {
      totalApplications: applications.length,
      activeInterviews,
      resumesCount: readyResumes.length,
      skillsCount,
      statusCounts,
      recentApplications,
      upcomingInterviews,
    };
  },
};

