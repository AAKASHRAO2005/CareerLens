import { apiClient } from "@/lib/api-client";
import {
  JobApplication,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@/types/application";

export interface ApplicationsListResponse {
  items: JobApplication[];
  nextCursor: string | null;
}

export interface ApplicationDetailResponse {
  application: JobApplication;
}

export interface ListApplicationsParams {
  status?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Fetch list of job applications from API Gateway (with optional status filter & cursor pagination)
 */
export async function fetchApplications(
  params?: ListApplicationsParams
): Promise<ApplicationsListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== "ALL") {
    searchParams.set("status", params.status);
  }
  if (params?.limit) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params?.cursor) {
    searchParams.set("cursor", params.cursor);
  }

  const queryString = searchParams.toString();
  const endpoint = `/v1/applications${queryString ? `?${queryString}` : ""}`;
  return apiClient.get<ApplicationsListResponse>(endpoint);
}

/**
 * Fetch a single application by ID
 */
export async function fetchApplicationById(applicationId: string): Promise<JobApplication> {
  const response = await apiClient.get<ApplicationDetailResponse>(
    `/v1/applications/${encodeURIComponent(applicationId)}`
  );
  return response.application;
}

/**
 * Create a new application
 */
export async function createApplicationApi(
  input: CreateApplicationInput
): Promise<JobApplication> {
  const response = await apiClient.post<ApplicationDetailResponse>(
    "/v1/applications",
    input
  );
  return response.application;
}

/**
 * Update an existing application
 */
export async function updateApplicationApi(
  applicationId: string,
  input: UpdateApplicationInput
): Promise<JobApplication> {
  const response = await apiClient.patch<ApplicationDetailResponse>(
    `/v1/applications/${encodeURIComponent(applicationId)}`,
    input
  );
  return response.application;
}

/**
 * Delete an application by ID
 */
export async function deleteApplicationApi(applicationId: string): Promise<void> {
  await apiClient.delete<void>(`/v1/applications/${encodeURIComponent(applicationId)}`);
}
