import crypto from "crypto";
import { ResumeRepository, RESUME_BUCKET } from "../repositories/resumes.repo.js";
import { AuthUser, ResumeRecord } from "../types/backend.types.js";
import { UploadIntentInput, MAX_RESUME_SIZE_BYTES } from "../schemas/resume.schema.js";

export interface UploadIntentResult {
  resumeId: string;
  uploadUrl: string;
  s3Key: string;
  expiresInSeconds: number;
  requiredHeaders: {
    "Content-Type": string;
  };
}

export interface DownloadUrlResult {
  resumeId: string;
  fileName: string;
  downloadUrl: string;
  expiresInSeconds: number;
}

export class ResumeNotFoundException extends Error {
  constructor(message = "Resume not found or inaccessible.") {
    super(message);
    this.name = "ResumeNotFoundException";
  }
}

export class ResumeNotVerifiedException extends Error {
  constructor(message = "Uploaded file could not be verified in secure storage.") {
    super(message);
    this.name = "ResumeNotVerifiedException";
  }
}

export const ResumeService = {
  /**
   * Initializes resume upload intent, prepares DynamoDB pending record,
   * and returns short-lived presigned PUT URL.
   */
  async createUploadIntent(
    user: AuthUser,
    input: UploadIntentInput
  ): Promise<UploadIntentResult> {
    const resumeId = `res-uuid-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const s3Key = `resumes/${user.userId}/${resumeId}.pdf`;
    const expiresInSeconds = 900; // 15 mins

    // 1. Generate presigned PUT URL
    const uploadUrl = await ResumeRepository.createPresignedUploadUrl(
      s3Key,
      input.contentType,
      expiresInSeconds
    );

    // 2. Persist initial metadata record in PENDING_UPLOAD status
    const record: ResumeRecord = {
      PK: `USER#${user.userId}`,
      SK: `RESUME#${resumeId}`,
      entityType: "RESUME",
      resumeId,
      fileName: input.fileName.trim(),
      s3Key,
      s3Bucket: RESUME_BUCKET,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      status: "PENDING_UPLOAD",
      createdAt: now,
      updatedAt: now,
    };

    await ResumeRepository.saveResumeMetadata(record);

    return {
      resumeId,
      uploadUrl,
      s3Key,
      expiresInSeconds,
      requiredHeaders: {
        "Content-Type": "application/pdf",
      },
    };
  },

  /**
   * Verifies that the uploaded PDF exists in S3 via HeadObject and marks record READY.
   */
  async confirmUpload(user: AuthUser, resumeId: string): Promise<ResumeRecord> {
    const record = await ResumeRepository.getResumeMetadata(user.userId, resumeId);
    if (!record) {
      throw new ResumeNotFoundException();
    }

    // Inspect object in private S3 bucket
    const head = await ResumeRepository.headS3Object(record.s3Key);
    if (!head || !head.contentLength) {
      await ResumeRepository.updateResumeStatus(
        user.userId,
        resumeId,
        "FAILED",
        0,
        new Date().toISOString()
      );
      throw new ResumeNotVerifiedException(
        "File upload was not completed or could not be found in S3."
      );
    }

    // Enforce 5 MB limit on actual uploaded payload
    if (head.contentLength > MAX_RESUME_SIZE_BYTES) {
      await ResumeRepository.deleteS3Object(record.s3Key);
      await ResumeRepository.updateResumeStatus(
        user.userId,
        resumeId,
        "FAILED",
        head.contentLength,
        new Date().toISOString()
      );
      throw new ResumeNotVerifiedException(
        `Uploaded file size (${head.contentLength} bytes) exceeds 5 MB limit.`
      );
    }

    const now = new Date().toISOString();
    const updated = await ResumeRepository.updateResumeStatus(
      user.userId,
      resumeId,
      "READY",
      head.contentLength,
      now
    );

    return updated || record;
  },

  /**
   * Lists all candidate resumes
   */
  async listResumes(user: AuthUser): Promise<ResumeRecord[]> {
    return ResumeRepository.listResumeMetadata(user.userId);
  },

  /**
   * Generates short-lived presigned GET download URL for verified resume
   */
  async getDownloadUrl(
    user: AuthUser,
    resumeId: string
  ): Promise<DownloadUrlResult> {
    const record = await ResumeRepository.getResumeMetadata(user.userId, resumeId);
    if (!record) {
      throw new ResumeNotFoundException();
    }

    if (record.status !== "READY") {
      throw new ResumeNotVerifiedException(
        "Resume is not ready for download (upload pending or verification failed)."
      );
    }

    const expiresInSeconds = 300; // 5 minutes
    const downloadUrl = await ResumeRepository.createPresignedDownloadUrl(
      record.s3Key,
      expiresInSeconds
    );

    return {
      resumeId: record.resumeId,
      fileName: record.fileName,
      downloadUrl,
      expiresInSeconds,
    };
  },

  /**
   * Securely purges resume object from S3 and metadata from DynamoDB
   */
  async deleteResume(user: AuthUser, resumeId: string): Promise<boolean> {
    const record = await ResumeRepository.getResumeMetadata(user.userId, resumeId);
    if (!record) {
      return false;
    }

    // Delete S3 object
    await ResumeRepository.deleteS3Object(record.s3Key);

    // Delete DynamoDB record
    return ResumeRepository.deleteResumeMetadata(user.userId, resumeId);
  },
};
