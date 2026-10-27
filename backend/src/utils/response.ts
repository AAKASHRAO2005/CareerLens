import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export function jsonResponse(
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {}
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export function emptyResponse(
  statusCode = 204,
  headers: Record<string, string> = {}
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      ...headers,
    },
  };
}

export function errorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: ApiErrorDetail[],
  requestId?: string
): APIGatewayProxyStructuredResultV2 {
  return jsonResponse(statusCode, {
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  });
}

export function validationError(
  message = "The request contains invalid fields.",
  details?: ApiErrorDetail[],
  requestId?: string
) {
  return errorResponse(400, "VALIDATION_ERROR", message, details, requestId);
}

export function unauthorizedError(
  message = "Missing or invalid authentication token.",
  requestId?: string
) {
  return errorResponse(401, "UNAUTHORIZED", message, undefined, requestId);
}

export function forbiddenError(
  message = "You do not have permission to perform this operation.",
  requestId?: string
) {
  return errorResponse(403, "FORBIDDEN", message, undefined, requestId);
}

export function notFoundError(
  message = "The requested resource does not exist or is inaccessible.",
  requestId?: string
) {
  return errorResponse(404, "NOT_FOUND", message, undefined, requestId);
}

export function conflictError(
  message = "The resource state conflicts with the requested operation.",
  requestId?: string
) {
  return errorResponse(409, "CONFLICT", message, undefined, requestId);
}

export function internalError(
  message = "An unexpected server error occurred. Please try again later.",
  requestId?: string
) {
  return errorResponse(500, "INTERNAL_SERVER_ERROR", message, undefined, requestId);
}
