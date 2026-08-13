import type { HistoryEntry } from "../types/dsa";

const STORAGE_KEY = "dsa-instructor-history";
const MAX_ENTRIES = 100;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadHistory(): HistoryEntry[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry) =>
        entry &&
        typeof entry.id === "string" &&
        typeof entry.question === "string" &&
        typeof entry.timestamp === "number"
    );
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function createHistoryEntry(question: string): HistoryEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question: question.trim(),
    timestamp: Date.now(),
  };
}
