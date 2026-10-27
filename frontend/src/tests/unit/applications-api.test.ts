import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchApplications,
  fetchApplicationById,
  createApplicationApi,
  updateApplicationApi,
  deleteApplicationApi,
} from "@/features/applications/api";
import { AuthManager } from "@/lib/auth";

describe("Applications API Service (Frontend)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("fetches applications list with status filter and cursor pagination", async () => {
    AuthManager.createDemoSession("student@example.com", "Student");

    const mockResponse = {
      items: [
        {
          applicationId: "app-100",
          companyName: "Amazon",
          jobTitle: "SDE I",
          status: "INTERVIEW",
          requiredSkills: ["Java", "AWS"],
          createdAt: "2026-10-27T10:00:00Z",
        },
      ],
      nextCursor: "cursor-token-xyz",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    global.fetch = mockFetch;

    const res = await fetchApplications({ status: "INTERVIEW", limit: 15, cursor: "prev-cur" });
    expect(res.items).toHaveLength(1);
    expect(res.nextCursor).toBe("cursor-token-xyz");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/applications?status=INTERVIEW&limit=15&cursor=prev-cur");
  });

  it("fetches single application by ID", async () => {
    AuthManager.createDemoSession();

    const mockApp = {
      applicationId: "app-uuid-99",
      companyName: "Google",
      jobTitle: "Software Engineer",
      status: "APPLIED",
      requiredSkills: ["Go", "Kubernetes"],
      createdAt: "2026-10-27T10:00:00Z",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ application: mockApp }),
    });
    global.fetch = mockFetch;

    const app = await fetchApplicationById("app-uuid-99");
    expect(app.applicationId).toBe("app-uuid-99");
    expect(app.companyName).toBe("Google");
  });

  it("creates a new application via POST", async () => {
    AuthManager.createDemoSession();

    const createdApp = {
      applicationId: "app-uuid-new",
      companyName: "Microsoft",
      jobTitle: "Cloud Solution Architect",
      status: "APPLIED",
      requiredSkills: ["Azure", "TypeScript"],
      createdAt: "2026-10-27T10:00:00Z",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ application: createdApp }),
    });
    global.fetch = mockFetch;

    const res = await createApplicationApi({
      companyName: "Microsoft",
      jobTitle: "Cloud Solution Architect",
      requiredSkills: ["Azure", "TypeScript"],
      status: "APPLIED",
    });

    expect(res.applicationId).toBe("app-uuid-new");
    expect(res.companyName).toBe("Microsoft");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/applications");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      companyName: "Microsoft",
      jobTitle: "Cloud Solution Architect",
      requiredSkills: ["Azure", "TypeScript"],
      status: "APPLIED",
    });
  });

  it("updates application status via PATCH", async () => {
    AuthManager.createDemoSession();

    const updatedApp = {
      applicationId: "app-uuid-99",
      companyName: "Google",
      jobTitle: "Senior Software Engineer",
      status: "OFFER",
      updatedAt: "2026-10-27T12:00:00Z",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ application: updatedApp }),
    });
    global.fetch = mockFetch;

    const res = await updateApplicationApi("app-uuid-99", {
      status: "OFFER",
      jobTitle: "Senior Software Engineer",
    });

    expect(res.status).toBe("OFFER");
    expect(res.jobTitle).toBe("Senior Software Engineer");
  });

  it("deletes application via DELETE returning 204", async () => {
    AuthManager.createDemoSession();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => null,
    });
    global.fetch = mockFetch;

    await expect(deleteApplicationApi("app-uuid-99")).resolves.not.toThrow();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/applications/app-uuid-99");
    expect(options.method).toBe("DELETE");
  });
});
