/**
 * Structured logger for AWS CloudWatch that prevents logging sensitive data,
 * credentials, access tokens, and presigned URLs.
 */

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const SENSITIVE_PATTERNS = [
  /bearer\s+[a-zA-Z0-9_\-\.]+/gi,
  /x-amz-signature=[a-zA-Z0-9]+/gi,
  /password["']?\s*[:=]\s*["']?[^"',\s]+/gi,
];

function sanitize(message: unknown): unknown {
  if (typeof message === "string") {
    let sanitized = message;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    }
    return sanitized;
  }
  if (typeof message === "object" && message !== null) {
    const copy = Array.isArray(message) ? [...message] : { ...message };
    for (const key of Object.keys(copy)) {
      if (/token|password|secret|authorization|signature/i.test(key)) {
        (copy as Record<string, unknown>)[key] = "[REDACTED]";
      } else {
        (copy as Record<string, unknown>)[key] = sanitize(
          (copy as Record<string, unknown>)[key]
        );
      }
    }
    return copy;
  }
  return message;
}

export const logger = {
  log: (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message: sanitize(message),
      meta: meta ? sanitize(meta) : undefined,
    };
    const serialized = JSON.stringify(entry);
    if (level === "ERROR") {
      console.error(serialized);
    } else if (level === "WARN") {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  },
  debug: (message: string, meta?: Record<string, unknown>) => logger.log("DEBUG", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => logger.log("INFO", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => logger.log("WARN", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => logger.log("ERROR", message, meta),
};
