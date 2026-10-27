import { APIGatewayProxyEventV2 } from "aws-lambda";
import { AuthUser } from "../types/backend.types.js";

export class UnauthorizedException extends Error {
  constructor(message = "Missing or invalid authentication token.") {
    super(message);
    this.name = "UnauthorizedException";
  }
}

/**
 * Derives authenticated user identity strictly from trusted Cognito JWT claims
 * provided by the API Gateway HTTP API JWT authorizer.
 *
 * Enforces security rule: Never trust client-supplied userId in query or body.
 */
export function getAuthenticatedUser(event: APIGatewayProxyEventV2): AuthUser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authorizer = (event.requestContext as any)?.authorizer;
  const claims = authorizer?.jwt?.claims;

  if (!claims || !claims.sub) {
    throw new UnauthorizedException("Unauthorized: missing trusted authorizer claims.");
  }

  const userId = String(claims.sub).trim();
  if (!userId) {
    throw new UnauthorizedException("Unauthorized: invalid subject claim identifier.");
  }

  const email = String(claims.email || claims["cognito:username"] || "user@careerlens.internal");

  return {
    userId,
    email,
  };
}
