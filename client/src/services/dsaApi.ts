import type {
  ApiError,
  DsaAskApiResponse,
  DsaAskRequest,
} from "../types/dsa";

export const QUOTA_USER_MESSAGE =
  "AI quota reached. The Gemini API limit has been reached for this API key. Please try again after the quota resets.";

export const GENERIC_USER_MESSAGE =
  "Something went wrong. Please try again.";

export const INVALID_CONVERSATION_USER_MESSAGE =
  "This conversation is no longer available. Please start a new conversation.";

export class RequestCancelledError extends Error {
  constructor() {
    super("Request cancelled");
    this.name = "RequestCancelledError";
  }
}

function isBrowserAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; message?: string };
  if (candidate.name === "AbortError") return true;
  const message = String(candidate.message ?? "").toLowerCase();
  return message.includes("aborted") || message.includes("abort");
}

export async function askInstructor(
  request: DsaAskRequest,
  signal?: AbortSignal
): Promise<DsaAskApiResponse> {
  const payload: DsaAskRequest = {
    question: request.question,
    previousInteractionId: request.previousInteractionId,
    responseStyle: request.responseStyle,
    topic: request.topic,
    difficulty: request.difficulty,
  };

  try {
    const response = await fetch("/api/dsa/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    let data: DsaAskApiResponse | ApiError | null = null;
    try {
      data = (await response.json()) as DsaAskApiResponse | ApiError;
    } catch {
      data = null;
    }

    if (signal?.aborted) {
      throw new RequestCancelledError();
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(QUOTA_USER_MESSAGE);
      }

      if (response.status === 499) {
        throw new RequestCancelledError();
      }

      const message =
        data && "error" in data && data.error
          ? data.error
          : GENERIC_USER_MESSAGE;
      throw new Error(message);
    }

    return data as DsaAskApiResponse;
  } catch (error) {
    if (
      error instanceof RequestCancelledError ||
      signal?.aborted ||
      isBrowserAbortError(error)
    ) {
      throw new RequestCancelledError();
    }
    throw error;
  }
}

export async function checkHealth(): Promise<boolean> {
  const response = await fetch("/api/health");
  if (!response.ok) return false;
  const data = (await response.json()) as { status?: string };
  return data.status === "ok";
}
