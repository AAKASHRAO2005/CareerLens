import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getAuthenticatedUser, UnauthorizedException } from "../middleware/auth.middleware.js";
import {
  InterviewService,
  ApplicationNotFoundException,
} from "../services/interviews.service.js";
import {
  createInterviewSchema,
  updateInterviewSchema,
} from "../schemas/interview.schema.js";
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
  const interviewId = pathParams.interviewId;

  try {
    const user = getAuthenticatedUser(event);

    logger.info("Interview operation requested", {
      method,
      path: event.rawPath,
      userId: user.userId,
      interviewId,
      requestId,
    });

    // 1. LIST INTERVIEWS: GET /v1/interviews
    if (method === "GET" && !interviewId) {
      const queryParams = event.queryStringParameters || {};
      const upcomingOnly = queryParams.upcomingOnly === "true";
      const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50;

      const items = await InterviewService.listInterviews(
        user,
        upcomingOnly,
        isNaN(limit) ? 50 : limit
      );

      return jsonResponse(200, {
        items: items.map((item) => ({
          interviewId: item.interviewId,
          applicationId: item.applicationId,
          companyName: item.companyName,
          jobTitle: item.jobTitle,
          roundName: item.roundName,
          interviewDate: item.interviewDate,
          mode: item.mode,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    // 2. CREATE INTERVIEW: POST /v1/interviews
    if (method === "POST" && !interviewId) {
      let body: unknown = {};
      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch {
        return validationError("Invalid JSON request body.", undefined, requestId);
      }

      const parseResult = createInterviewSchema.safeParse(body);
      if (!parseResult.success) {
        const details = parseResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return validationError("Validation failed for interview.", details, requestId);
      }

      try {
        const created = await InterviewService.createInterview(user, parseResult.data);
        return jsonResponse(
          201,
          {
            interview: {
              interviewId: created.interviewId,
              applicationId: created.applicationId,
              companyName: created.companyName,
              jobTitle: created.jobTitle,
              roundName: created.roundName,
              interviewDate: created.interviewDate,
              mode: created.mode,
              notes: created.notes,
              createdAt: created.createdAt,
              updatedAt: created.updatedAt,
            },
          },
          { Location: `/v1/interviews/${created.interviewId}` }
        );
      } catch (err) {
        if (err instanceof ApplicationNotFoundException) {
          return validationError(
            err.message,
            [{ field: "applicationId", message: err.message }],
            requestId
          );
        }
        throw err;
      }
    }

    // 3. GET INTERVIEW BY ID: GET /v1/interviews/{interviewId}
    if (method === "GET" && interviewId) {
      const interview = await InterviewService.getInterview(user, interviewId);
      if (!interview) {
        return notFoundError("Interview not found or inaccessible.", requestId);
      }

      return jsonResponse(200, {
        interview: {
          interviewId: interview.interviewId,
          applicationId: interview.applicationId,
          companyName: interview.companyName,
          jobTitle: interview.jobTitle,
          roundName: interview.roundName,
          interviewDate: interview.interviewDate,
          mode: interview.mode,
          notes: interview.notes,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt,
        },
      });
    }

    // 4. UPDATE INTERVIEW: PATCH /v1/interviews/{interviewId}
    if (method === "PATCH" && interviewId) {
      let body: unknown = {};
      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch {
        return validationError("Invalid JSON request body.", undefined, requestId);
      }

      const parseResult = updateInterviewSchema.safeParse(body);
      if (!parseResult.success) {
        const details = parseResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return validationError("Validation failed for interview update.", details, requestId);
      }

      const updated = await InterviewService.updateInterview(
        user,
        interviewId,
        parseResult.data
      );

      if (!updated) {
        return notFoundError("Interview not found or inaccessible.", requestId);
      }

      return jsonResponse(200, {
        interview: {
          interviewId: updated.interviewId,
          applicationId: updated.applicationId,
          companyName: updated.companyName,
          jobTitle: updated.jobTitle,
          roundName: updated.roundName,
          interviewDate: updated.interviewDate,
          mode: updated.mode,
          notes: updated.notes,
          updatedAt: updated.updatedAt,
        },
      });
    }

    // 5. DELETE INTERVIEW: DELETE /v1/interviews/{interviewId}
    if (method === "DELETE" && interviewId) {
      const deleted = await InterviewService.deleteInterview(user, interviewId);
      if (!deleted) {
        return notFoundError("Interview not found or inaccessible.", requestId);
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

    logger.error("Unhandled error in interviews handler", {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });

    return internalError(undefined, requestId);
  }
}
