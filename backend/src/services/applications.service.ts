import crypto from "crypto";
import { ApplicationRepository } from "../repositories/applications.repo.js";
import { InterviewRepository } from "../repositories/interviews.repo.js";
import { AuthUser, ApplicationRecord, ApplicationStatus } from "../types/backend.types.js";
import { CreateApplicationInput, UpdateApplicationInput } from "../schemas/application.schema.js";

export const ApplicationService = {
  async createApplication(
    user: AuthUser,
    input: CreateApplicationInput
  ): Promise<ApplicationRecord> {
    const applicationId = `app-uuid-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const status: ApplicationStatus = input.status || "APPLIED";

    const record: ApplicationRecord = {
      PK: `USER#${user.userId}`,
      SK: `APP#${applicationId}`,
      entityType: "APPLICATION",
      applicationId,
      companyName: input.companyName.trim(),
      jobTitle: input.jobTitle.trim(),
      jobDescription: input.jobDescription?.trim() || "",
      requiredSkills: input.requiredSkills || [],
      status,
      applicationDate: input.applicationDate || now.split("T")[0],
      notes: input.notes?.trim() || "",
      createdAt: now,
      updatedAt: now,
      GSI1PK: `USER#${user.userId}#STATUS#${status}`,
      GSI1SK: `${now}#APP#${applicationId}`,
      GSI2PK: `USER#${user.userId}#APPLICATIONS`,
      GSI2SK: `${now}#APP#${applicationId}`,
    };

    await ApplicationRepository.createApplication(record);
    return record;
  },

  async getApplication(
    user: AuthUser,
    applicationId: string
  ): Promise<ApplicationRecord | null> {
    return ApplicationRepository.getApplication(user.userId, applicationId);
  },

  async listApplications(
    user: AuthUser,
    status?: string,
    limit?: number,
    cursor?: string
  ): Promise<{ items: ApplicationRecord[]; nextCursor: string | null }> {
    return ApplicationRepository.listApplications(user.userId, status, limit, cursor);
  },

  async updateApplication(
    user: AuthUser,
    applicationId: string,
    input: UpdateApplicationInput
  ): Promise<ApplicationRecord | null> {
    const now = new Date().toISOString();
    return ApplicationRepository.updateApplication(user.userId, applicationId, input, now);
  },

  async deleteApplication(
    user: AuthUser,
    applicationId: string
  ): Promise<boolean> {
    const deleted = await ApplicationRepository.deleteApplication(user.userId, applicationId);
    if (deleted) {
      // Cascading cleanup of linked interviews
      await InterviewRepository.deleteInterviewsByApplication(user.userId, applicationId);
    }
    return deleted;
  },
};

