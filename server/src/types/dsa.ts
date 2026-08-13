export const TOPICS = [
  "Arrays",
  "Hash Maps",
  "Strings",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Dynamic Programming",
] as const;

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export type Topic = (typeof TOPICS)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

export type ResponseStyle = "simple" | "detailed";

export interface DsaAskRequest {
  question: string;
  /** Optional hint; AI can also infer topic from the question */
  topic?: string;
  /** Optional hint; not required for natural questions */
  difficulty?: string;
  /** Interactions API previous interaction id for follow-ups */
  previousInteractionId?: string;
  /** Optional UI preference for answer depth */
  responseStyle?: ResponseStyle;
}

export interface DsaAskResponse {
  question: string;
  explanation: string;
  example: string;
  approach: string;
  code: string;
  language: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface DsaAskApiResponse {
  interactionId: string;
  response: DsaAskResponse;
}

export interface ApiErrorBody {
  error: string;
}
