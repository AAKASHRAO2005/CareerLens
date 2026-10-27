import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { jsonResponse } from "../utils/response.js";
import { logger } from "../utils/logger.js";

/**
 * Public health check endpoint: GET /v1/health
 * Returns minimal operational health response without exposing secrets or internals.
 */
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  logger.info("Health check requested", { path: event.rawPath });
  return jsonResponse(200, { status: "ok" });
}
