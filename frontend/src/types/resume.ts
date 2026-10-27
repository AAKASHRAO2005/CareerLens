export type ResumeStatus = "PENDING_UPLOAD" | "READY";

export interface ResumeMetadata {
  resumeId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  status: ResumeStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadIntentResponse {
  resumeId: string;
  uploadUrl: string;
  method?: "PUT";
  requiredHeaders?: {
    "Content-Type": string;
  };
  expiresInSeconds: number;
}

export interface DownloadUrlResponse {
  resumeId: string;
  fileName?: string;
  downloadUrl: string;
  expiresInSeconds: number;
}

