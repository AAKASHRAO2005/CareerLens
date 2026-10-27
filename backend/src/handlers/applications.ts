import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getAuthenticatedUser, UnauthorizedException } from "../middleware/auth.middleware.js";
import { ApplicationService } from "../services/applications.service.js";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "../schemas/application.schema.js";
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
  const applicationId = pathParams.applicationId;

  try {
    const user = getAuthenticatedUser(event);

    logger.info("Application operation requested", {
      method,
      path: event.rawPath,
      userId: user.userId,
      applicationId,
      requestId,
    });

    // 1. LIST APPLICATIONS: GET /v1/applications
    if (method === "GET" && !applicationId) {
      const queryParams = event.queryStringParameters || {};
      const status = queryParams.status;
      const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 20;
      const cursor = queryParams.cursor;

      const result = await ApplicationService.listApplications(
        user,
        status,
        isNaN(limit) ? 20 : limit,
        cursor
      );

      return jsonResponse(200, {
        items: result.items.map((item) => ({
          applicationId: item.applicationId,
          companyName: item.companyName,
          jobTitle: item.jobTitle,
          status: item.status,
          applicationDate: item.applicationDate,
          requiredSkills: item.requiredSkills,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        nextCursor: result.nextCursor,
      });
    }

    // 2. CREATE APPLICATION: POST /v1/applications
    if (method === "POST" && !applicationId) {
      let body: unknown = {};
      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch {
        return validationError("Invalid JSON request body.", undefined, requestId);
      }

      const parseResult = createApplicationSchema.safeParse(body);
      if (!parseResult.success) {
        const details = parseResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return validationError("Validation failed for application.", details, requestId);
      }

      const created = await ApplicationService.createApplication(user, parseResult.data);
      return jsonResponse(
        201,
        {
          application: {
            applicationId: created.applicationId,
            companyName: created.companyName,
            jobTitle: created.jobTitle,
            status: created.status,
            applicationDate: created.applicationDate,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          },
        },
        { Location: `/v1/applications/${created.applicationId}` }
      );
    }

    // 3. GET APPLICATION BY ID: GET /v1/applications/{applicationId}
    if (method === "GET" && applicationId) {
      const app = await ApplicationService.getApplication(user, applicationId);
      if (!app) {
        return notFoundError("Application not found or inaccessible.", requestId);
      }

      return jsonResponse(200, {
        application: {
          applicationId: app.applicationId,
          companyName: app.companyName,
          jobTitle: app.jobTitle,
          jobDescription: app.jobDescription,
          requiredSkills: app.requiredSkills,
          status: app.status,
          applicationDate: app.applicationDate,
          notes: app.notes,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
        },
      });
    }

    // 4. UPDATE APPLICATION: PATCH /v1/applications/{applicationId}
    if (method === "PATCH" && applicationId) {
      let body: unknown = {};
      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch {
        return validationError("Invalid JSON request body.", undefined, requestId);
      }

      const parseResult = updateApplicationSchema.safeParse(body);
      if (!parseResult.success) {
        const details = parseResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return validationError("Validation failed for application update.", details, requestId);
      }

      const updated = await ApplicationService.updateApplication(
        user,
        applicationId,
        parseResult.data
      );

      if (!updated) {
        return notFoundError("Application not found or inaccessible.", requestId);
      }

      return jsonResponse(200, {
        application: {
          applicationId: updated.applicationId,
          companyName: updated.companyName,
          jobTitle: updated.jobTitle,
          status: updated.status,
          notes: updated.notes,
          updatedAt: updated.updatedAt,
        },
      });
    }

    // 5. DELETE APPLICATION: DELETE /v1/applications/{applicationId}
    if (method === "DELETE" && applicationId) {
      const deleted = await ApplicationService.deleteApplication(user, applicationId);
      if (!deleted) {
        return notFoundError("Application not found or inaccessible.", requestId);
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

    logger.error("Unhandled error in applications handler", {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });

    return internalError(undefined, requestId);
  }
}
