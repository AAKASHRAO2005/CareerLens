import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getAuthenticatedUser, UnauthorizedException } from "../middleware/auth.middleware.js";
import { DashboardService } from "../services/dashboard.service.js";
import {
  jsonResponse,
  unauthorizedError,
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

    logger.info("Dashboard summary requested", {
      method,
      path: event.rawPath,
      userId: user.userId,
      requestId,
    });

    if (method !== "GET") {
      return jsonResponse(405, {
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: `Method ${method} not allowed on this path.`,
          requestId,
        },
      });
    }

    const summary = await DashboardService.getDashboardSummary(user);

    return jsonResponse(200, {
      summary,
    });
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      return unauthorizedError(error.message, requestId);
    }

    logger.error("Unhandled error in dashboard summary handler", {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });

    return internalError(undefined, requestId);
  }
}
