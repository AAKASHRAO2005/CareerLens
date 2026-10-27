import { describe, it, expect } from "vitest";
import { getAuthenticatedUser, UnauthorizedException } from "../src/middleware/auth.middleware.js";
import { handler as healthHandler } from "../src/handlers/health.js";
import {
  validationError,
  unauthorizedError,
  notFoundError,
  forbiddenError,
  conflictError,
} from "../src/utils/response.js";
import { APIGatewayProxyEventV2 } from "aws-lambda";

function createMockEvent(claims?: Record<string, unknown>, method = "GET"): APIGatewayProxyEventV2 {
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: "/v1/profile",
    rawQueryString: "",
    headers: {},
    requestContext: {
      accountId: "123456789012",
      apiId: "mock-api",
      domainName: "mock-api.execute-api.us-east-1.amazonaws.com",
      domainPrefix: "mock-api",
      http: {
        method,
        path: "/v1/profile",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "vitest-agent",
      },
      requestId: "req-test-uuid",
      routeKey: "$default",
      stage: "$default",
      time: "27/Oct/2026:10:00:00 +0000",
      timeEpoch: 1793095200000,
      authorizer: claims ? ({ jwt: { claims } } as any) : undefined,
    },
    isBase64Encoded: false,
  };
}

describe("Authentication Middleware", () => {
  it("extracts sub and email from trusted authorizer JWT claims", () => {
    const event = createMockEvent({
      sub: "cognito-sub-12345",
      email: "akash@example.com",
    });

    const user = getAuthenticatedUser(event);
    expect(user.userId).toBe("cognito-sub-12345");
    expect(user.email).toBe("akash@example.com");
  });

  it("throws UnauthorizedException when authorizer context is absent", () => {
    const event = createMockEvent(undefined);
    expect(() => getAuthenticatedUser(event)).toThrow(UnauthorizedException);
    expect(() => getAuthenticatedUser(event)).toThrow(
      "Unauthorized: missing trusted authorizer claims."
    );
  });

  it("throws UnauthorizedException when sub claim is missing", () => {
    const event = createMockEvent({ email: "test@example.com" });
    expect(() => getAuthenticatedUser(event)).toThrow(UnauthorizedException);
  });

  it("throws UnauthorizedException when sub claim is empty string", () => {
    const event = createMockEvent({ sub: "   " });
    expect(() => getAuthenticatedUser(event)).toThrow(UnauthorizedException);
  });
});

describe("Standard API Error Envelopes", () => {
  it("formats validationError (400) according to Document 3 contract", () => {
    const res = validationError(
      "Validation failed",
      [{ field: "companyName", message: "Company name is required." }],
      "req-123"
    );

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body as string);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Validation failed");
    expect(body.error.details).toEqual([
      { field: "companyName", message: "Company name is required." },
    ]);
    expect(body.error.requestId).toBe("req-123");
  });

  it("formats unauthorizedError (401)", () => {
    const res = unauthorizedError("Expired token", "req-401");
    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body as string);
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.message).toBe("Expired token");
  });

  it("formats forbiddenError (403)", () => {
    const res = forbiddenError("Access denied", "req-403");
    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body as string);
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("formats notFoundError (404)", () => {
    const res = notFoundError("Resource not found", "req-404");
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body as string);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("formats conflictError (409)", () => {
    const res = conflictError("State conflict", "req-409");
    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.body as string);
    expect(body.error.code).toBe("CONFLICT");
  });
});

describe("Health Check Handler", () => {
  it("returns 200 OK with minimal status JSON", async () => {
    const event = createMockEvent(undefined, "GET");
    const res = await healthHandler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body as string);
    expect(body).toEqual({ status: "ok" });
  });
});
