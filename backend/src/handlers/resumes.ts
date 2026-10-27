import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getAuthenticatedUser, UnauthorizedException } from "../middleware/auth.middleware.js";
import {
  ResumeService,
  ResumeNotFoundException,
  ResumeNotVerifiedException,
} from "../services/resumes.service.js";
import { uploadIntentSchema } from "../schemas/resume.schema.js";
import {
  jsonResponse,
  emptyResponse,
  unauthorizedError,
  validationError,
  notFoundError,
  internalError,
} from "../utils/response.js";
import { logger } from "../utils/logger.js";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const method = event.requestContext.http.method.toUpperCase();
  const requestId = event.requestContext.requestId;
  const pathParams = event.pathParameters || {};
  const resumeId = pathParams.resumeId;
  const rawPath = event.rawPath || "";

  try {
    const user = getAuthenticatedUser(event);

    logger.info("Resume operation requested", {
      method,
      path: rawPath,
      userId: user.userId,
      resumeId,
      requestId,
    });

    // 1. CREATE UPLOAD INTENT: POST /v1/resumes/upload-intent
    if (method === "POST" && rawPath.endsWith("/upload-intent")) {
      let body: unknown = {};
      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch {
        return validationError("Invalid JSON request body.", undefined, requestId);
      }

      const parseResult = uploadIntentSchema.safeParse(body);
      if (!parseResult.success) {
        const details = parseResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return validationError("Validation failed for resume upload intent.", details, requestId);
      }

      const result = await ResumeService.createUploadIntent(user, parseResult.data);
      return jsonResponse(201, result);
    }

    // 2. CONFIRM UPLOAD: POST /v1/resumes/{resumeId}/confirm
    if (method === "POST" && resumeId && rawPath.endsWith("/confirm")) {
      try {
        const resume = await ResumeService.confirmUpload(user, resumeId);
        return jsonResponse(200, {
          resume: {
            resumeId: resume.resumeId,
            fileName: resume.fileName,
            contentType: resume.contentType,
            sizeBytes: resume.sizeBytes,
            status: resume.status,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
          },
        });
      } catch (err) {
        if (err instanceof ResumeNotFoundException) {
          return notFoundError("Resume record not found.", requestId);
        }
        if (err instanceof ResumeNotVerifiedException) {
          return validationError(err.message, undefined, requestId);
        }
        throw err;
      }
    }

    // 3. GET DOWNLOAD URL: GET /v1/resumes/{resumeId}/download-url
    if (method === "GET" && resumeId && rawPath.endsWith("/download-url")) {
      try {
        const download = await ResumeService.getDownloadUrl(user, resumeId);
        return jsonResponse(200, download);
      } catch (err) {
        if (err instanceof ResumeNotFoundException) {
          return notFoundError("Resume not found or inaccessible.", requestId);
        }
        if (err instanceof ResumeNotVerifiedException) {
          return validationError(err.message, undefined, requestId);
        }
        throw err;
      }
    }

    // 4. LIST RESUMES: GET /v1/resumes
    if (method === "GET" && !resumeId) {
      const resumes = await ResumeService.listResumes(user);
      return jsonResponse(200, {
        items: resumes.map((r) => ({
          resumeId: r.resumeId,
          fileName: r.fileName,
          contentType: r.contentType,
          sizeBytes: r.sizeBytes,
          status: r.status,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
      });
    }

    // 5. DELETE RESUME: DELETE /v1/resumes/{resumeId}
    if (method === "DELETE" && resumeId) {
      const deleted = await ResumeService.deleteResume(user, resumeId);
      if (!deleted) {
        return notFoundError("Resume not found or inaccessible.", requestId);
      }
      return emptyResponse(204);
    }

    return jsonResponse(405, {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: `Method ${method} not allowed on this path.`,
        requestId,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      return unauthorizedError(error.message, requestId);
    }

    logger.error("Unhandled error in resumes handler", {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });

    return internalError(undefined, requestId);
  }
}
