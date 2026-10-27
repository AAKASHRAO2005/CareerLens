import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthManager } from "@/lib/auth";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { uploadFileToS3 } from "@/features/resumes/api";

describe("Phase 8: Frontend Security, Error Envelopes & Network Resilience", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe("1. Structured Error Envelopes & HTTP Status Codes", () => {
    it("handles HTTP 400 with structured field validation errors", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed for application.",
            details: [
              { field: "companyName", message: "Company name is required." },
              { field: "jobTitle", message: "Job title is required." },
            ],
            requestId: "req-err-400",
          },
        }),
      });

      await expect(apiClient.post("/v1/applications", {})).rejects.toThrow(ApiClientError);

      try {
        await apiClient.post("/v1/applications", {});
      } catch (err) {
        const error = err as ApiClientError;
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe("VALIDATION_ERROR");
        expect(error.message).toBe("Validation failed for application.");
        expect(error.details).toHaveLength(2);
        expect(error.details![0]).toEqual({ field: "companyName", message: "Company name is required." });
        expect(error.requestId).toBe("req-err-400");
      }
    });

    it("handles HTTP 401 Unauthorized with token expiration message", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized: missing trusted authorizer claims.",
            requestId: "req-err-401",
          },
        }),
      });

      try {
        await apiClient.get("/v1/profile");
      } catch (err) {
        const error = err as ApiClientError;
        expect(error.statusCode).toBe(401);
        expect(error.code).toBe("UNAUTHORIZED");
        expect(error.message).toContain("missing trusted authorizer claims");
      }
    });

    it("handles HTTP 404 Not Found error envelopes", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({
          error: {
            code: "NOT_FOUND",
            message: "Application not found or inaccessible.",
            requestId: "req-err-404",
          },
        }),
      });

      try {
        await apiClient.get("/v1/applications/non-existent-id");
      } catch (err) {
        const error = err as ApiClientError;
        expect(error.statusCode).toBe(404);
        expect(error.code).toBe("NOT_FOUND");
        expect(error.message).toBe("Application not found or inaccessible.");
      }
    });

    it("handles HTTP 405 Method Not Allowed error envelopes", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 405,
        statusText: "Method Not Allowed",
        json: async () => ({
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: "Method GET not allowed on this path.",
            requestId: "req-err-405",
          },
        }),
      });

      try {
        await apiClient.get("/v1/applications/app-1/skill-analysis");
      } catch (err) {
        const error = err as ApiClientError;
        expect(error.statusCode).toBe(405);
        expect(error.code).toBe("METHOD_NOT_ALLOWED");
      }
    });

    it("handles HTTP 500 Internal Server Error cleanly", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({
          error: {
            code: "INTERNAL_ERROR",
            message: "An internal server error occurred.",
            requestId: "req-err-500",
          },
        }),
      });

      try {
        await apiClient.get("/v1/dashboard/summary");
      } catch (err) {
        const error = err as ApiClientError;
        expect(error.statusCode).toBe(500);
        expect(error.code).toBe("INTERNAL_ERROR");
      }
    });
  });

  describe("2. Network Resilience & Fallback Handling", () => {
    it("handles non-JSON raw Gateway error responses without crashing (HTML / plain text)", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        json: async () => {
          throw new Error("SyntaxError: Unexpected token '<'");
        },
      });

      try {
        await apiClient.get("/v1/health");
      } catch (err) {
        const error = err as ApiClientError;
        expect(error.statusCode).toBe(502);
        expect(error.code).toBe("HTTP_502");
        expect(error.message).toBe("Bad Gateway");
      }
    });

    it("handles HTTP 204 No Content returning an empty object", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        statusText: "No Content",
      });

      const result = await apiClient.delete("/v1/applications/app-to-delete");
      expect(result).toEqual({});
    });
  });

  describe("3. S3 Direct Upload Error Handling", () => {
    it("throws descriptive error when S3 PUT is rejected (e.g., 403 Forbidden)", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      });

      const dummyBlob = new Blob(["%PDF-1.4 test"], { type: "application/pdf" });

      await expect(
        uploadFileToS3("https://s3.amazonaws.com/bucket/key.pdf?sig=bad", dummyBlob)
      ).rejects.toThrow("S3 upload failed with status 403: Forbidden");
    });

    it("propagates network drops during direct S3 binary streaming", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network connection lost."));

      const dummyBlob = new Blob(["%PDF-1.4 test"], { type: "application/pdf" });

      await expect(
        uploadFileToS3("https://s3.amazonaws.com/bucket/key.pdf?sig=good", dummyBlob)
      ).rejects.toThrow("Network connection lost.");
    });
  });

  describe("4. Client Session & Token Tampering Protections", () => {
    it("detects expired tokens and treats them as unauthenticated", () => {
      const expiredSession = {
        accessToken: "expired-jwt-token",
        idToken: "id-token",
        refreshToken: "refresh-token",
        user: { userId: "sub-123", email: "student@school.edu", displayName: "Student" },
        expiresAt: Date.now() - 5000, // Expired 5 seconds ago
      };
      sessionStorage.setItem("careerlens_auth_session", JSON.stringify(expiredSession));

      expect(AuthManager.isAuthenticated()).toBe(false);
      expect(AuthManager.getAccessToken()).toBeNull();
      expect(AuthManager.getSession()).toBeNull();
    });

    it("handles corrupted JSON in session storage gracefully", () => {
      sessionStorage.setItem("careerlens_auth_session", "INVALID_JSON_CORRUPTED{{{");

      expect(AuthManager.isAuthenticated()).toBe(false);
      expect(AuthManager.getAccessToken()).toBeNull();
      expect(AuthManager.getSession()).toBeNull();
    });
  });
});
