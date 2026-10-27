import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler as applicationsHandler } from "../src/handlers/applications.js";
import { ApplicationService } from "../src/services/applications.service.js";
import {
  ApplicationRepository,
  encodeCursor,
  decodeCursor,
} from "../src/repositories/applications.repo.js";
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
      requestId: "req-app-test-123",
      routeKey: "$default",
      stage: "$default",
      time: "27/Oct/2026:10:00:00 +0000",
      timeEpoch: 1793095200000,
      authorizer: options.claims ? ({ jwt: { claims: options.claims } } as any) : undefined,
    },
    isBase64Encoded: false,
  };
}

describe("Cursor Encoding / Decoding", () => {
  it("encodes and decodes pagination keys accurately", () => {
    const key = { PK: "USER#user-1", SK: "APP#app-1", GSI2SK: "2026-10-27T00:00:00Z" };
    const encoded = encodeCursor(key);
    expect(encoded).toBeTypeOf("string");

    const decoded = decodeCursor(encoded!);
    expect(decoded).toEqual(key);
  });

  it("returns null for undefined cursor key and undefined for invalid cursor string", () => {
    expect(encodeCursor(undefined)).toBeNull();
    expect(decodeCursor(undefined)).toBeUndefined();
    expect(decodeCursor("not-valid-base64-json!!!")).toBeUndefined();
  });
});

describe("ApplicationRepository & ApplicationService Unit Tests", () => {
  const user = { userId: "user-alpha-99", email: "alpha@example.com" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an application with proper single-table keys and GSI attributes", async () => {
    const sendSpy = vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      expect(command).toBeInstanceOf(PutCommand);
      expect(command.input.TableName).toBe("CareerLensData");
      const item = command.input.Item;
      expect(item.PK).toBe(`USER#${user.userId}`);
      expect(item.SK).toMatch(/^APP#app-uuid-/);
      expect(item.GSI1PK).toBe(`USER#${user.userId}#STATUS#APPLIED`);
      expect(item.GSI2PK).toBe(`USER#${user.userId}#APPLICATIONS`);
      expect(item.companyName).toBe("Acme Corp");
      expect(item.jobTitle).toBe("Full Stack Engineer");
      expect(item.requiredSkills).toEqual(["React", "TypeScript", "Node.js"]);
      return {} as any;
    });

    const created = await ApplicationService.createApplication(user, {
      companyName: "Acme Corp",
      jobTitle: "Full Stack Engineer",
      requiredSkills: ["React", "TypeScript", "Node.js"],
      status: "APPLIED",
    });

    expect(created.applicationId).toMatch(/^app-uuid-/);
    expect(created.status).toBe("APPLIED");
    expect(sendSpy).toHaveBeenCalledTimes(1);
  });

  it("retrieves a single application scoped strictly to the authenticated user", async () => {
    const mockApp = {
      PK: `USER#${user.userId}`,
      SK: "APP#app-uuid-1",
      applicationId: "app-uuid-1",
      companyName: "Google",
      jobTitle: "SWE",
      status: "INTERVIEW",
    };

    vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      expect(command).toBeInstanceOf(GetCommand);
      expect(command.input.Key).toEqual({
        PK: `USER#${user.userId}`,
        SK: "APP#app-uuid-1",
      });
      return { Item: mockApp } as any;
    });

    const result = await ApplicationService.getApplication(user, "app-uuid-1");
    expect(result).toEqual(mockApp);
  });

  it("queries GSI2 chronologically when no status filter is provided", async () => {
    const mockItems = [
      { applicationId: "app-1", companyName: "Amazon" },
      { applicationId: "app-2", companyName: "Netflix" },
    ];

    vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      expect(command).toBeInstanceOf(QueryCommand);
      expect(command.input.IndexName).toBe("GSI2");
      expect(command.input.KeyConditionExpression).toBe("GSI2PK = :gsi2pk");
      expect(command.input.ExpressionAttributeValues[":gsi2pk"]).toBe(`USER#${user.userId}#APPLICATIONS`);
      expect(command.input.ScanIndexForward).toBe(false);
      return { Items: mockItems, LastEvaluatedKey: { PK: "USER#user-alpha-99", SK: "APP#app-2" } } as any;
    });

    const res = await ApplicationService.listApplications(user, undefined, 10);
    expect(res.items).toHaveLength(2);
    expect(res.nextCursor).toBeTypeOf("string");
  });

  it("queries GSI1 when a specific status filter is provided", async () => {
    vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      expect(command).toBeInstanceOf(QueryCommand);
      expect(command.input.IndexName).toBe("GSI1");
      expect(command.input.KeyConditionExpression).toBe("GSI1PK = :gsi1pk");
      expect(command.input.ExpressionAttributeValues[":gsi1pk"]).toBe(
        `USER#${user.userId}#STATUS#OFFER`
      );
      return { Items: [{ applicationId: "app-3", status: "OFFER" }] } as any;
    });

    const res = await ApplicationService.listApplications(user, "OFFER", 10);
    expect(res.items).toHaveLength(1);
    expect(res.items[0].status).toBe("OFFER");
  });

  it("updates application status and rewrites GSI1PK partition key accordingly", async () => {
    vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      expect(command).toBeInstanceOf(UpdateCommand);
      expect(command.input.ExpressionAttributeValues[":status"]).toBe("OFFER");
      expect(command.input.ExpressionAttributeValues[":gsi1pk"]).toBe(
        `USER#${user.userId}#STATUS#OFFER`
      );
      return {
        Attributes: {
          PK: `USER#${user.userId}`,
          SK: "APP#app-uuid-1",
          applicationId: "app-uuid-1",
          status: "OFFER",
        },
      } as any;
    });

    const res = await ApplicationService.updateApplication(user, "app-uuid-1", {
      status: "OFFER",
      notes: "Received offer letter!",
    });
    expect(res?.status).toBe("OFFER");
  });

  it("returns null on update when conditional check fails (nonexistent or cross-user)", async () => {
    vi.spyOn(docClient, "send").mockRejectedValue({
      name: "ConditionalCheckFailedException",
    });

    const res = await ApplicationService.updateApplication(user, "non-existent-app", {
      status: "REJECTED",
    });
    expect(res).toBeNull();
  });

  it("deletes application with condition check and returns false if item does not exist", async () => {
    vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      if (command instanceof DeleteCommand) {
        expect(command.input.ConditionExpression).toBe("attribute_exists(PK)");
        return {} as any;
      }
      if (command instanceof QueryCommand) {
        return { Items: [] } as any;
      }
      return {} as any;
    });

    const success = await ApplicationService.deleteApplication(user, "app-123");
    expect(success).toBe(true);

    vi.spyOn(docClient, "send").mockRejectedValue({
      name: "ConditionalCheckFailedException",
    });

    const notFound = await ApplicationService.deleteApplication(user, "app-123");
    expect(notFound).toBe(false);
  });
});

describe("Applications Lambda Handler (HTTP Routing & Error Handling)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 UNAUTHORIZED when claims are missing", async () => {
    const event = createMockEvent({
      method: "GET",
      path: "/v1/applications",
    });

    const response = await applicationsHandler(event);
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body as string);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 VALIDATION_ERROR when creating application with missing required fields", async () => {
    const event = createMockEvent({
      method: "POST",
      path: "/v1/applications",
      claims: { sub: "user-123" },
      body: JSON.stringify({ companyName: "" }), // missing jobTitle, companyName empty
    });

    const response = await applicationsHandler(event);
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body as string);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details.length).toBeGreaterThan(0);
  });

  it("returns 201 CREATED with Location header on valid POST", async () => {
    vi.spyOn(docClient, "send").mockResolvedValue({} as any);

    const event = createMockEvent({
      method: "POST",
      path: "/v1/applications",
      claims: { sub: "user-123" },
      body: JSON.stringify({
        companyName: "Stripe",
        jobTitle: "Infrastructure Engineer",
        requiredSkills: ["Go", "AWS", "Terraform"],
        status: "APPLIED",
      }),
    });

    const response = await applicationsHandler(event);
    expect(response.statusCode).toBe(201);
    expect(response.headers?.Location).toMatch(/^\/v1\/applications\/app-uuid-/);
    const body = JSON.parse(response.body as string);
    expect(body.application.companyName).toBe("Stripe");
    expect(body.application.status).toBe("APPLIED");
  });

  it("returns 200 OK with applications list on GET /v1/applications", async () => {
    vi.spyOn(docClient, "send").mockResolvedValue({
      Items: [
        {
          applicationId: "app-101",
          companyName: "Apple",
          jobTitle: "iOS Dev",
          status: "SAVED",
          applicationDate: "2026-10-27",
          requiredSkills: ["Swift"],
          createdAt: "2026-10-27T10:00:00Z",
          updatedAt: "2026-10-27T10:00:00Z",
        },
      ],
    } as any);

    const event = createMockEvent({
      method: "GET",
      path: "/v1/applications",
      claims: { sub: "user-123" },
    });

    const response = await applicationsHandler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body as string);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].companyName).toBe("Apple");
  });

  it("returns 404 NOT_FOUND on GET /v1/applications/{id} when application does not exist or belongs to another user", async () => {
    vi.spyOn(docClient, "send").mockResolvedValue({ Item: undefined } as any);

    const event = createMockEvent({
      method: "GET",
      path: "/v1/applications/app-nonexistent",
      pathParameters: { applicationId: "app-nonexistent" },
      claims: { sub: "user-123" },
    });

    const response = await applicationsHandler(event);
    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body as string);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns 200 OK on successful PATCH /v1/applications/{id}", async () => {
    vi.spyOn(docClient, "send").mockResolvedValue({
      Attributes: {
        applicationId: "app-101",
        companyName: "Apple",
        jobTitle: "Senior iOS Dev",
        status: "INTERVIEW",
        notes: "Technical phone screen scheduled",
        updatedAt: "2026-10-27T12:00:00Z",
      },
    } as any);

    const event = createMockEvent({
      method: "PATCH",
      path: "/v1/applications/app-101",
      pathParameters: { applicationId: "app-101" },
      claims: { sub: "user-123" },
      body: JSON.stringify({
        jobTitle: "Senior iOS Dev",
        status: "INTERVIEW",
        notes: "Technical phone screen scheduled",
      }),
    });

    const response = await applicationsHandler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body as string);
    expect(body.application.jobTitle).toBe("Senior iOS Dev");
    expect(body.application.status).toBe("INTERVIEW");
  });

  it("returns 204 NO_CONTENT on successful DELETE /v1/applications/{id}", async () => {
    vi.spyOn(docClient, "send").mockResolvedValue({} as any);

    const event = createMockEvent({
      method: "DELETE",
      path: "/v1/applications/app-101",
      pathParameters: { applicationId: "app-101" },
      claims: { sub: "user-123" },
    });

    const response = await applicationsHandler(event);
    expect(response.statusCode).toBe(204);
    expect(response.body).toBeUndefined();
  });

  it("returns 404 NOT_FOUND on DELETE if item does not exist or unauthorized", async () => {
    vi.spyOn(docClient, "send").mockRejectedValue({
      name: "ConditionalCheckFailedException",
    });

    const event = createMockEvent({
      method: "DELETE",
      path: "/v1/applications/app-other-user",
      pathParameters: { applicationId: "app-other-user" },
      claims: { sub: "user-123" },
    });

    const response = await applicationsHandler(event);
    expect(response.statusCode).toBe(404);
  });
});
