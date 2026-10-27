import { apiClient } from "@/lib/api-client";
import {
  ResumeMetadata,
  UploadIntentResponse,
  DownloadUrlResponse,
} from "@/types/resume";

export interface ResumesListResponse {
  items: ResumeMetadata[];
}

export interface ConfirmResumeResponse {
  resume: ResumeMetadata;
}

/**
 * Initiates secure resume upload by generating a short-lived presigned PUT URL
 */
export async function createUploadIntent(
  fileName: string,
  sizeBytes: number
): Promise<UploadIntentResponse> {
  return apiClient.post<UploadIntentResponse>("/v1/resumes/upload-intent", {
    fileName,
    contentType: "application/pdf",
    sizeBytes,
  });
}

/**
 * Directly uploads a binary PDF payload to Amazon S3 using the presigned URL
 */
export async function uploadFileToS3(
  uploadUrl: string,
  file: File | Blob
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": "application/pdf",
    },
  });

  if (!response.ok) {
    throw new Error(
      `S3 upload failed with status ${response.status}: ${response.statusText}`
    );
  }
}

/**
 * Confirms with backend that the object was written to S3 via HeadObject
 */
export async function confirmResumeUpload(
  resumeId: string
): Promise<ResumeMetadata> {
  const response = await apiClient.post<ConfirmResumeResponse>(
    `/v1/resumes/${encodeURIComponent(resumeId)}/confirm`,
    {}
  );
  return response.resume;
}

/**
 * Lists all stored resumes for the authenticated candidate
 */
export async function fetchResumes(): Promise<ResumeMetadata[]> {
  const response = await apiClient.get<ResumesListResponse>("/v1/resumes");
  return response.items;
}

/**
 * Retrieves a short-lived presigned GET download URL for secure viewing
 */
export async function fetchResumeDownloadUrl(
  resumeId: string
): Promise<DownloadUrlResponse> {
  return apiClient.get<DownloadUrlResponse>(
    `/v1/resumes/${encodeURIComponent(resumeId)}/download-url`
  );
}

/**
 * Deletes a resume from both private S3 bucket and DynamoDB metadata table
 */
export async function deleteResumeApi(resumeId: string): Promise<void> {
  await apiClient.delete<void>(`/v1/resumes/${encodeURIComponent(resumeId)}`);
}
