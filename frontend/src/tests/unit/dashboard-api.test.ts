import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchDashboardSummary } from "@/features/dashboard/api";
import { AuthManager } from "@/lib/auth";

describe("Dashboard API Service (Frontend)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("calls GET /v1/dashboard/summary and returns aggregated metrics", async () => {
    AuthManager.createDemoSession();

    const mockSummary = {
      totalApplications: 5,
      activeInterviews: 2,
      resumesCount: 1,
      skillsCount: 8,
      statusCounts: {
        SAVED: 1,
        APPLIED: 2,
        ONLINE_ASSESSMENT: 0,
        INTERVIEW: 2,
        OFFER: 0,
        REJECTED: 0,
        WITHDRAWN: 0,
      },
      recentApplications: [
        {
          applicationId: "app-10",
          companyName: "Google",
          jobTitle: "Software Engineer",
          status: "INTERVIEW",
          createdAt: "2026-10-27T00:00:00Z",
        },
      ],
      upcomingInterviews: [],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ summary: mockSummary }),
    });
    global.fetch = mockFetch;

    const summary = await fetchDashboardSummary();

    expect(summary.totalApplications).toBe(5);
    expect(summary.activeInterviews).toBe(2);
    expect(summary.skillsCount).toBe(8);
    expect(summary.statusCounts.INTERVIEW).toBe(2);
    expect(summary.recentApplications[0].companyName).toBe("Google");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/dashboard/summary");
    expect(options.method).toBe("GET");
  });
});
