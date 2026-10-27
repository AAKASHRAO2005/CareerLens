import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler as dashboardHandler } from "../src/handlers/dashboard.js";
import { DashboardService } from "../src/services/dashboard.service.js";
import { ApplicationRepository } from "../src/repositories/applications.repo.js";
import { ProfileRepository } from "../src/repositories/dynamodb.repo.js";
import { InterviewRepository } from "../src/repositories/interviews.repo.js";
import { ResumeRepository } from "../src/repositories/resumes.repo.js";

function createMockEvent(options: {
  method: string;
  path: string;
  claims?: Record<string, unknown>;
}): APIGatewayProxyEventV2 {
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: options.path,
    rawQueryString: "",
    headers: { "content-type": "application/json" },
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
      requestId: "req-dashboard-test",
      routeKey: "$default",
      stage: "$default",
      time: "27/Oct/2026:10:00:00 +0000",
      timeEpoch: 1793095200000,
      authorizer: options.claims ? ({ jwt: { claims: options.claims } } as any) : undefined,
    },
    isBase64Encoded: false,
  };
}

describe("Dashboard Service & Handler", () => {
  const user = { userId: "user-gamma-77", email: "gamma@example.com" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("aggregates recruitment stage counts and recent applications accurately", async () => {
    vi.spyOn(ApplicationRepository, "listApplications").mockResolvedValue({
      items: [
        {
          PK: `USER#${user.userId}`,
          SK: "APP#1",
          applicationId: "app-1",
          companyName: "Google",
          jobTitle: "SWE",
          status: "INTERVIEW",
          createdAt: "2026-10-27T10:00:00Z",
          updatedAt: "2026-10-27T10:00:00Z",
          GSI1PK: "...",
          GSI1SK: "...",
          GSI2PK: "...",
          GSI2SK: "...",
          requiredSkills: ["Go"],
        },
        {
          PK: `USER#${user.userId}`,
          SK: "APP#2",
          applicationId: "app-2",
          companyName: "Amazon",
          jobTitle: "SDE",
          status: "APPLIED",
          createdAt: "2026-10-26T10:00:00Z",
          updatedAt: "2026-10-26T10:00:00Z",
          GSI1PK: "...",
          GSI1SK: "...",
          GSI2PK: "...",
          GSI2SK: "...",
          requiredSkills: ["Java"],
        },
        {
          PK: `USER#${user.userId}`,
          SK: "APP#3",
          applicationId: "app-3",
          companyName: "Netflix",
          jobTitle: "UI Engineer",
          status: "OFFER",
          createdAt: "2026-10-25T10:00:00Z",
          updatedAt: "2026-10-25T10:00:00Z",
          GSI1PK: "...",
          GSI1SK: "...",
          GSI2PK: "...",
          GSI2SK: "...",
          requiredSkills: ["React"],
        },
      ],
      nextCursor: null,
    });

    vi.spyOn(ProfileRepository, "getProfile").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "PROFILE",
      userId: user.userId,
      email: user.email,
      displayName: "Gamma Candidate",
      skills: ["Go", "React", "TypeScript", "AWS"],
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
    });

    vi.spyOn(InterviewRepository, "listInterviews").mockResolvedValue([]);
    vi.spyOn(ResumeRepository, "listResumeMetadata").mockResolvedValue([]);

    const summary = await DashboardService.getDashboardSummary(user);

    expect(summary.totalApplications).toBe(3);
    expect(summary.activeInterviews).toBe(1);
    expect(summary.skillsCount).toBe(4);
    expect(summary.statusCounts.INTERVIEW).toBe(1);
    expect(summary.statusCounts.APPLIED).toBe(1);
    expect(summary.statusCounts.OFFER).toBe(1);
    expect(summary.statusCounts.REJECTED).toBe(0);
    expect(summary.recentApplications).toHaveLength(3);
    expect(summary.recentApplications[0].companyName).toBe("Google");
  });

  it("handler returns 401 UNAUTHORIZED when claims are missing", async () => {
    const event = createMockEvent({
      method: "GET",
      path: "/v1/dashboard/summary",
    });

    const response = await dashboardHandler(event);
    expect(response.statusCode).toBe(401);
  });

  it("handler returns 405 METHOD_NOT_ALLOWED on POST request", async () => {
    const event = createMockEvent({
      method: "POST",
      path: "/v1/dashboard/summary",
      claims: { sub: user.userId },
    });

    const response = await dashboardHandler(event);
    expect(response.statusCode).toBe(405);
  });

  it("handler returns 200 OK with summary object on valid request", async () => {
    vi.spyOn(DashboardService, "getDashboardSummary").mockResolvedValue({
      totalApplications: 1,
      activeInterviews: 0,
      resumesCount: 0,
      skillsCount: 2,
      statusCounts: {
        SAVED: 1,
        APPLIED: 0,
        ONLINE_ASSESSMENT: 0,
        INTERVIEW: 0,
        OFFER: 0,
        REJECTED: 0,
        WITHDRAWN: 0,
      },
      recentApplications: [
        {
          applicationId: "app-1",
          companyName: "Apple",
          jobTitle: "iOS Engineer",
          status: "SAVED",
          createdAt: "2026-10-27T00:00:00Z",
        },
      ],
      upcomingInterviews: [],
    });

    const event = createMockEvent({
      method: "GET",
      path: "/v1/dashboard/summary",
      claims: { sub: user.userId },
    });

    const response = await dashboardHandler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body as string);
    expect(body.summary.totalApplications).toBe(1);
    expect(body.summary.skillsCount).toBe(2);
    expect(body.summary.recentApplications[0].companyName).toBe("Apple");
  });
});
