export const QUOTA_USER_MESSAGE =
  "AI quota reached. The Gemini API limit has been reached for this API key. Please try again after the quota resets.";

export const GENERIC_USER_MESSAGE =
  "Something went wrong. Please try again.";

export const INVALID_CONVERSATION_USER_MESSAGE =
  "This conversation is no longer available. Please start a new conversation.";

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

function getErrorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function isQuotaExceededError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status === 429) return true;

  const text = getErrorText(error).toLowerCase();
  return (
    text.includes("429") ||
    text.includes("quota") ||
    text.includes("rate limit") ||
    text.includes("resource_exhausted") ||
    text.includes("too many requests")
  );
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

export function toClientError(error: unknown): {
  statusCode: number;
  userMessage: string;
  technicalMessage: string;
} {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      userMessage: error.userMessage,
      technicalMessage: error.message,
    };
  }

  const technicalMessage = getErrorText(error);

  if (isAbortError(error)) {
    return {
      statusCode: 499,
      userMessage: "Request cancelled",
      technicalMessage,
    };
  }

  if (isQuotaExceededError(error)) {
    return {
      statusCode: 429,
      userMessage: QUOTA_USER_MESSAGE,
      technicalMessage,
    };
  }

  if (isInvalidConversationError(error)) {
    return {
      statusCode: 400,
      userMessage: INVALID_CONVERSATION_USER_MESSAGE,
      technicalMessage,
    };
  }

  return {
    statusCode: 500,
    userMessage: GENERIC_USER_MESSAGE,
    technicalMessage,
  };
}
