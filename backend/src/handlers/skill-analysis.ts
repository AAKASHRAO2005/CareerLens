import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getAuthenticatedUser, UnauthorizedException } from "../middleware/auth.middleware.js";
import { SkillAnalysisService } from "../services/skill-analysis.service.js";
import {
  jsonResponse,
  unauthorizedError,
  notFoundError,
  validationError,
  internalError,
} from "../utils/response.js";
import { logger } from "../utils/logger.js";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const method = event.requestContext.http.method.toUpperCase();
  const requestId = event.requestContext.requestId;
  const pathParams = event.pathParameters || {};
  const applicationId = pathParams.applicationId;

  try {
    const user = getAuthenticatedUser(event);

    logger.info("Skill analysis requested", {
      method,
      path: event.rawPath,
      userId: user.userId,
      applicationId,
      requestId,
    });

    if (method !== "POST") {
      return jsonResponse(405, {
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: `Method ${method} not allowed on this path.`,
          requestId,
        },
      });
    }

    if (!applicationId) {
      return validationError("Missing required applicationId path parameter.", undefined, requestId);
    }

    const analysis = await SkillAnalysisService.analyzeApplicationSkills(user, applicationId);
    if (!analysis) {
      return notFoundError("Application not found or inaccessible.", requestId);
    }

    return jsonResponse(200, {
      analysis: {
        applicationId: analysis.applicationId,
        companyName: analysis.companyName,
        jobTitle: analysis.jobTitle,
        hasRequiredSkills: analysis.hasRequiredSkills,
        matchPercentage: analysis.matchPercentage,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        disclaimer: analysis.disclaimer,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      return unauthorizedError(error.message, requestId);
    }

    logger.error("Unhandled error in skill analysis handler", {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });

    return internalError(undefined, requestId);
  }
}
