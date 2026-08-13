export const POPULAR_TOPICS = [
  "Arrays",
  "Hash Maps",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Trees",
  "Graphs",
] as const;

export const DSA_TOPICS = [
  "Arrays",
  "Hash Maps",
  "Strings",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked Lists",
  "Trees",
  "Heaps",
  "Graphs",
  "Dynamic Programming",
] as const;

export type PopularTopic = (typeof POPULAR_TOPICS)[number];
export type DsaTopic = (typeof DSA_TOPICS)[number];
export type ThemeMode = "dark" | "light";
export type ResponseStyle = "simple" | "detailed";

export interface DsaAskRequest {
  question: string;
  topic?: string;
  difficulty?: string;
  previousInteractionId?: string;
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

export interface ConversationTurn {
  id: string;
  userQuestion: string;
  response: DsaAskResponse;
}

export interface HistoryEntry {
  id: string;
  question: string;
  timestamp: number;
}

export interface ApiError {
  error: string;
}

export interface DashboardPrefillState {
  suggestedQuestion?: string;
}

export const TOPIC_PROMPTS: Record<DsaTopic, string> = {
  Arrays: "Explain Arrays and common array patterns.",
  "Hash Maps": "Explain Hash Maps and when I should use them.",
  Strings: "Explain common String problems and patterns in DSA.",
  "Two Pointers": "Explain the Two Pointers technique with an example.",
  "Sliding Window": "Explain the Sliding Window technique with an example.",
  Stack: "Explain Stacks and common Stack patterns.",
  "Binary Search": "Explain Binary Search and how it works.",
  "Linked Lists": "Explain Linked Lists and how they work.",
  Trees: "Explain Trees and common tree traversal techniques.",
  Heaps: "Explain Heaps and when they are useful.",
  Graphs: "Explain Graphs and common graph traversal techniques.",
  "Dynamic Programming":
    "Explain Dynamic Programming in a beginner-friendly way.",
};

export function topicExplainPrompt(topic: string): string {
  return TOPIC_PROMPTS[topic as DsaTopic] ?? `Explain ${topic} and how it works.`;
}
