export const QUOTA_USER_MESSAGE =
  "AI quota reached. The Gemini API limit has been reached for this API key. Please try again after the quota resets.";

export const RATE_LIMIT_USER_MESSAGE =
  "The AI service is rate-limiting requests right now. Wait a moment and try again.";

export const TOO_MANY_REQUESTS_USER_MESSAGE =
  "The AI service rejected this request as too many requests. Check the API key configured on the server and Gemini quota in Google AI Studio.";

export const GENERIC_USER_MESSAGE =
  "Something went wrong. Please try again.";

export const INVALID_CONVERSATION_USER_MESSAGE =
  "This conversation is no longer available. Please start a new conversation.";

export const MISSING_API_KEY_USER_MESSAGE =
  "The server is missing GEMINI_API_KEY. Set it in the hosting environment and restart the service.";

export const INVALID_API_KEY_USER_MESSAGE =
  "The Gemini API key on the server was rejected. Update GEMINI_API_KEY and restart the service.";

export const MODEL_UNAVAILABLE_USER_MESSAGE =
  "The configured Gemini model is unavailable for this API key or project.";

export class AppError extends Error {
  statusCode: number;
  userMessage: string;

  constructor(statusCode: number, userMessage: string, technicalMessage?: string) {
    super(technicalMessage || userMessage);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }
}

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;

  const candidate = error as {
    status?: unknown;
    statusCode?: unknown;
    code?: unknown;
    error?: { code?: unknown; status?: unknown };
  };

  const values = [
    candidate.status,
    candidate.statusCode,
    candidate.code,
    candidate.error?.code,
    candidate.error?.status,
  ];

  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && /^\d+$/.test(value)) {
      return Number(value);
    }
  }

  return undefined;
}

function getErrorCodeLabel(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as {
    status?: unknown;
    code?: unknown;
    error?: { status?: unknown; code?: unknown };
  };
  const values = [
    candidate.error?.status,
    candidate.status,
    candidate.error?.code,
    candidate.code,
  ];
  for (const value of values) {
    if (typeof value === "string" && value.trim() && !/^\d+$/.test(value)) {
      return value.trim();
    }
  }
  return undefined;
}

function getErrorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function redactSecrets(text: string): string {
  return text
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, "[redacted-key]")
    .replace(
      /(api[_-]?key|authorization|x-goog-api-key)\s*[:=]\s*["']?[^"'\s,]+/gi,
      "$1=[redacted]"
    );
}

function extractRetryHint(text: string): string | undefined {
  const retryMatch = text.match(
    /retry(?:\s+in|\s+after|Delay)?[^\d]{0,12}(\d+(?:\.\d+)?)\s*(s|sec|secs|seconds|ms|m|min|minutes)?/i
  );
  if (!retryMatch) return undefined;
  const unit = (retryMatch[2] || "s").toLowerCase();
  return `${retryMatch[1]}${unit.startsWith("m") && !unit.startsWith("ms") ? "m" : unit.startsWith("ms") ? "ms" : "s"}`;
}

function extractQuotaMetric(text: string): string | undefined {
  const metricMatch = text.match(
    /quota metric[:\s]+([a-z0-9._-]+)|Quota exceeded for quota metric ['"]([^'"]+)/i
  );
  return metricMatch?.[1] || metricMatch?.[2];
}

export function isQuotaExceededError(error: unknown): boolean {
  return classifyGeminiFailure(error).kind === "quota";
}

export function isInvalidConversationError(error: unknown): boolean {
  const status = getErrorStatus(error);
  const text = getErrorText(error).toLowerCase();

  const mentionsInteraction =
    text.includes("interaction") ||
    text.includes("previous_interaction") ||
    text.includes("conversation");

  const looksInvalid =
    text.includes("not found") ||
    text.includes("invalid") ||
    text.includes("expired") ||
    text.includes("unknown") ||
    text.includes("does not exist") ||
    status === 404;

  return mentionsInteraction && looksInvalid;
}

export function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const candidate = error as { name?: unknown; message?: unknown; code?: unknown };
  if (candidate.name === "AbortError") return true;
  if (candidate.code === "ABORT_ERR") return true;

  const message = String(candidate.message ?? "").toLowerCase();
  return (
    message.includes("aborted") ||
    message.includes("abort") ||
    message.includes("the operation was aborted")
  );
}

type FailureKind =
  | "missing_key"
  | "invalid_key"
  | "model_unavailable"
  | "invalid_conversation"
  | "quota"
  | "rate_limit"
  | "too_many_requests"
  | "abort"
  | "unknown";

function classifyGeminiFailure(error: unknown): { kind: FailureKind } {
  if (isAbortError(error)) return { kind: "abort" };

  const status = getErrorStatus(error);
  const codeLabel = (getErrorCodeLabel(error) || "").toUpperCase();
  const text = getErrorText(error).toLowerCase();

  if (text.includes("gemini_api_key is not set")) {
    return { kind: "missing_key" };
  }

  if (
    status === 401 ||
    status === 403 ||
    codeLabel.includes("UNAUTHENTICATED") ||
    codeLabel.includes("PERMISSION_DENIED") ||
    text.includes("api key not valid") ||
    text.includes("invalid api key") ||
    text.includes("api key expired") ||
    text.includes("caller does not have permission")
  ) {
    return { kind: "invalid_key" };
  }

  if (isInvalidConversationError(error)) {
    return { kind: "invalid_conversation" };
  }

  if (
    status === 404 ||
    codeLabel.includes("NOT_FOUND") ||
    text.includes("model_not_found") ||
    (text.includes("model") && text.includes("not found"))
  ) {
    return { kind: "model_unavailable" };
  }

  const looksTooMany =
    status === 429 ||
    codeLabel.includes("RESOURCE_EXHAUSTED") ||
    codeLabel.includes("RATE_LIMIT") ||
    codeLabel.includes("QUOTA") ||
    text.includes("resource_exhausted") ||
    text.includes("too many requests") ||
    text.includes("rate limit") ||
    text.includes("quota");

  if (looksTooMany) {
    const looksDailyQuota =
      text.includes("quota exceeded") ||
      text.includes("current quota") ||
      text.includes("daily") ||
      text.includes("per day") ||
      text.includes("quota metric") ||
      codeLabel.includes("QUOTA_EXCEEDED");

    const looksRateLimit =
      text.includes("rate limit") ||
      text.includes("per minute") ||
      text.includes("per second") ||
      text.includes("requests per minute") ||
      /\brpm\b/.test(text) ||
      Boolean(extractRetryHint(getErrorText(error)));

    if (looksDailyQuota && !looksRateLimit) return { kind: "quota" };
    if (looksRateLimit && !looksDailyQuota) return { kind: "rate_limit" };
    if (looksDailyQuota) return { kind: "quota" };
    if (looksRateLimit) return { kind: "rate_limit" };
    return { kind: "too_many_requests" };
  }

  return { kind: "unknown" };
}

export function sanitizeUpstreamError(
  error: unknown,
  extras?: { model?: string }
): Record<string, unknown> {
  const technicalMessage = redactSecrets(getErrorText(error)).slice(0, 800);
  return {
    model: extras?.model,
    kind: classifyGeminiFailure(error).kind,
    httpStatus: getErrorStatus(error) ?? null,
    code: getErrorCodeLabel(error) ?? null,
    retryHint: extractRetryHint(technicalMessage) ?? null,
    quotaMetric: extractQuotaMetric(technicalMessage) ?? null,
    message: technicalMessage,
  };
}

export function toClientError(error: unknown): {
  statusCode: number;
  userMessage: string;
  technicalMessage: string;
  kind: FailureKind;
} {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      userMessage: error.userMessage,
      technicalMessage: redactSecrets(error.message),
      kind: classifyGeminiFailure(error).kind,
    };
  }

  const technicalMessage = redactSecrets(getErrorText(error));
  const { kind } = classifyGeminiFailure(error);

  if (kind === "abort") {
    return {
      statusCode: 499,
      userMessage: "Request cancelled",
      technicalMessage,
      kind,
    };
  }

  if (kind === "missing_key") {
    return {
      statusCode: 500,
      userMessage: MISSING_API_KEY_USER_MESSAGE,
      technicalMessage,
      kind,
    };
  }

  if (kind === "invalid_key") {
    return {
      statusCode: 401,
      userMessage: INVALID_API_KEY_USER_MESSAGE,
      technicalMessage,
      kind,
    };
  }

  if (kind === "model_unavailable") {
    return {
      statusCode: 502,
      userMessage: MODEL_UNAVAILABLE_USER_MESSAGE,
      technicalMessage,
      kind,
    };
  }

  if (kind === "quota") {
    return {
      statusCode: 429,
      userMessage: QUOTA_USER_MESSAGE,
      technicalMessage,
      kind,
    };
  }

  if (kind === "rate_limit") {
    return {
      statusCode: 429,
      userMessage: RATE_LIMIT_USER_MESSAGE,
      technicalMessage,
      kind,
    };
  }

  if (kind === "too_many_requests") {
    return {
      statusCode: 429,
      userMessage: TOO_MANY_REQUESTS_USER_MESSAGE,
      technicalMessage,
      kind,
    };
  }

  if (kind === "invalid_conversation") {
    return {
      statusCode: 400,
      userMessage: INVALID_CONVERSATION_USER_MESSAGE,
      technicalMessage,
      kind,
    };
  }

  return {
    statusCode: 500,
    userMessage: GENERIC_USER_MESSAGE,
    technicalMessage,
    kind,
  };
}
