import { GoogleGenAI } from "@google/genai";
import {
  buildUserPrompt,
  DSA_SYSTEM_INSTRUCTION,
} from "../prompts/dsaInstructor.js";
import type {
  DsaAskApiResponse,
  DsaAskRequest,
  DsaAskResponse,
} from "../types/dsa.js";

const MODEL = "gemini-3.6-flash";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    question: { type: "string" },
    explanation: { type: "string" },
    example: { type: "string" },
    approach: { type: "string" },
    code: { type: "string" },
    language: { type: "string" },
    timeComplexity: { type: "string" },
    spaceComplexity: { type: "string" },
  },
  required: [
    "question",
    "explanation",
    "example",
    "approach",
    "code",
    "language",
    "timeComplexity",
    "spaceComplexity",
  ],
  additionalProperties: false,
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseStructuredResponse(raw: string): DsaAskResponse {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const parsed = JSON.parse(cleaned) as Partial<DsaAskResponse>;

  return {
    question: asText(parsed.question),
    explanation: asText(parsed.explanation),
    example: asText(parsed.example),
    approach: asText(parsed.approach),
    code: asText(parsed.code),
    language: asText(parsed.language),
    timeComplexity: asText(parsed.timeComplexity),
    spaceComplexity: asText(parsed.spaceComplexity),
  };
}

export async function askDsaInstructor(
  request: DsaAskRequest,
  abortSignal?: AbortSignal
): Promise<DsaAskApiResponse> {
  if (abortSignal?.aborted) {
    const error = new Error("Request aborted");
    error.name = "AbortError";
    throw error;
  }

  const ai = getClient();
  const input = buildUserPrompt(request);

  // Interactions create supports abort via request options.fetchOptions.signal.
  // SDK note: AbortSignal is client-only and does not cancel billed server-side work.
  const interaction = await ai.interactions.create(
    {
      model: MODEL,
      system_instruction: DSA_SYSTEM_INSTRUCTION,
      input,
      previous_interaction_id: request.previousInteractionId,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: RESPONSE_SCHEMA,
      },
    },
    abortSignal
      ? {
          fetchOptions: {
            signal: abortSignal,
          },
        }
      : undefined
  );

  if (abortSignal?.aborted) {
    const error = new Error("Request aborted");
    error.name = "AbortError";
    throw error;
  }

  const raw = interaction.output_text?.trim();
  if (!raw) {
    throw new Error("Empty response from Gemini");
  }

  if (!interaction.id) {
    throw new Error("Gemini response did not include an interaction id");
  }

  return {
    interactionId: interaction.id,
    response: parseStructuredResponse(raw),
  };
}
