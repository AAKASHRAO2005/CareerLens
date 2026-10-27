import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler as resumesHandler } from "../src/handlers/resumes.js";
import {
  ResumeService,
  ResumeNotFoundException,
  ResumeNotVerifiedException,
} from "../src/services/resumes.service.js";
import { ResumeRepository, s3Client } from "../src/repositories/resumes.repo.js";
import { docClient } from "../src/repositories/dynamodb.repo.js";
import { uploadIntentSchema } from "../src/schemas/resume.schema.js";
import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

function createMockEvent(options: {
  method: string;
  path: string;
  pathParameters?: Record<string, string>;
  body?: string;
  claims?: Record<string, unknown>;
}): APIGatewayProxyEventV2 {
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: options.path,
    rawQueryString: "",
    headers: { "content-type": "application/json" },
    pathParameters: options.pathParameters,
    body: options.body,
    requestContext: {
      accountId: "123456789012",
      apiId: "mock-api",
      domainName: "mock-api.execute-api.us-east-1.amazonaws.com",
      domainPrefix: "mock-api",
      http: {
        method: options.method,
        path: options.path,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "vitest-agent",
      },
      requestId: "req-resume-test-1",
      routeKey: "$default",
      stage: "$default",
      time: "27/Oct/2026:10:00:00 +0000",
      timeEpoch: 1793095200000,
      authorizer: options.claims ? ({ jwt: { claims: options.claims } } as any) : undefined,
    },
    isBase64Encoded: false,
  };
}

describe("Resume Zod Validation Rules", () => {
  it("rejects non-PDF files", () => {
    const res = uploadIntentSchema.safeParse({
      fileName: "cv.docx",
      contentType: "application/pdf",
      sizeBytes: 1024,
    });
    expect(res.success).toBe(false);
  });

  it("rejects non-PDF MIME type", () => {
    const res = uploadIntentSchema.safeParse({
      fileName: "resume.pdf",
      contentType: "application/msword",
      sizeBytes: 1024,
    });
    expect(res.success).toBe(false);
  });

  it("rejects files exceeding 5 MB (5,242,880 bytes)", () => {
    const res = uploadIntentSchema.safeParse({
      fileName: "resume.pdf",
      contentType: "application/pdf",
      sizeBytes: 5242881, // 5 MB + 1 byte
    });
    expect(res.success).toBe(false);
  });

  it("accepts valid PDF within 5 MB size limit", () => {
    const res = uploadIntentSchema.safeParse({
      fileName: "Akash_Sharma_Resume.pdf",
      contentType: "application/pdf",
      sizeBytes: 2500000, // 2.5 MB
    });
    expect(res.success).toBe(true);
  });
});

describe("Resume Service & S3 Integration Unit Tests", () => {
  const user = { userId: "user-resume-10", email: "user@example.com" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates upload intent with presigned URL and saves PENDING_UPLOAD record", async () => {
    vi.spyOn(ResumeRepository, "createPresignedUploadUrl").mockResolvedValue(
      "https://careerlens-resumes-bucket.s3.amazonaws.com/resumes/user-resume-10/res-1.pdf?signature=abc"
    );
    const saveSpy = vi.spyOn(ResumeRepository, "saveResumeMetadata").mockResolvedValue();

    const intent = await ResumeService.createUploadIntent(user, {
      fileName: "Software_Engineer_Resume.pdf",
      contentType: "application/pdf",
      sizeBytes: 204800,
    });

    expect(intent.resumeId).toMatch(/^res-uuid-/);
    expect(intent.uploadUrl).toContain("https://careerlens-resumes-bucket.s3.amazonaws.com");
    expect(intent.expiresInSeconds).toBe(900);
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });

  it("throws ResumeNotFoundException on confirmUpload when metadata is absent", async () => {
    vi.spyOn(ResumeRepository, "getResumeMetadata").mockResolvedValue(null);

    await expect(ResumeService.confirmUpload(user, "res-unknown")).rejects.toThrow(
      ResumeNotFoundException
    );
  });

  it("throws ResumeNotVerifiedException on confirmUpload if HeadObject fails (object not in S3)", async () => {
    vi.spyOn(ResumeRepository, "getResumeMetadata").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "RESUME#res-1",
      entityType: "RESUME",
      resumeId: "res-1",
      fileName: "my-resume.pdf",
      s3Key: "resumes/user-resume-10/res-1.pdf",
      s3Bucket: "careerlens-resumes-bucket",
      contentType: "application/pdf",
      sizeBytes: 1000,
      status: "PENDING_UPLOAD",
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
    });

    vi.spyOn(ResumeRepository, "headS3Object").mockResolvedValue(null);
    const updateSpy = vi.spyOn(ResumeRepository, "updateResumeStatus").mockResolvedValue(null);

    await expect(ResumeService.confirmUpload(user, "res-1")).rejects.toThrow(
      ResumeNotVerifiedException
    );
    expect(updateSpy).toHaveBeenCalledWith(
      user.userId,
      "res-1",
      "FAILED",
      0,
      expect.any(String)
    );
  });

  it("marks resume READY on confirmUpload when S3 HeadObject confirms existence", async () => {
    vi.spyOn(ResumeRepository, "getResumeMetadata").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "RESUME#res-1",
      entityType: "RESUME",
      resumeId: "res-1",
      fileName: "my-resume.pdf",
      s3Key: "resumes/user-resume-10/res-1.pdf",
      s3Bucket: "careerlens-resumes-bucket",
      contentType: "application/pdf",
      sizeBytes: 1000,
      status: "PENDING_UPLOAD",
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
    });

    vi.spyOn(ResumeRepository, "headS3Object").mockResolvedValue({
      contentLength: 102400,
      contentType: "application/pdf",
    });

    vi.spyOn(ResumeRepository, "updateResumeStatus").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "RESUME#res-1",
      entityType: "RESUME",
      resumeId: "res-1",
      fileName: "my-resume.pdf",
      s3Key: "resumes/user-resume-10/res-1.pdf",
      s3Bucket: "careerlens-resumes-bucket",
      contentType: "application/pdf",
      sizeBytes: 102400,
      status: "READY",
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
    });

    const confirmed = await ResumeService.confirmUpload(user, "res-1");
    expect(confirmed.status).toBe("READY");
    expect(confirmed.sizeBytes).toBe(102400);
  });

  it("generates presigned download GET URL for verified READY resume", async () => {
    vi.spyOn(ResumeRepository, "getResumeMetadata").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "RESUME#res-1",
      entityType: "RESUME",
      resumeId: "res-1",
      fileName: "ready-resume.pdf",
      s3Key: "resumes/user-resume-10/res-1.pdf",
      s3Bucket: "careerlens-resumes-bucket",
      contentType: "application/pdf",
      sizeBytes: 102400,
      status: "READY",
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
    });

    vi.spyOn(ResumeRepository, "createPresignedDownloadUrl").mockResolvedValue(
      "https://s3.amazonaws.com/download?token=xyz"
    );

    const result = await ResumeService.getDownloadUrl(user, "res-1");
    expect(result.downloadUrl).toContain("https://s3.amazonaws.com/download");
    expect(result.fileName).toBe("ready-resume.pdf");
  });

  it("deletes resume from both S3 and DynamoDB", async () => {
    vi.spyOn(ResumeRepository, "getResumeMetadata").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "RESUME#res-1",
      entityType: "RESUME",
      resumeId: "res-1",
      fileName: "delete-me.pdf",
      s3Key: "resumes/user-resume-10/res-1.pdf",
      s3Bucket: "careerlens-resumes-bucket",
      contentType: "application/pdf",
      sizeBytes: 102400,
      status: "READY",
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
    });

    const s3DeleteSpy = vi.spyOn(ResumeRepository, "deleteS3Object").mockResolvedValue();
    const ddbDeleteSpy = vi.spyOn(ResumeRepository, "deleteResumeMetadata").mockResolvedValue(true);

    const success = await ResumeService.deleteResume(user, "res-1");
    expect(success).toBe(true);
    expect(s3DeleteSpy).toHaveBeenCalledWith("resumes/user-resume-10/res-1.pdf");
    expect(ddbDeleteSpy).toHaveBeenCalledWith(user.userId, "res-1");
  });
});

describe("Resumes Lambda Handler (HTTP Routing & Error Handling)", () => {
  const user = { userId: "user-resume-10", email: "user@example.com" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 UNAUTHORIZED when claims are absent", async () => {
    const event = createMockEvent({
      method: "GET",
      path: "/v1/resumes",
    });

    const res = await resumesHandler(event);
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 VALIDATION_ERROR on upload-intent with invalid payload", async () => {
    const event = createMockEvent({
      method: "POST",
      path: "/v1/resumes/upload-intent",
      claims: { sub: user.userId },
      body: JSON.stringify({ fileName: "resume.exe", sizeBytes: 10 }),
    });

    const res = await resumesHandler(event);
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body as string);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 201 CREATED on valid upload-intent", async () => {
    vi.spyOn(ResumeService, "createUploadIntent").mockResolvedValue({
      resumeId: "res-123",
      uploadUrl: "https://s3.amazonaws.com/upload-intent",
      s3Key: "resumes/user/res-123.pdf",
      expiresInSeconds: 900,
      requiredHeaders: { "Content-Type": "application/pdf" },
    });

    const event = createMockEvent({
      method: "POST",
      path: "/v1/resumes/upload-intent",
      claims: { sub: user.userId },
      body: JSON.stringify({
        fileName: "Master_Resume.pdf",
        contentType: "application/pdf",
        sizeBytes: 102400,
      }),
    });

    const res = await resumesHandler(event);
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body as string);
    expect(body.resumeId).toBe("res-123");
    expect(body.uploadUrl).toBeTruthy();
  });

  it("returns 200 OK on successful confirm", async () => {
    vi.spyOn(ResumeService, "confirmUpload").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "RESUME#res-123",
      entityType: "RESUME",
      resumeId: "res-123",
      fileName: "Master_Resume.pdf",
      s3Key: "resumes/user/res-123.pdf",
      s3Bucket: "careerlens-resumes-bucket",
      contentType: "application/pdf",
      sizeBytes: 102400,
      status: "READY",
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
    });

    const event = createMockEvent({
      method: "POST",
      path: "/v1/resumes/res-123/confirm",
      pathParameters: { resumeId: "res-123" },
      claims: { sub: user.userId },
    });

    const res = await resumesHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body as string);
    expect(body.resume.status).toBe("READY");
  });

  it("returns 200 OK on GET /v1/resumes", async () => {
    vi.spyOn(ResumeService, "listResumes").mockResolvedValue([
      {
        PK: `USER#${user.userId}`,
        SK: "RESUME#res-1",
        entityType: "RESUME",
        resumeId: "res-1",
        fileName: "Resume_A.pdf",
        s3Key: "...",
        s3Bucket: "...",
        contentType: "application/pdf",
        sizeBytes: 200000,
        status: "READY",
        createdAt: "2026-10-27T00:00:00Z",
        updatedAt: "2026-10-27T00:00:00Z",
      },
    ]);

    const event = createMockEvent({
      method: "GET",
      path: "/v1/resumes",
      claims: { sub: user.userId },
    });

    const res = await resumesHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body as string);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].fileName).toBe("Resume_A.pdf");
  });

  it("returns 204 NO_CONTENT on DELETE /v1/resumes/{id}", async () => {
    vi.spyOn(ResumeService, "deleteResume").mockResolvedValue(true);

    const event = createMockEvent({
      method: "DELETE",
      path: "/v1/resumes/res-1",
      pathParameters: { resumeId: "res-1" },
      claims: { sub: user.userId },
    });

    const res = await resumesHandler(event);
    expect(res.statusCode).toBe(204);
  });
});
