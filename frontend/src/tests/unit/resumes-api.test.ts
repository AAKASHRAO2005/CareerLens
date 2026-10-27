import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createUploadIntent,
  uploadFileToS3,
  confirmResumeUpload,
  fetchResumes,
  fetchResumeDownloadUrl,
  deleteResumeApi,
} from "@/features/resumes/api";
import { AuthManager } from "@/lib/auth";

describe("Resumes API Service (Frontend)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("requests upload intent with presigned PUT URL", async () => {
    AuthManager.createDemoSession();

    const mockResponse = {
      resumeId: "res-uuid-1",
      uploadUrl: "https://careerlens-resumes.s3.amazonaws.com/resumes/sub/res-1.pdf?sig=123",
      expiresInSeconds: 900,
      requiredHeaders: { "Content-Type": "application/pdf" },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockResponse,
    });
    global.fetch = mockFetch;

    const res = await createUploadIntent("Software_Engineer_Resume.pdf", 102400);
    expect(res.resumeId).toBe("res-uuid-1");
    expect(res.uploadUrl).toContain("careerlens-resumes.s3.amazonaws.com");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/resumes/upload-intent");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      fileName: "Software_Engineer_Resume.pdf",
      contentType: "application/pdf",
      sizeBytes: 102400,
    });
  });

  it("uploads binary payload directly to Amazon S3", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    global.fetch = mockFetch;

    const dummyBlob = new Blob(["dummy pdf content"], { type: "application/pdf" });
    const s3Url = "https://s3.amazonaws.com/signed-put-url";

    await expect(uploadFileToS3(s3Url, dummyBlob)).resolves.not.toThrow();

    expect(mockFetch).toHaveBeenCalledWith(s3Url, {
      method: "PUT",
      body: dummyBlob,
      headers: { "Content-Type": "application/pdf" },
    });
  });

  it("confirms upload after S3 write", async () => {
    AuthManager.createDemoSession();

    const mockConfirmed = {
      resumeId: "res-uuid-1",
      fileName: "My_Resume.pdf",
      contentType: "application/pdf",
      sizeBytes: 102400,
      status: "READY" as const,
      createdAt: "2026-10-27T00:00:00Z",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ resume: mockConfirmed }),
    });
    global.fetch = mockFetch;

    const resume = await confirmResumeUpload("res-uuid-1");
    expect(resume.resumeId).toBe("res-uuid-1");
    expect(resume.status).toBe("READY");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/resumes/res-uuid-1/confirm");
    expect(options.method).toBe("POST");
  });

  it("fetches resumes list from backend", async () => {
    AuthManager.createDemoSession();

    const mockList = [
      {
        resumeId: "res-1",
        fileName: "Resume_A.pdf",
        contentType: "application/pdf",
        sizeBytes: 50000,
        status: "READY" as const,
        createdAt: "2026-10-27T00:00:00Z",
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: mockList }),
    });
    global.fetch = mockFetch;

    const items = await fetchResumes();
    expect(items).toHaveLength(1);
    expect(items[0].fileName).toBe("Resume_A.pdf");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/resumes");
  });

  it("fetches short-lived download URL for viewing", async () => {
    AuthManager.createDemoSession();

    const mockDownload = {
      resumeId: "res-1",
      fileName: "Resume_A.pdf",
      downloadUrl: "https://s3.amazonaws.com/get-object?token=abc",
      expiresInSeconds: 300,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockDownload,
    });
    global.fetch = mockFetch;

    const res = await fetchResumeDownloadUrl("res-1");
    expect(res.downloadUrl).toContain("https://s3.amazonaws.com/get-object");
    expect(res.expiresInSeconds).toBe(300);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/resumes/res-1/download-url");
  });

  it("deletes resume via DELETE", async () => {
    AuthManager.createDemoSession();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => null,
    });
    global.fetch = mockFetch;

    await expect(deleteResumeApi("res-1")).resolves.not.toThrow();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/resumes/res-1");
    expect(options.method).toBe("DELETE");
  });
});
