/**
 * Retry Module — Exponential backoff for external service calls.
 * Prevents silent loss of operations when services are temporarily unavailable.
 */
import { secureLogger } from "./security";

export interface RetryOptions {
  maxRetries?: number; // Default: 3
  baseDelay?: number; // Default: 1000ms
  maxDelay?: number; // Default: 30000ms
  name?: string; // Operation name for logging
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    name = "operation",
    onRetry,
  } = options ?? {};

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        secureLogger.error(
          `[Retry] ${name} failed after ${maxRetries + 1} attempts: ${lastError.message}`
        );
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      secureLogger.warn(
        `[Retry] ${name} attempt ${attempt + 1}/${maxRetries + 1} failed. ` +
          `Retrying in ${Math.round(delay)}ms: ${lastError.message}`
      );

      onRetry?.(attempt + 1, lastError);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // TypeScript safety — should never reach here
  throw lastError ?? new Error(`${name} failed`);
}
