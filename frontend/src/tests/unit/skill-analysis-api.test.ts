import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchSkillAnalysis } from "@/features/skill-analyzer/api";
import { AuthManager } from "@/lib/auth";

describe("Skill Analysis API Service (Frontend)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("calls POST /v1/applications/{id}/skill-analysis and returns analysis payload", async () => {
    AuthManager.createDemoSession();

    const mockAnalysis = {
      applicationId: "app-uuid-1",
      companyName: "Acme Corp",
      jobTitle: "Cloud Engineer",
      hasRequiredSkills: true,
      matchPercentage: 75,
      matchedSkills: ["AWS", "Docker", "Node.js"],
      missingSkills: ["Kubernetes"],
      disclaimer: "This analysis is rule-based and intended for self-assessment only.",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ analysis: mockAnalysis }),
    });
    global.fetch = mockFetch;

    const result = await fetchSkillAnalysis("app-uuid-1");

    expect(result.applicationId).toBe("app-uuid-1");
    expect(result.matchPercentage).toBe(75);
    expect(result.matchedSkills).toEqual(["AWS", "Docker", "Node.js"]);
    expect(result.missingSkills).toEqual(["Kubernetes"]);
    expect(result.disclaimer).toBeTruthy();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/v1/applications/app-uuid-1/skill-analysis");
    expect(options.method).toBe("POST");
  });
});
