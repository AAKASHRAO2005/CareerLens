import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler as interviewsHandler } from "../src/handlers/interviews.js";
import {
  InterviewService,
  ApplicationNotFoundException,
} from "../src/services/interviews.service.js";
import { InterviewRepository } from "../src/repositories/interviews.repo.js";
import { ApplicationRepository } from "../src/repositories/applications.repo.js";
import { ApplicationService } from "../src/services/applications.service.js";
import { docClient } from "../src/repositories/dynamodb.repo.js";
import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

function createMockEvent(options: {
  method: string;
  path: string;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
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
    queryStringParameters: options.queryStringParameters,
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
      requestId: "req-interview-test-1",
      routeKey: "$default",
      stage: "$default",
      time: "27/Oct/2026:10:00:00 +0000",
      timeEpoch: 1793095200000,
      authorizer: options.claims ? ({ jwt: { claims: options.claims } } as any) : undefined,
    },
    isBase64Encoded: false,
  };
}

describe("InterviewRepository & InterviewService Unit Tests", () => {
  const user = { userId: "user-delta-88", email: "delta@example.com" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fails interview creation if parent application does not exist or belongs to another user", async () => {
    vi.spyOn(ApplicationRepository, "getApplication").mockResolvedValue(null);

    await expect(
      InterviewService.createInterview(user, {
        applicationId: "nonexistent-app",
        roundName: "Technical Screening",
        interviewDate: "2026-11-05T14:00:00Z",
        mode: "ONLINE",
      })
    ).rejects.toThrow(ApplicationNotFoundException);
  });

  it("creates interview with proper GSI3 keys and denormalized company info when parent app exists", async () => {
    vi.spyOn(ApplicationRepository, "getApplication").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "APP#app-1",
      applicationId: "app-1",
      companyName: "Databricks",
      jobTitle: "Data Platform Engineer",
      requiredSkills: ["Spark", "Scala"],
      status: "INTERVIEW",
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
      GSI1PK: "...",
      GSI1SK: "...",
      GSI2PK: "...",
      GSI2SK: "...",
    });

    const sendSpy = vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      expect(command).toBeInstanceOf(PutCommand);
      const item = command.input.Item;
      expect(item.PK).toBe(`USER#${user.userId}`);
      expect(item.SK).toMatch(/^INTERVIEW#int-uuid-/);
      expect(item.GSI3PK).toBe(`USER#${user.userId}#INTERVIEWS`);
      expect(item.GSI3SK).toMatch(/^2026-11-05T14:00:00Z#INTERVIEW#int-uuid-/);
      expect(item.companyName).toBe("Databricks");
      expect(item.jobTitle).toBe("Data Platform Engineer");
      expect(item.mode).toBe("ONLINE");
      return {} as any;
    });

    const created = await InterviewService.createInterview(user, {
      applicationId: "app-1",
      roundName: "Coding Round",
      interviewDate: "2026-11-05T14:00:00Z",
      mode: "ONLINE",
      notes: "Focus on distributed systems algorithms",
    });

    expect(created.interviewId).toMatch(/^int-uuid-/);
    expect(created.companyName).toBe("Databricks");
    expect(sendSpy).toHaveBeenCalledTimes(1);
  });

  it("queries GSI3 chronologically for candidate interviews", async () => {
    vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      expect(command).toBeInstanceOf(QueryCommand);
      expect(command.input.IndexName).toBe("GSI3");
      expect(command.input.KeyConditionExpression).toBe("GSI3PK = :gsi3pk");
      expect(command.input.ScanIndexForward).toBe(true);
      return {
        Items: [
          { interviewId: "int-1", roundName: "Screen" },
          { interviewId: "int-2", roundName: "System Design" },
        ],
      } as any;
    });

    const items = await InterviewService.listInterviews(user, false);
    expect(items).toHaveLength(2);
    expect(items[0].roundName).toBe("Screen");
  });

  it("queries upcoming interviews only using GSI3SK >= :now", async () => {
    vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      expect(command).toBeInstanceOf(QueryCommand);
      expect(command.input.IndexName).toBe("GSI3");
      expect(command.input.KeyConditionExpression).toContain("GSI3SK >= :now");
      return { Items: [{ interviewId: "int-upcoming", roundName: "Final" }] } as any;
    });

    const items = await InterviewService.listInterviews(user, true);
    expect(items).toHaveLength(1);
    expect(items[0].roundName).toBe("Final");
  });

  it("updates interview date and dynamically re-keys GSI3SK", async () => {
    vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      expect(command).toBeInstanceOf(UpdateCommand);
      expect(command.input.ExpressionAttributeValues[":interviewDate"]).toBe("2026-11-10T10:00:00Z");
      expect(command.input.ExpressionAttributeValues[":gsi3sk"]).toBe(
        "2026-11-10T10:00:00Z#INTERVIEW#int-123"
      );
      return {
        Attributes: {
          interviewId: "int-123",
          interviewDate: "2026-11-10T10:00:00Z",
          roundName: "Rescheduled Final",
        },
      } as any;
    });

    const res = await InterviewService.updateInterview(user, "int-123", {
      interviewDate: "2026-11-10T10:00:00Z",
      roundName: "Rescheduled Final",
    });

    expect(res?.interviewDate).toBe("2026-11-10T10:00:00Z");
  });

  it("cascades interview deletion when parent application is deleted", async () => {
    vi.spyOn(ApplicationRepository, "deleteApplication").mockResolvedValue(true);
    const deleteInterviewsSpy = vi
      .spyOn(InterviewRepository, "deleteInterviewsByApplication")
      .mockResolvedValue(2);

    const deleted = await ApplicationService.deleteApplication(user, "app-target-cascade");
    expect(deleted).toBe(true);
    expect(deleteInterviewsSpy).toHaveBeenCalledWith(user.userId, "app-target-cascade");
  });
});

describe("Interviews Lambda Handler (HTTP Routing & Error Handling)", () => {
  const user = { userId: "user-delta-88", email: "delta@example.com" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 UNAUTHORIZED when claims are missing", async () => {
    const event = createMockEvent({
      method: "GET",
      path: "/v1/interviews",
    });

    const res = await interviewsHandler(event);
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 VALIDATION_ERROR on missing required fields in POST", async () => {
    const event = createMockEvent({
      method: "POST",
      path: "/v1/interviews",
      claims: { sub: user.userId },
      body: JSON.stringify({ roundName: "" }), // missing applicationId & interviewDate
    });

    const res = await interviewsHandler(event);
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body as string);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR when referenced application does not exist or belong to user", async () => {
    vi.spyOn(ApplicationRepository, "getApplication").mockResolvedValue(null);

    const event = createMockEvent({
      method: "POST",
      path: "/v1/interviews",
      claims: { sub: user.userId },
      body: JSON.stringify({
        applicationId: "app-other-user",
        roundName: "Phone Screen",
        interviewDate: "2026-11-02T15:00:00Z",
        mode: "PHONE",
      }),
    });

    const res = await interviewsHandler(event);
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body as string);
    expect(body.error.message).toContain("Job application 'app-other-user' does not exist");
  });

  it("returns 201 CREATED with Location header on valid interview creation", async () => {
    vi.spyOn(ApplicationRepository, "getApplication").mockResolvedValue({
      PK: `USER#${user.userId}`,
      SK: "APP#app-valid",
      applicationId: "app-valid",
      companyName: "Figma",
      jobTitle: "Design Systems Engineer",
      requiredSkills: ["React"],
      status: "INTERVIEW",
      createdAt: "2026-10-27T00:00:00Z",
      updatedAt: "2026-10-27T00:00:00Z",
      GSI1PK: "...",
      GSI1SK: "...",
      GSI2PK: "...",
      GSI2SK: "...",
    });

    vi.spyOn(docClient, "send").mockResolvedValue({} as any);

    const event = createMockEvent({
      method: "POST",
      path: "/v1/interviews",
      claims: { sub: user.userId },
      body: JSON.stringify({
        applicationId: "app-valid",
        roundName: "Technical Portfolio Review",
        interviewDate: "2026-11-04T16:00:00Z",
        mode: "ONLINE",
      }),
    });

    const res = await interviewsHandler(event);
    expect(res.statusCode).toBe(201);
    expect(res.headers?.Location).toMatch(/^\/v1\/interviews\/int-uuid-/);
    const body = JSON.parse(res.body as string);
    expect(body.interview.companyName).toBe("Figma");
    expect(body.interview.roundName).toBe("Technical Portfolio Review");
  });

  it("returns 200 OK on GET /v1/interviews", async () => {
    vi.spyOn(docClient, "send").mockResolvedValue({
      Items: [
        {
          interviewId: "int-101",
          applicationId: "app-1",
          companyName: "Netflix",
          jobTitle: "UI Engineer",
          roundName: "System Architecture",
          interviewDate: "2026-11-08T10:00:00Z",
          mode: "ONLINE",
          createdAt: "2026-10-27T00:00:00Z",
          updatedAt: "2026-10-27T00:00:00Z",
        },
      ],
    } as any);

    const event = createMockEvent({
      method: "GET",
      path: "/v1/interviews",
      claims: { sub: user.userId },
    });

    const res = await interviewsHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body as string);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].roundName).toBe("System Architecture");
  });

  it("returns 204 NO_CONTENT on successful DELETE /v1/interviews/{id}", async () => {
    vi.spyOn(docClient, "send").mockResolvedValue({} as any);

    const event = createMockEvent({
      method: "DELETE",
      path: "/v1/interviews/int-101",
      pathParameters: { interviewId: "int-101" },
      claims: { sub: user.userId },
    });

    const res = await interviewsHandler(event);
    expect(res.statusCode).toBe(204);
  });
});
