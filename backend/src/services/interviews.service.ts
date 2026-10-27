import crypto from "crypto";
import { InterviewRepository } from "../repositories/interviews.repo.js";
import { ApplicationRepository } from "../repositories/applications.repo.js";
import { AuthUser, InterviewRecord, InterviewMode } from "../types/backend.types.js";
import { CreateInterviewInput, UpdateInterviewInput } from "../schemas/interview.schema.js";

export class ApplicationNotFoundException extends Error {
  constructor(message = "Referenced job application not found or inaccessible.") {
    super(message);
    this.name = "ApplicationNotFoundException";
  }
}

export const InterviewService = {
  async createInterview(
    user: AuthUser,
    input: CreateInterviewInput
  ): Promise<InterviewRecord> {
    // 1. Strict Ownership & Existence Check: Application must belong to user
    const application = await ApplicationRepository.getApplication(
      user.userId,
      input.applicationId
    );
    if (!application) {
      throw new ApplicationNotFoundException(
        `Job application '${input.applicationId}' does not exist or does not belong to you.`
      );
    }

    const interviewId = `int-uuid-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const mode: InterviewMode = input.mode || "ONLINE";

    const record: InterviewRecord = {
      PK: `USER#${user.userId}`,
      SK: `INTERVIEW#${interviewId}`,
      entityType: "INTERVIEW",
      interviewId,
      applicationId: input.applicationId,
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      roundName: input.roundName.trim(),
      interviewDate: input.interviewDate,
      mode,
      notes: input.notes?.trim() || "",
      createdAt: now,
      updatedAt: now,
      GSI3PK: `USER#${user.userId}#INTERVIEWS`,
      GSI3SK: `${input.interviewDate}#INTERVIEW#${interviewId}`,
    };

    await InterviewRepository.createInterview(record);
    return record;
  },

  async getInterview(
    user: AuthUser,
    interviewId: string
  ): Promise<InterviewRecord | null> {
    return InterviewRepository.getInterview(user.userId, interviewId);
  },

  async listInterviews(
    user: AuthUser,
    upcomingOnly = false,
    limit = 50
  ): Promise<InterviewRecord[]> {
    return InterviewRepository.listInterviews(user.userId, upcomingOnly, limit);
  },

  async listInterviewsByApplication(
    user: AuthUser,
    applicationId: string
  ): Promise<InterviewRecord[]> {
    return InterviewRepository.listInterviewsByApplication(user.userId, applicationId);
  },

  async updateInterview(
    user: AuthUser,
    interviewId: string,
    input: UpdateInterviewInput
  ): Promise<InterviewRecord | null> {
    const now = new Date().toISOString();
    return InterviewRepository.updateInterview(user.userId, interviewId, input, now);
  },

  async deleteInterview(
    user: AuthUser,
    interviewId: string
  ): Promise<boolean> {
    return InterviewRepository.deleteInterview(user.userId, interviewId);
  },
};
