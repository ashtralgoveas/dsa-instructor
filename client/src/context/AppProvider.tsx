import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  createHistoryEntry,
  loadHistory,
  saveHistory,
} from "../services/historyStorage";
import {
  applyTheme,
  loadResponseStyle,
  loadTheme,
  saveResponseStyle,
  saveTheme,
} from "../services/preferencesStorage";
import type {
  ConversationTurn,
  HistoryEntry,
  ResponseStyle,
  ThemeMode,
} from "../types/dsa";

interface AppContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  responseStyle: ResponseStyle;
  setResponseStyle: (style: ResponseStyle) => void;
  history: HistoryEntry[];
  addHistoryEntry: (question: string) => void;
  clearHistory: () => void;
  question: string;
  setQuestion: (question: string) => void;
  interactionId: string | null;
  setInteractionId: (id: string | null) => void;
  turns: ConversationTurn[];
  setTurns: Dispatch<SetStateAction<ConversationTurn[]>>;
  resetConversation: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => loadTheme());
  const [responseStyle, setResponseStyleState] = useState<ResponseStyle>(() =>
    loadResponseStyle()
  );
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [question, setQuestion] = useState("");
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);

  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveResponseStyle(responseStyle);
  }, [responseStyle]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
  }, []);

  const setResponseStyle = useCallback((next: ResponseStyle) => {
    setResponseStyleState(next);
  }, []);

  const addHistoryEntry = useCallback((nextQuestion: string) => {
    const trimmed = nextQuestion.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      const withoutDuplicate = prev.filter(
        (entry) => entry.question.toLowerCase() !== trimmed.toLowerCase()
      );
      return [createHistoryEntry(trimmed), ...withoutDuplicate].slice(0, 100);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const resetConversation = useCallback(() => {
    setInteractionId(null);
    setTurns([]);
    setQuestion("");
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      responseStyle,
      setResponseStyle,
      history,
      addHistoryEntry,
      clearHistory,
      question,
      setQuestion,
      interactionId,
      setInteractionId,
      turns,
      setTurns,
      resetConversation,
    }),
    [
      theme,
      setTheme,
      responseStyle,
      setResponseStyle,
      history,
      addHistoryEntry,
      clearHistory,
      question,
      interactionId,
      turns,
      resetConversation,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return context;
}
