import { Router } from "express";
import { askDsaInstructor } from "../services/gemini.js";
import { DIFFICULTIES, TOPICS, type DsaAskRequest } from "../types/dsa.js";
import { isAbortError, toClientError } from "../utils/errors.js";

const router = Router();

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

router.post("/ask", async (req, res) => {
  const abortController = new AbortController();

  const abortFromClient = () => {
    if (!abortController.signal.aborted) {
      abortController.abort();
    }
  };

  req.on("aborted", abortFromClient);
  res.on("close", () => {
    if (!res.writableEnded) {
      abortFromClient();
    }
  });

  try {
    const { topic, difficulty, question, previousInteractionId, responseStyle } =
      req.body as Partial<DsaAskRequest>;

    if (!isNonEmptyString(question)) {
      res.status(400).json({ error: "question is required" });
      return;
    }

    if (topic !== undefined) {
      if (typeof topic !== "string") {
        res.status(400).json({ error: "topic must be a string when provided" });
        return;
      }
      if (
        topic.trim() &&
        !TOPICS.includes(topic.trim() as (typeof TOPICS)[number])
      ) {
        res.status(400).json({
          error: `topic must be one of: ${TOPICS.join(", ")}`,
        });
        return;
      }
    }

    if (difficulty !== undefined) {
      if (typeof difficulty !== "string") {
        res
          .status(400)
          .json({ error: "difficulty must be a string when provided" });
        return;
      }
      if (
        difficulty.trim() &&
        !DIFFICULTIES.includes(
          difficulty.trim() as (typeof DIFFICULTIES)[number]
        )
      ) {
        res.status(400).json({
          error: `difficulty must be one of: ${DIFFICULTIES.join(", ")}`,
        });
        return;
      }
    }

    if (previousInteractionId !== undefined) {
      if (typeof previousInteractionId !== "string") {
        res.status(400).json({
          error: "previousInteractionId must be a string when provided",
        });
        return;
      }
      if (!previousInteractionId.trim()) {
        res.status(400).json({
          error: "previousInteractionId cannot be empty when provided",
        });
        return;
      }
    }

    if (responseStyle !== undefined) {
      if (responseStyle !== "simple" && responseStyle !== "detailed") {
        res.status(400).json({
          error: 'responseStyle must be "simple" or "detailed" when provided',
        });
        return;
      }
    }

    const payload: DsaAskRequest = {
      question: question.trim(),
      topic: topic?.trim() || undefined,
      difficulty: difficulty?.trim() || undefined,
      previousInteractionId: previousInteractionId?.trim() || undefined,
      responseStyle,
    };

    const answer = await askDsaInstructor(payload, abortController.signal);

    if (abortController.signal.aborted || res.writableEnded) {
      return;
    }

    res.json(answer);
  } catch (error) {
    if (abortController.signal.aborted || isAbortError(error)) {
      console.log("POST /api/dsa/ask cancelled by client disconnect/abort");
      if (!res.headersSent && !res.writableEnded) {
        res.status(499).json({ error: "Request cancelled" });
      }
      return;
    }

    const { statusCode, userMessage, technicalMessage } = toClientError(error);
    console.error("POST /api/dsa/ask failed:", {
      statusCode,
      technicalMessage,
      error,
    });

    if (!res.headersSent && !res.writableEnded) {
      res.status(statusCode).json({ error: userMessage });
    }
  }
});

export default router;
