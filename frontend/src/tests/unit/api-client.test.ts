import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthManager } from "@/lib/auth";
import { apiClient, ApiClientError } from "@/lib/api-client";

describe("Frontend AuthManager & Session", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("creates and retrieves demo session with valid access token", () => {
    const session = AuthManager.createDemoSession("test@example.com", "Test Student");
    expect(session.accessToken).toBeTruthy();
    expect(AuthManager.getAccessToken()).toBe(session.accessToken);
    expect(AuthManager.getSession()?.user.email).toBe("test@example.com");
  });

  it("clears session on signOut", () => {
    AuthManager.createDemoSession("test@example.com", "Test Student");
    AuthManager.clearSession();
    expect(AuthManager.getSession()).toBeNull();
    expect(AuthManager.getAccessToken()).toBeNull();
  });

  it("handles expired session gracefully", () => {
    const expiredSession = {
      accessToken: "expired-token",
      idToken: "id",
      refreshToken: "refresh",
      user: { userId: "sub", email: "test@example.com", displayName: "Test" },
      expiresAt: Date.now() - 1000, // 1 sec in past
    };
    AuthManager.setSession(expiredSession);
    expect(AuthManager.getSession()).toBeNull();
    expect(AuthManager.getAccessToken()).toBeNull();
  });
});

describe("Frontend Centralized API Client", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("attaches Authorization header with Bearer token when authenticated", async () => {
    AuthManager.createDemoSession("student@example.com", "Student");
    const token = AuthManager.getAccessToken();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "ok" }),
    });
    global.fetch = mockFetch;

    await apiClient.get("/health");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Authorization"]).toBe(`Bearer ${token}`);
  });

  it("throws ApiClientError with code and details on HTTP 400 error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          code: "VALIDATION_ERROR",
          message: "Field validation failed.",
          details: [{ field: "companyName", message: "Company name is required." }],
          requestId: "test-req-id",
        },
      }),
    });
    global.fetch = mockFetch;

    await expect(apiClient.post("/applications", {})).rejects.toThrow(ApiClientError);
    try {
      await apiClient.post("/applications", {});
    } catch (err) {
      const apiErr = err as ApiClientError;
      expect(apiErr.statusCode).toBe(400);
      expect(apiErr.code).toBe("VALIDATION_ERROR");
      expect(apiErr.details).toHaveLength(1);
    }
  });

  it("throws ApiClientError on HTTP 401 Unauthorized", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid token.",
        },
      }),
    });
    global.fetch = mockFetch;

    await expect(apiClient.get("/profile")).rejects.toThrow(ApiClientError);
  });
});
