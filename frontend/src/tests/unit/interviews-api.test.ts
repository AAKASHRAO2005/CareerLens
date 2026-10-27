import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchInterviews,
  fetchInterviewById,
  createInterviewApi,
  updateInterviewApi,
  deleteInterviewApi,
} from "@/features/interviews/api";
import { AuthManager } from "@/lib/auth";

describe("Interviews API Service (Frontend)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("fetches chronological interviews list with upcomingOnly query parameter", async () => {
    AuthManager.createDemoSession();

    const mockInterviews = [
      {
        interviewId: "int-1",
        applicationId: "app-100",
        roundName: "Technical Screening",
        interviewDate: "2026-11-05T14:00:00Z",
        mode: "ONLINE" as const,
        createdAt: "2026-10-27T10:00:00Z",
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: mockInterviews }),
    });
    global.fetch = mockFetch;

    const items = await fetchInterviews({ upcomingOnly: true, limit: 10 });
    expect(items).toHaveLength(1);
    expect(items[0].roundName).toBe("Technical Screening");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/interviews?upcomingOnly=true&limit=10");
  });

  it("fetches single interview by ID", async () => {
    AuthManager.createDemoSession();

    const mockInterview = {
      interviewId: "int-2",
      applicationId: "app-200",
      roundName: "Onsite Architecture",
      interviewDate: "2026-11-12T10:00:00Z",
      mode: "IN_PERSON" as const,
      createdAt: "2026-10-27T10:00:00Z",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ interview: mockInterview }),
    });
    global.fetch = mockFetch;

    const interview = await fetchInterviewById("int-2");
    expect(interview.interviewId).toBe("int-2");
    expect(interview.mode).toBe("IN_PERSON");
  });

  it("creates a new interview round via POST", async () => {
    AuthManager.createDemoSession();

    const createdInterview = {
      interviewId: "int-new-uuid",
      applicationId: "app-100",
      companyName: "Stripe",
      jobTitle: "SWE",
      roundName: "System Design",
      interviewDate: "2026-11-09T15:00:00Z",
      mode: "ONLINE" as const,
      createdAt: "2026-10-27T10:00:00Z",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ interview: createdInterview }),
    });
    global.fetch = mockFetch;

    const res = await createInterviewApi({
      applicationId: "app-100",
      roundName: "System Design",
      interviewDate: "2026-11-09T15:00:00Z",
      mode: "ONLINE",
      notes: "Review microservices scaling",
    });

    expect(res.interviewId).toBe("int-new-uuid");
    expect(res.companyName).toBe("Stripe");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/interviews");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      applicationId: "app-100",
      roundName: "System Design",
      interviewDate: "2026-11-09T15:00:00Z",
      mode: "ONLINE",
      notes: "Review microservices scaling",
    });
  });

  it("updates an interview round via PATCH", async () => {
    AuthManager.createDemoSession();

    const updatedInterview = {
      interviewId: "int-1",
      applicationId: "app-100",
      roundName: "Rescheduled Final",
      interviewDate: "2026-11-15T11:00:00Z",
      mode: "ONLINE" as const,
      createdAt: "2026-10-27T10:00:00Z",
      updatedAt: "2026-10-27T12:00:00Z",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ interview: updatedInterview }),
    });
    global.fetch = mockFetch;

    const res = await updateInterviewApi("int-1", {
      roundName: "Rescheduled Final",
      interviewDate: "2026-11-15T11:00:00Z",
    });

    expect(res.roundName).toBe("Rescheduled Final");
    expect(res.interviewDate).toBe("2026-11-15T11:00:00Z");
  });

  it("deletes interview round via DELETE", async () => {
    AuthManager.createDemoSession();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => null,
    });
    global.fetch = mockFetch;

    await expect(deleteInterviewApi("int-1")).resolves.not.toThrow();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/interviews/int-1");
    expect(options.method).toBe("DELETE");
  });
});
