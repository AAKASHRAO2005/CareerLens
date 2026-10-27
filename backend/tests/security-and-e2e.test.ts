import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler as applicationsHandler } from "../src/handlers/applications.js";
import { handler as interviewsHandler } from "../src/handlers/interviews.js";
import { handler as resumesHandler } from "../src/handlers/resumes.js";
import { handler as skillAnalysisHandler } from "../src/handlers/skill-analysis.js";
import { handler as profileHandler } from "../src/handlers/profile.js";
import { handler as dashboardHandler } from "../src/handlers/dashboard.js";
import { handler as healthHandler } from "../src/handlers/health.js";
import { docClient } from "../src/repositories/dynamodb.repo.js";
import { ResumeRepository } from "../src/repositories/resumes.repo.js";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// Helper to construct APIGatewayProxyEventV2 with full HTTP context and optional claims
function createMockEvent(options: {
  method: string;
  path: string;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  body?: unknown;
  claims?: Record<string, unknown> | null;
  requestId?: string;
}): APIGatewayProxyEventV2 {
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: options.path,
    rawQueryString: options.queryStringParameters
      ? new URLSearchParams(options.queryStringParameters).toString()
      : "",
    headers: { "content-type": "application/json" },
    pathParameters: options.pathParameters,
    queryStringParameters: options.queryStringParameters,
    body:
      typeof options.body === "string"
        ? options.body
        : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
    requestContext: {
      accountId: "123456789012",
      apiId: "mock-api",
      domainName: "mock-api.execute-api.us-east-1.amazonaws.com",
      domainPrefix: "mock-api",
      http: {
        method: options.method.toUpperCase(),
        path: options.path,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "vitest-security-agent",
      },
      requestId: options.requestId || "req-sec-e2e-1",
      routeKey: "$default",
      stage: "$default",
      time: "28/Oct/2026:00:00:00 +0000",
      timeEpoch: 1793145600000,
      authorizer: options.claims ? ({ jwt: { claims: options.claims } } as any) : undefined,
    },
    isBase64Encoded: false,
  };
}

describe("Phase 8: Comprehensive End-to-End Integration & Security Hardening", () => {
  // In-memory DynamoDB single-table simulation
  const dbStore = new Map<string, Record<string, any>>();

  function tableKey(pk: string, sk: string): string {
    return `${pk}###${sk}`;
  }

  function setupMocks() {
    vi.restoreAllMocks();

    // Mock docClient.send to operate on in-memory single-table simulation
    vi.spyOn(docClient, "send").mockImplementation(async (command: any) => {
      // 1. PutCommand
      if (command instanceof PutCommand || command.constructor.name === "PutCommand") {
        const item = command.input.Item;
        dbStore.set(tableKey(item.PK, item.SK), { ...item });
        return {};
      }

      // 2. GetCommand
      if (command instanceof GetCommand || command.constructor.name === "GetCommand") {
        const key = tableKey(command.input.Key.PK, command.input.Key.SK);
        const item = dbStore.get(key);
        return { Item: item ? { ...item } : undefined };
      }

      // 3. UpdateCommand
      if (command instanceof UpdateCommand || command.constructor.name === "UpdateCommand") {
        const key = tableKey(command.input.Key.PK, command.input.Key.SK);
        const existing = dbStore.get(key);

        if (!existing && command.input.ConditionExpression?.includes("attribute_exists")) {
          const err: any = new Error("The conditional request failed");
          err.name = "ConditionalCheckFailedException";
          throw err;
        }

        const updated = { ...(existing || { PK: command.input.Key.PK, SK: command.input.Key.SK }) };
        const names = command.input.ExpressionAttributeNames || {};
        const values = command.input.ExpressionAttributeValues || {};

        if (command.input.UpdateExpression) {
          const cleanExpr = command.input.UpdateExpression.replace(/^SET\s+/i, "");
          const clauses = cleanExpr.split(",").map((s: string) => s.trim());
          for (const clause of clauses) {
            const [rawKey, rawVal] = clause.split("=").map((s: string) => s.trim());
            const propName = names[rawKey] || rawKey;
            const propVal = values[rawVal];
            updated[propName] = propVal;
          }
        }

        dbStore.set(key, updated);
        return { Attributes: { ...updated } };
      }

      // 4. DeleteCommand
      if (command instanceof DeleteCommand || command.constructor.name === "DeleteCommand") {
        const key = tableKey(command.input.Key.PK, command.input.Key.SK);
        const existing = dbStore.get(key);

        if (!existing && command.input.ConditionExpression?.includes("attribute_exists")) {
          const err: any = new Error("The conditional request failed");
          err.name = "ConditionalCheckFailedException";
          throw err;
        }

        dbStore.delete(key);
        return {};
      }

      // 5. QueryCommand
      if (command instanceof QueryCommand || command.constructor.name === "QueryCommand") {
        const indexName = command.input.IndexName;
        const values = command.input.ExpressionAttributeValues || {};
        const filterExpr = command.input.FilterExpression as string | undefined;
        const keyExpr = command.input.KeyConditionExpression as string | undefined;

        const results: any[] = [];

        for (const item of dbStore.values()) {
          let matches = false;

          if (indexName === "GSI1") {
            // GSI1PK = :gsi1pk
            if (values[":gsi1pk"] && item.GSI1PK === values[":gsi1pk"]) {
              matches = true;
            }
          } else if (indexName === "GSI2") {
            // GSI2PK = :gsi2pk
            if (values[":gsi2pk"] && item.GSI2PK === values[":gsi2pk"]) {
              matches = true;
            }
          } else if (indexName === "GSI3") {
            // GSI3PK = :gsi3pk
            if (values[":gsi3pk"] && item.GSI3PK === values[":gsi3pk"]) {
              matches = true;
              // Check GSI3SK >= :now if present
              if (keyExpr?.includes("GSI3SK >=") && values[":now"]) {
                if (!(item.GSI3SK && item.GSI3SK >= values[":now"])) {
                  matches = false;
                }
              }
            }
          } else {
            // Primary index query: PK = :pk and begins_with(SK, :resumePrefix)
            if (values[":pk"] && item.PK === values[":pk"]) {
              matches = true;
              if (values[":resumePrefix"] && !item.SK.startsWith(values[":resumePrefix"])) {
                matches = false;
              }
            }
          }

          // Apply additional FilterExpression if specified
          if (matches && filterExpr && values[":appId"]) {
            if (item.applicationId !== values[":appId"]) {
              matches = false;
            }
          }

          if (matches) {
            results.push({ ...item });
          }
        }

        return { Items: results, LastEvaluatedKey: undefined };
      }

      return {};
    });

    // Mock S3 operations in ResumeRepository
    vi.spyOn(ResumeRepository, "createPresignedUploadUrl").mockResolvedValue(
      "https://careerlens-resumes-bucket.s3.amazonaws.com/resumes/upload-key.pdf?signature=test-sig-put"
    );
    vi.spyOn(ResumeRepository, "createPresignedDownloadUrl").mockResolvedValue(
      "https://careerlens-resumes-bucket.s3.amazonaws.com/resumes/download-key.pdf?signature=test-sig-get"
    );
    vi.spyOn(ResumeRepository, "headS3Object").mockResolvedValue({
      contentLength: 2048576,
      contentType: "application/pdf",
    });
    vi.spyOn(ResumeRepository, "deleteS3Object").mockResolvedValue(undefined);
  }

  // =========================================================================
  // 1. END-TO-END CANDIDATE LIFECYCLE USER JOURNEY
  // =========================================================================
  describe("1. Complete Candidate Hiring Lifecycle User Journey", () => {
    const studentUser = {
      sub: "student-alex-001",
      email: "alex.rivera@university.edu",
    };

    beforeEach(() => {
      dbStore.clear();
      setupMocks();
    });

    it("executes full candidate journey from profile setup to cascading delete", async () => {
      // Step 1: Health check
      const healthRes = await healthHandler(
        createMockEvent({ method: "GET", path: "/v1/health", claims: null })
      );
      expect(healthRes.statusCode).toBe(200);
      expect(JSON.parse(healthRes.body!).status).toBe("ok");

      // Step 2: Auto-provision and update profile skills
      const getProfileRes = await profileHandler(
        createMockEvent({ method: "GET", path: "/v1/profile", claims: studentUser })
      );
      expect(getProfileRes.statusCode).toBe(200);

      const patchProfileRes = await profileHandler(
        createMockEvent({
          method: "PATCH",
          path: "/v1/profile",
          claims: studentUser,
          body: {
            displayName: "Alex Rivera",
            skills: ["React", "TypeScript", "Node.js", "Jest"],
          },
        })
      );
      expect(patchProfileRes.statusCode).toBe(200);
      const profileData = JSON.parse(patchProfileRes.body!);
      expect(profileData.profile.displayName).toBe("Alex Rivera");
      expect(profileData.profile.skills).toEqual(["React", "TypeScript", "Node.js", "Jest"]);

      // Step 3: Create job application
      const createApplicationRes = await applicationsHandler(
        createMockEvent({
          method: "POST",
          path: "/v1/applications",
          claims: studentUser,
          body: {
            companyName: "Stripe",
            jobTitle: "Software Engineer - Infrastructure",
            jobDescription: "Looking for an engineer skilled in React, TypeScript, Python, and PostgreSQL.",
            requiredSkills: ["React", "TypeScript", "Python", "PostgreSQL"],
            status: "APPLIED",
            applicationDate: "2026-10-25",
            notes: "Applied via college career portal.",
          },
        })
      );
      expect(createApplicationRes.statusCode).toBe(201);
      const appData = JSON.parse(createApplicationRes.body!);
      const createdAppId = appData.application.applicationId;
      expect(createdAppId).toBeTruthy();
      expect(appData.application.companyName).toBe("Stripe");
      expect(appData.application.status).toBe("APPLIED");

      // Verify single application retrieval includes requiredSkills
      const getAppRes = await applicationsHandler(
        createMockEvent({
          method: "GET",
          path: `/v1/applications/${createdAppId}`,
          pathParameters: { applicationId: createdAppId },
          claims: studentUser,
        })
      );
      expect(getAppRes.statusCode).toBe(200);
      const detailedApp = JSON.parse(getAppRes.body!);
      expect(detailedApp.application.requiredSkills).toEqual(["React", "TypeScript", "Python", "PostgreSQL"]);

      // Step 4: Deterministic skill-gap analysis
      const skillRes = await skillAnalysisHandler(
        createMockEvent({
          method: "POST",
          path: `/v1/applications/${createdAppId}/skill-analysis`,
          pathParameters: { applicationId: createdAppId },
          claims: studentUser,
        })
      );
      expect(skillRes.statusCode).toBe(200);
      const skillData = JSON.parse(skillRes.body!);
      expect(skillData.analysis.applicationId).toBe(createdAppId);
      expect(skillData.analysis.matchPercentage).toBe(50);
      expect(skillData.analysis.matchedSkills).toEqual(["React", "TypeScript"]);
      expect(skillData.analysis.missingSkills).toEqual(["Python", "PostgreSQL"]);
      expect(skillData.analysis.disclaimer).toBeTruthy();

      // Step 5: Schedule interview with valid mode ONLINE
      const createIntRes = await interviewsHandler(
        createMockEvent({
          method: "POST",
          path: "/v1/interviews",
          claims: studentUser,
          body: {
            applicationId: createdAppId,
            roundName: "Technical Screening",
            interviewDate: "2026-11-15T15:00:00Z",
            mode: "ONLINE",
            notes: "React coding and system design.",
          },
        })
      );
      expect(createIntRes.statusCode).toBe(201);
      const intData = JSON.parse(createIntRes.body!);
      const createdInterviewId = intData.interview.interviewId;
      expect(createdInterviewId).toBeTruthy();
      expect(intData.interview.companyName).toBe("Stripe");
      expect(intData.interview.roundName).toBe("Technical Screening");

      // Step 6: Resume upload intent, confirmation, and download URL
      const intentRes = await resumesHandler(
        createMockEvent({
          method: "POST",
          path: "/v1/resumes/upload-intent",
          claims: studentUser,
          body: {
            fileName: "Alex_Rivera_Resume_2026.pdf",
            contentType: "application/pdf",
            sizeBytes: 2048576,
          },
        })
      );
      expect(intentRes.statusCode).toBe(201);
      const intentData = JSON.parse(intentRes.body!);
      const createdResumeId = intentData.resumeId;
      expect(createdResumeId).toBeTruthy();
      expect(intentData.uploadUrl).toContain("signature=test-sig-put");

      // Confirm upload
      const confirmRes = await resumesHandler(
        createMockEvent({
          method: "POST",
          path: `/v1/resumes/${createdResumeId}/confirm`,
          pathParameters: { resumeId: createdResumeId },
          claims: studentUser,
        })
      );
      expect(confirmRes.statusCode).toBe(200);
      const confirmData = JSON.parse(confirmRes.body!);
      expect(confirmData.resume.status).toBe("READY");

      // Generate download URL
      const downloadRes = await resumesHandler(
        createMockEvent({
          method: "GET",
          path: `/v1/resumes/${createdResumeId}/download-url`,
          pathParameters: { resumeId: createdResumeId },
          claims: studentUser,
        })
      );
      expect(downloadRes.statusCode).toBe(200);
      const downloadData = JSON.parse(downloadRes.body!);
      expect(downloadData.downloadUrl).toContain("signature=test-sig-get");

      // Step 7: Dashboard summary reflects all created resources
      const dashboardRes = await dashboardHandler(
        createMockEvent({
          method: "GET",
          path: "/v1/dashboard/summary",
          claims: studentUser,
        })
      );
      expect(dashboardRes.statusCode).toBe(200);
      const dashData = JSON.parse(dashboardRes.body!);
      expect(dashData.summary.totalApplications).toBe(1);
      expect(dashData.summary.statusCounts.APPLIED).toBe(1);
      expect(dashData.summary.activeInterviews).toBe(1);
      expect(dashData.summary.resumesCount).toBe(1);
      expect(dashData.summary.skillsCount).toBe(4);
      expect(dashData.summary.recentApplications[0].applicationId).toBe(createdAppId);
      expect(dashData.summary.upcomingInterviews[0].interviewId).toBe(createdInterviewId);

      // Step 8: Cascade deletion: Deleting application deletes linked interview
      const delAppRes = await applicationsHandler(
        createMockEvent({
          method: "DELETE",
          path: `/v1/applications/${createdAppId}`,
          pathParameters: { applicationId: createdAppId },
          claims: studentUser,
        })
      );
      expect(delAppRes.statusCode).toBe(204);

      // Verify interview was cascade deleted
      const checkIntRes = await interviewsHandler(
        createMockEvent({
          method: "GET",
          path: `/v1/interviews/${createdInterviewId}`,
          pathParameters: { interviewId: createdInterviewId },
          claims: studentUser,
        })
      );
      expect(checkIntRes.statusCode).toBe(404);

      // Step 9: Delete resume removes S3 object and DynamoDB item
      const delResumeRes = await resumesHandler(
        createMockEvent({
          method: "DELETE",
          path: `/v1/resumes/${createdResumeId}`,
          pathParameters: { resumeId: createdResumeId },
          claims: studentUser,
        })
      );
      expect(delResumeRes.statusCode).toBe(204);
      expect(ResumeRepository.deleteS3Object).toHaveBeenCalled();

      // Download URL now returns 404
      const checkResumeRes = await resumesHandler(
        createMockEvent({
          method: "GET",
          path: `/v1/resumes/${createdResumeId}/download-url`,
          pathParameters: { resumeId: createdResumeId },
          claims: studentUser,
        })
      );
      expect(checkResumeRes.statusCode).toBe(404);
    });
  });

  // =========================================================================
  // 2. CROSS-TENANT SECURITY & IDOR ATTACK MATRIX
  // =========================================================================
  describe("2. Cross-Tenant Multi-Tenant Isolation & IDOR Defense Matrix", () => {
    const userAlice = { sub: "user-alice-111", email: "alice@tech.io" };
    const userBobAttacker = { sub: "user-bob-999", email: "bob@hacker.io" };

    let aliceAppId: string;
    let aliceInterviewId: string;
    let aliceResumeId: string;

    beforeEach(async () => {
      dbStore.clear();
      setupMocks();

      // Seed Alice's application
      const appEvent = createMockEvent({
        method: "POST",
        path: "/v1/applications",
        claims: userAlice,
        body: {
          companyName: "Google",
          jobTitle: "Cloud Architect",
          requiredSkills: ["AWS", "DynamoDB"],
          status: "INTERVIEW",
        },
      });
      const appRes = await applicationsHandler(appEvent);
      aliceAppId = JSON.parse(appRes.body!).application.applicationId;

      // Seed Alice's interview with valid mode ONLINE
      const intEvent = createMockEvent({
        method: "POST",
        path: "/v1/interviews",
        claims: userAlice,
        body: {
          applicationId: aliceAppId,
          roundName: "Architecture Review",
          interviewDate: "2026-11-20T10:00:00Z",
          mode: "ONLINE",
        },
      });
      const intRes = await interviewsHandler(intEvent);
      aliceInterviewId = JSON.parse(intRes.body!).interview.interviewId;

      // Seed Alice's resume
      const resEvent = createMockEvent({
        method: "POST",
        path: "/v1/resumes/upload-intent",
        claims: userAlice,
        body: {
          fileName: "Alice_Resume.pdf",
          contentType: "application/pdf",
          sizeBytes: 1500000,
        },
      });
      const resumeRes = await resumesHandler(resEvent);
      aliceResumeId = JSON.parse(resumeRes.body!).resumeId;

      // Confirm Alice's resume
      await resumesHandler(
        createMockEvent({
          method: "POST",
          path: `/v1/resumes/${aliceResumeId}/confirm`,
          pathParameters: { resumeId: aliceResumeId },
          claims: userAlice,
        })
      );
    });

    it("prevents Bob from reading Alice's application (GET /applications/{id} -> 404)", async () => {
      const event = createMockEvent({
        method: "GET",
        path: `/v1/applications/${aliceAppId}`,
        pathParameters: { applicationId: aliceAppId },
        claims: userBobAttacker,
      });

      const res = await applicationsHandler(event);
      expect(res.statusCode).toBe(404);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("prevents Bob from modifying Alice's application (PATCH /applications/{id} -> 404)", async () => {
      const event = createMockEvent({
        method: "PATCH",
        path: `/v1/applications/${aliceAppId}`,
        pathParameters: { applicationId: aliceAppId },
        claims: userBobAttacker,
        body: { companyName: "Hacked Company", status: "OFFER" },
      });

      const res = await applicationsHandler(event);
      expect(res.statusCode).toBe(404);

      // Verify Alice's application is untouched
      const aliceCheck = await applicationsHandler(
        createMockEvent({
          method: "GET",
          path: `/v1/applications/${aliceAppId}`,
          pathParameters: { applicationId: aliceAppId },
          claims: userAlice,
        })
      );
      expect(JSON.parse(aliceCheck.body!).application.companyName).toBe("Google");
    });

    it("prevents Bob from deleting Alice's application (DELETE /applications/{id} -> 404)", async () => {
      const event = createMockEvent({
        method: "DELETE",
        path: `/v1/applications/${aliceAppId}`,
        pathParameters: { applicationId: aliceAppId },
        claims: userBobAttacker,
      });

      const res = await applicationsHandler(event);
      expect(res.statusCode).toBe(404);

      // Verify Alice's application still exists
      const aliceCheck = await applicationsHandler(
        createMockEvent({
          method: "GET",
          path: `/v1/applications/${aliceAppId}`,
          pathParameters: { applicationId: aliceAppId },
          claims: userAlice,
        })
      );
      expect(aliceCheck.statusCode).toBe(200);
    });

    it("prevents Bob from running skill analysis on Alice's application (POST /applications/{id}/skill-analysis -> 404)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: `/v1/applications/${aliceAppId}/skill-analysis`,
        pathParameters: { applicationId: aliceAppId },
        claims: userBobAttacker,
      });

      const res = await skillAnalysisHandler(event);
      expect(res.statusCode).toBe(404);
    });

    it("prevents Bob from attaching interviews to Alice's application (POST /interviews -> 400)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: "/v1/interviews",
        claims: userBobAttacker,
        body: {
          applicationId: aliceAppId,
          roundName: "Sneaky Interview",
          interviewDate: "2026-11-25T10:00:00Z",
          mode: "IN_PERSON",
        },
      });

      const res = await interviewsHandler(event);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details[0].field).toBe("applicationId");
    });

    it("prevents Bob from reading Alice's interview (GET /interviews/{id} -> 404)", async () => {
      const event = createMockEvent({
        method: "GET",
        path: `/v1/interviews/${aliceInterviewId}`,
        pathParameters: { interviewId: aliceInterviewId },
        claims: userBobAttacker,
      });

      const res = await interviewsHandler(event);
      expect(res.statusCode).toBe(404);
    });

    it("prevents Bob from modifying Alice's interview (PATCH /interviews/{id} -> 404)", async () => {
      const event = createMockEvent({
        method: "PATCH",
        path: `/v1/interviews/${aliceInterviewId}`,
        pathParameters: { interviewId: aliceInterviewId },
        claims: userBobAttacker,
        body: { notes: "Hacked notes" },
      });

      const res = await interviewsHandler(event);
      expect(res.statusCode).toBe(404);
    });

    it("prevents Bob from deleting Alice's interview (DELETE /interviews/{id} -> 404)", async () => {
      const event = createMockEvent({
        method: "DELETE",
        path: `/v1/interviews/${aliceInterviewId}`,
        pathParameters: { interviewId: aliceInterviewId },
        claims: userBobAttacker,
      });

      const res = await interviewsHandler(event);
      expect(res.statusCode).toBe(404);
    });

    it("prevents Bob from generating download URLs for Alice's resume (GET /resumes/{id}/download-url -> 404)", async () => {
      const event = createMockEvent({
        method: "GET",
        path: `/v1/resumes/${aliceResumeId}/download-url`,
        pathParameters: { resumeId: aliceResumeId },
        claims: userBobAttacker,
      });

      const res = await resumesHandler(event);
      expect(res.statusCode).toBe(404);
    });

    it("prevents Bob from deleting Alice's resume (DELETE /resumes/{id} -> 404)", async () => {
      const event = createMockEvent({
        method: "DELETE",
        path: `/v1/resumes/${aliceResumeId}`,
        pathParameters: { resumeId: aliceResumeId },
        claims: userBobAttacker,
      });

      const res = await resumesHandler(event);
      expect(res.statusCode).toBe(404);
    });

    it("ensures Bob's dashboard summary shows zero metrics and no Alice data", async () => {
      const event = createMockEvent({
        method: "GET",
        path: "/v1/dashboard/summary",
        claims: userBobAttacker,
      });

      const res = await dashboardHandler(event);
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body!);
      expect(data.summary.totalApplications).toBe(0);
      expect(data.summary.activeInterviews).toBe(0);
      expect(data.summary.resumesCount).toBe(0);
      expect(data.summary.recentApplications).toHaveLength(0);
      expect(data.summary.upcomingInterviews).toHaveLength(0);
    });
  });

  // =========================================================================
  // 3. UNAUTHENTICATED REJECTION MATRIX (MISSING / INVALID JWT)
  // =========================================================================
  describe("3. Unauthenticated Rejection Matrix across all protected endpoints", () => {
    const unauthEvent = (method: string, path: string, pathParameters?: Record<string, string>) =>
      createMockEvent({
        method,
        path,
        pathParameters,
        claims: null, // No claims provided by authorizer
      });

    it("rejects GET /v1/profile with 401 UNAUTHORIZED", async () => {
      const res = await profileHandler(unauthEvent("GET", "/v1/profile"));
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });

    it("rejects PATCH /v1/profile with 401 UNAUTHORIZED", async () => {
      const res = await profileHandler(unauthEvent("PATCH", "/v1/profile"));
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });

    it("rejects GET /v1/applications with 401 UNAUTHORIZED", async () => {
      const res = await applicationsHandler(unauthEvent("GET", "/v1/applications"));
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });

    it("rejects POST /v1/applications with 401 UNAUTHORIZED", async () => {
      const res = await applicationsHandler(unauthEvent("POST", "/v1/applications"));
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });

    it("rejects GET /v1/applications/{id} with 401 UNAUTHORIZED", async () => {
      const res = await applicationsHandler(
        unauthEvent("GET", "/v1/applications/app-1", { applicationId: "app-1" })
      );
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });

    it("rejects POST /v1/applications/{id}/skill-analysis with 401 UNAUTHORIZED", async () => {
      const res = await skillAnalysisHandler(
        unauthEvent("POST", "/v1/applications/app-1/skill-analysis", { applicationId: "app-1" })
      );
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });

    it("rejects GET /v1/interviews with 401 UNAUTHORIZED", async () => {
      const res = await interviewsHandler(unauthEvent("GET", "/v1/interviews"));
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });

    it("rejects POST /v1/interviews with 401 UNAUTHORIZED", async () => {
      const res = await interviewsHandler(unauthEvent("POST", "/v1/interviews"));
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });

    it("rejects POST /v1/resumes/upload-intent with 401 UNAUTHORIZED", async () => {
      const res = await resumesHandler(unauthEvent("POST", "/v1/resumes/upload-intent"));
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });

    it("rejects GET /v1/resumes with 401 UNAUTHORIZED", async () => {
      const res = await resumesHandler(unauthEvent("GET", "/v1/resumes"));
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });

    it("rejects GET /v1/dashboard/summary with 401 UNAUTHORIZED", async () => {
      const res = await dashboardHandler(unauthEvent("GET", "/v1/dashboard/summary"));
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!).error.code).toBe("UNAUTHORIZED");
    });
  });

  // =========================================================================
  // 4. NEGATIVE INPUT VALIDATION & BOUNDARY CASES
  // =========================================================================
  describe("4. Negative Input Validation & Boundary Cases", () => {
    const validUser = { sub: "user-valid-555", email: "valid@user.io" };

    it("rejects application with empty companyName (400 VALIDATION_ERROR)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: "/v1/applications",
        claims: validUser,
        body: {
          companyName: "",
          jobTitle: "Software Engineer",
        },
      });

      const res = await applicationsHandler(event);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details.some((d: any) => d.field === "companyName")).toBe(true);
    });

    it("rejects application with empty jobTitle (400 VALIDATION_ERROR)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: "/v1/applications",
        claims: validUser,
        body: {
          companyName: "Acme Corp",
          jobTitle: "",
        },
      });

      const res = await applicationsHandler(event);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.details.some((d: any) => d.field === "jobTitle")).toBe(true);
    });

    it("rejects application with invalid status enum value (400 VALIDATION_ERROR)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: "/v1/applications",
        claims: validUser,
        body: {
          companyName: "Acme Corp",
          jobTitle: "DevOps Engineer",
          status: "HIRED_ILLEGAL_STATUS",
        },
      });

      const res = await applicationsHandler(event);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects resume upload intent with non-PDF extension (.docx) (400 VALIDATION_ERROR)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: "/v1/resumes/upload-intent",
        claims: validUser,
        body: {
          fileName: "Resume.docx",
          contentType: "application/pdf",
          sizeBytes: 1024,
        },
      });

      const res = await resumesHandler(event);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects resume upload intent with non-PDF MIME type (text/plain) (400 VALIDATION_ERROR)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: "/v1/resumes/upload-intent",
        claims: validUser,
        body: {
          fileName: "Resume.pdf",
          contentType: "text/plain",
          sizeBytes: 1024,
        },
      });

      const res = await resumesHandler(event);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects resume upload intent exceeding 5 MB limit (400 VALIDATION_ERROR)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: "/v1/resumes/upload-intent",
        claims: validUser,
        body: {
          fileName: "Huge_Portfolio.pdf",
          contentType: "application/pdf",
          sizeBytes: 5242881, // 5 MB + 1 byte
        },
      });

      const res = await resumesHandler(event);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects interview creation with malformed interviewDate string (400 VALIDATION_ERROR)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: "/v1/interviews",
        claims: validUser,
        body: {
          applicationId: "app-test-xyz",
          roundName: "Technical Round",
          interviewDate: "not-an-iso-date-string",
          mode: "PHONE",
        },
      });

      const res = await interviewsHandler(event);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects interview creation with empty roundName (400 VALIDATION_ERROR)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: "/v1/interviews",
        claims: validUser,
        body: {
          applicationId: "app-test-xyz",
          roundName: "",
          interviewDate: "2026-11-20T10:00:00Z",
          mode: "PHONE",
        },
      });

      const res = await interviewsHandler(event);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects malformed non-JSON request body (400 VALIDATION_ERROR)", async () => {
      const event = createMockEvent({
        method: "POST",
        path: "/v1/applications",
        claims: validUser,
        body: "NOT_VALID_JSON_STRING{{{{{",
      });

      const res = await applicationsHandler(event);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res.body!);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
