import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler as skillAnalysisHandler } from "../src/handlers/skill-analysis.js";
import { SkillAnalysisService } from "../src/services/skill-analysis.service.js";
import {
  calculateSkillMatch,
  normalizeSkill,
  SKILL_ANALYSIS_DISCLAIMER,
} from "../src/utils/skill-matcher.js";
import { ApplicationRepository } from "../src/repositories/applications.repo.js";
import { ProfileRepository } from "../src/repositories/dynamodb.repo.js";

function createMockEvent(options: {
  method: string;
  path: string;
  pathParameters?: Record<string, string>;
  claims?: Record<string, unknown>;
}): APIGatewayProxyEventV2 {
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: options.path,
    rawQueryString: "",
    headers: { "content-type": "application/json" },
    pathParameters: options.pathParameters,
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
      requestId: "req-skill-analysis-test",
      routeKey: "$default",
      stage: "$default",
      time: "27/Oct/2026:10:00:00 +0000",
      timeEpoch: 1793095200000,
      authorizer: options.claims ? ({ jwt: { claims: options.claims } } as any) : undefined,
    },
    isBase64Encoded: false,
  };
}

describe("Deterministic Skill Normalization & Matching Rules", () => {
  it("normalizes common tech aliases consistently", () => {
    expect(normalizeSkill("Postgres")).toBe("postgresql");
    expect(normalizeSkill("JS")).toBe("javascript");
    expect(normalizeSkill("TS")).toBe("typescript");
    expect(normalizeSkill("ReactJS")).toBe("react");
    expect(normalizeSkill("AWS")).toBe("amazon web services");
    expect(normalizeSkill(" py ")).toBe("python");
  });

  it("calculates match with casing, whitespace and alias matching", () => {
    const candidateSkills = ["PostgreSQL", "JavaScript", "Docker", "Python"];
    const requiredSkills = ["postgres", "js", "AWS", "Docker"];

    const result = calculateSkillMatch(candidateSkills, requiredSkills);
    expect(result.hasRequiredSkills).toBe(true);
    expect(result.matchedSkills).toEqual(["postgres", "js", "Docker"]);
    expect(result.missingSkills).toEqual(["AWS"]);
    expect(result.matchPercentage).toBe(75);
    expect(result.disclaimer).toBe(SKILL_ANALYSIS_DISCLAIMER);
  });

  it("handles empty required skills safely without NaN", () => {
    const result = calculateSkillMatch(["Python", "SQL"], []);
    expect(result.hasRequiredSkills).toBe(false);
    expect(result.matchPercentage).toBe(0);
    expect(result.matchedSkills).toEqual([]);
    expect(result.missingSkills).toEqual([]);
  });

  it("deduplicates redundant requirements before percentage calculation", () => {
    const candidateSkills = ["TypeScript"];
    const requiredSkills = ["TypeScript", "typescript", " ts "];

    const result = calculateSkillMatch(candidateSkills, requiredSkills);
    expect(result.matchedSkills.length).toBe(1);
    expect(result.matchPercentage).toBe(100);
  });
});

describe("Skill Analysis Service & Handler", () => {
  const user = { userId: "user-beta-42", email: "beta@example.com" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when application does not exist or belongs to another user", async () => {
    vi.spyOn(ApplicationRepository, "getApplication").mockResolvedValue(null);

    const result = await SkillAnalysisService.analyzeApplicationSkills(user, "foreign-app-id");
    expect(result).toBeNull();
  });

  it("performs analysis against candidate profile skills when application exists", async () => {
    vi.spyOn(ApplicationRepository, "getApplication").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "APP#app-uuid-55",
      applicationId: "app-uuid-55",
      companyName: "Stripe",
      jobTitle: "Software Engineer",
      requiredSkills: ["Go", "Kubernetes", "AWS"],
      status: "APPLIED",
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
      GSI1PK: `USER#${user.userId}#STATUS#APPLIED`,
      GSI1SK: `2026-10-27T00:00:00Z#APP#app-uuid-55`,
      GSI2PK: `USER#${user.userId}#APPLICATIONS`,
      GSI2SK: `2026-10-27T00:00:00Z#APP#app-uuid-55`,
    });

    vi.spyOn(ProfileRepository, "getProfile").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "PROFILE",
      userId: user.userId,
      email: user.email,
      displayName: "Beta Candidate",
      skills: ["Go", "AWS"],
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
    });

    const result = await SkillAnalysisService.analyzeApplicationSkills(user, "app-uuid-55");
    expect(result).not.toBeNull();
    expect(result?.companyName).toBe("Stripe");
    expect(result?.matchPercentage).toBe(67);
    expect(result?.matchedSkills).toEqual(["Go", "AWS"]);
    expect(result?.missingSkills).toEqual(["Kubernetes"]);
  });

  it("handler returns 401 UNAUTHORIZED if claims are missing", async () => {
    const event = createMockEvent({
      method: "POST",
      path: "/v1/applications/app-1/skill-analysis",
      pathParameters: { applicationId: "app-1" },
    });

    const response = await skillAnalysisHandler(event);
    expect(response.statusCode).toBe(401);
  });

  it("handler returns 404 NOT_FOUND if application is not owned by user", async () => {
    vi.spyOn(ApplicationRepository, "getApplication").mockResolvedValue(null);

    const event = createMockEvent({
      method: "POST",
      path: "/v1/applications/app-999/skill-analysis",
      pathParameters: { applicationId: "app-999" },
      claims: { sub: user.userId },
    });

    const response = await skillAnalysisHandler(event);
    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body as string);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("handler returns 200 OK with complete analysis payload", async () => {
    vi.spyOn(ApplicationRepository, "getApplication").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "APP#app-1",
      applicationId: "app-1",
      companyName: "Meta",
      jobTitle: "Production Engineer",
      requiredSkills: ["Linux", "Python"],
      status: "INTERVIEW",
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
      GSI1PK: `USER#${user.userId}#STATUS#INTERVIEW`,
      GSI1SK: "...",
      GSI2PK: "...",
      GSI2SK: "...",
    });

    vi.spyOn(ProfileRepository, "getProfile").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "PROFILE",
      userId: user.userId,
      email: user.email,
      displayName: "Candidate",
      skills: ["Linux", "Python"],
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
    });

    const event = createMockEvent({
      method: "POST",
      path: "/v1/applications/app-1/skill-analysis",
      pathParameters: { applicationId: "app-1" },
      claims: { sub: user.userId },
    });

    const response = await skillAnalysisHandler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body as string);
    expect(body.analysis.matchPercentage).toBe(100);
    expect(body.analysis.disclaimer).toBeTruthy();
    expect(body.analysis.matchedSkills).toEqual(["Linux", "Python"]);
    expect(body.analysis.missingSkills).toEqual([]);
  });

  it("handler returns 405 METHOD_NOT_ALLOWED on GET request", async () => {
    const event = createMockEvent({
      method: "GET",
      path: "/v1/applications/app-1/skill-analysis",
      pathParameters: { applicationId: "app-1" },
      claims: { sub: user.userId },
    });

    const response = await skillAnalysisHandler(event);
    expect(response.statusCode).toBe(405);
  });
});
