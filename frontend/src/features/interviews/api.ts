import { apiClient } from "@/lib/api-client";
import {
  Interview,
  CreateInterviewInput,
  UpdateInterviewInput,
} from "@/types/interview";

export interface InterviewsListResponse {
  items: Interview[];
}

export interface InterviewDetailResponse {
  interview: Interview;
}

export interface ListInterviewsParams {
  upcomingOnly?: boolean;
  limit?: number;
}

/**
 * Fetch chronological list of interviews from API Gateway
 */
export async function fetchInterviews(
  params?: ListInterviewsParams
): Promise<Interview[]> {
  const searchParams = new URLSearchParams();
  if (params?.upcomingOnly !== undefined) {
    searchParams.set("upcomingOnly", params.upcomingOnly ? "true" : "false");
  }
  if (params?.limit) {
    searchParams.set("limit", params.limit.toString());
  }

  const queryString = searchParams.toString();
  const endpoint = `/v1/interviews${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient.get<InterviewsListResponse>(endpoint);
  return response.items;
}

/**
 * Fetch a single interview by ID
 */
export async function fetchInterviewById(interviewId: string): Promise<Interview> {
  const response = await apiClient.get<InterviewDetailResponse>(
    `/v1/interviews/${encodeURIComponent(interviewId)}`
  );
  return response.interview;
}

/**
 * Schedule/create a new interview round linked to a target job application
 */
export async function createInterviewApi(
  input: CreateInterviewInput
): Promise<Interview> {
  const response = await apiClient.post<InterviewDetailResponse>(
    "/v1/interviews",
    input
  );
  return response.interview;
}

/**
 * Update an existing interview (round name, date, mode, notes)
 */
export async function updateInterviewApi(
  interviewId: string,
  input: UpdateInterviewInput
): Promise<Interview> {
  const response = await apiClient.patch<InterviewDetailResponse>(
    `/v1/interviews/${encodeURIComponent(interviewId)}`,
    input
  );
  return response.interview;
}

/**
 * Delete an interview round by ID
 */
export async function deleteInterviewApi(interviewId: string): Promise<void> {
  await apiClient.delete<void>(`/v1/interviews/${encodeURIComponent(interviewId)}`);
}
