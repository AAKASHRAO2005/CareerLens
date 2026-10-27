import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getAuthenticatedUser, UnauthorizedException } from "../middleware/auth.middleware.js";
import { ProfileService } from "../services/profile.service.js";
import { patchProfileSchema } from "../schemas/profile.schema.js";
import {
  jsonResponse,
  unauthorizedError,
  validationError,
  internalError,
} from "../utils/response.js";
import { logger } from "../utils/logger.js";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const method = event.requestContext.http.method.toUpperCase();
  const requestId = event.requestContext.requestId;

  try {
    const user = getAuthenticatedUser(event);
    logger.info("Profile operation requested", {
      method,
      userId: user.userId,
      requestId,
    });

    if (method === "GET") {
      const record = await ProfileService.getOrCreateProfile(user);
      return jsonResponse(200, {
        profile: {
          displayName: record.displayName,
          email: record.email,
          skills: record.skills,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        },
      });
    }

    if (method === "PATCH") {
      let body: unknown = {};
      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch {
        return validationError("Invalid JSON request body.", undefined, requestId);
      }

      const parseResult = patchProfileSchema.safeParse(body);
      if (!parseResult.success) {
        const details = parseResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return validationError("Profile validation failed.", details, requestId);
      }

      const updated = await ProfileService.updateProfile(user, parseResult.data);
      return jsonResponse(200, {
        profile: {
          displayName: updated.displayName,
          email: updated.email,
          skills: updated.skills,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      });
    }

    return jsonResponse(405, {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: `Method ${method} not allowed on /v1/profile`,
        requestId,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      return unauthorizedError(error.message, requestId);
    }

    logger.error("Unhandled error in profile handler", {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });

    return internalError(undefined, requestId);
  }
}
