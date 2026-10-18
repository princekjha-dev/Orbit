/**
 * Orbit Dots — Groq Error Handling Architecture
 *
 * Provides typed domain errors and structured response mappers
 * for all Groq LLM API and orchestrator failures.
 * Guarantees zero leakage of secret keys or internal stack traces.
 */

export type GroqErrorCode =
  | "GROQ_NOT_CONFIGURED"
  | "INVALID_API_KEY"
  | "RATE_LIMIT_EXCEEDED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INVALID_MODEL"
  | "CONTEXT_TOO_LARGE"
  | "PROVIDER_OUTAGE"
  | "AI_PROVIDER_ERROR";

export interface StructuredErrorResponse {
  success: false;
  error: {
    code: GroqErrorCode | string;
    message: string;
    retryable?: boolean;
  };
}

export class GroqBaseError extends Error {
  code: GroqErrorCode;
  statusCode: number;
  retryable: boolean;

  constructor(code: GroqErrorCode, message: string, statusCode = 500, retryable = false) {
    super(message);
    this.name = "GroqBaseError";
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

export class GroqConfigError extends GroqBaseError {
  constructor(message = "GROQ_API_KEY is not configured in the server environment.") {
    super("GROQ_NOT_CONFIGURED", message, 503, false);
    this.name = "GroqConfigError";
  }
}

export class GroqAuthError extends GroqBaseError {
  constructor(message = "The configured GROQ_API_KEY is invalid or unauthorized.") {
    super("INVALID_API_KEY", message, 401, false);
    this.name = "GroqAuthError";
  }
}

export class GroqRateLimitError extends GroqBaseError {
  constructor(message = "Groq API rate limit reached. Please wait a moment before sending another message.") {
    super("RATE_LIMIT_EXCEEDED", message, 429, true);
    this.name = "GroqRateLimitError";
  }
}

export class GroqTimeoutError extends GroqBaseError {
  constructor(message = "The AI Coworker request timed out. Please try again.") {
    super("TIMEOUT", message, 504, true);
    this.name = "GroqTimeoutError";
  }
}

export class GroqContextError extends GroqBaseError {
  constructor(message = "The conversation context exceeds allowable limits. Please start a new topic.") {
    super("CONTEXT_TOO_LARGE", message, 400, false);
    this.name = "GroqContextError";
  }
}

export class GroqProviderError extends GroqBaseError {
  constructor(message = "The AI service is temporarily unavailable. Please try again shortly.") {
    super("PROVIDER_OUTAGE", message, 502, true);
    this.name = "GroqProviderError";
  }
}

/**
 * Sanitizes any raw exception from Groq SDK or fetch, mapping it
 * into a safe, client-presentable structured error response.
 * Completely strips any keys, authorization headers, or sensitive paths.
 */
export function formatGroqApiError(err: unknown): {
  response: StructuredErrorResponse;
  statusCode: number;
} {
  // 1. Known Groq domain error
  if (err instanceof GroqBaseError) {
    return {
      statusCode: err.statusCode,
      response: {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          retryable: err.retryable,
        },
      },
    };
  }

  const rawMessage = (err as any)?.message || String(err || "");
  const lowerMsg = rawMessage.toLowerCase();
  const status = (err as any)?.status || (err as any)?.statusCode;

  // 2. Missing key or configuration
  if (lowerMsg.includes("groq_api_key") || lowerMsg.includes("not configured")) {
    return {
      statusCode: 503,
      response: {
        success: false,
        error: {
          code: "GROQ_NOT_CONFIGURED",
          message: "The Dot service requires GROQ_API_KEY to be configured in server environment variables.",
          retryable: false,
        },
      },
    };
  }

  // 3. Invalid API key / 401
  if (status === 401 || lowerMsg.includes("invalid api key") || lowerMsg.includes("invalid_api_key")) {
    return {
      statusCode: 401,
      response: {
        success: false,
        error: {
          code: "INVALID_API_KEY",
          message: "The server AI service credentials are invalid or expired. Please check GROQ_API_KEY in server configuration.",
          retryable: false,
        },
      },
    };
  }

  // 4. Rate limiting / 429
  if (status === 429 || lowerMsg.includes("rate limit") || lowerMsg.includes("too many requests")) {
    return {
      statusCode: 429,
      response: {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "AI coworker request limit reached. Please wait a few seconds and try again.",
          retryable: true,
        },
      },
    };
  }

  // 5. Timeout / abort
  if (lowerMsg.includes("timeout") || lowerMsg.includes("abort") || status === 504) {
    return {
      statusCode: 504,
      response: {
        success: false,
        error: {
          code: "TIMEOUT",
          message: "AI Coworker request timed out. Please try again.",
          retryable: true,
        },
      },
    };
  }

  // 6. Context length exceeded
  if (lowerMsg.includes("context length") || lowerMsg.includes("maximum context") || lowerMsg.includes("token limit")) {
    return {
      statusCode: 400,
      response: {
        success: false,
        error: {
          code: "CONTEXT_TOO_LARGE",
          message: "The conversation length exceeds the allowable token limit. Please start a new session.",
          retryable: false,
        },
      },
    };
  }

  // 7. General fallback
  return {
    statusCode: 500,
    response: {
      success: false,
      error: {
        code: "AI_PROVIDER_ERROR",
        message: "The AI Coworker could not complete the request at this time. Please try again.",
        retryable: true,
      },
    },
  };
}
