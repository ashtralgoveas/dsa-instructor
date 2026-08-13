import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppProvider";
import type { HistoryEntry } from "../types/dsa";

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function groupHistory(entries: HistoryEntry[]) {
  const todayStart = startOfDay(Date.now());
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

  const groups: { label: string; entries: HistoryEntry[] }[] = [
    { label: "Today", entries: [] },
    { label: "Yesterday", entries: [] },
    { label: "Earlier", entries: [] },
  ];

  for (const entry of entries) {
    if (entry.timestamp >= todayStart) {
      groups[0].entries.push(entry);
    } else if (entry.timestamp >= yesterdayStart) {
      groups[1].entries.push(entry);
    } else {
      groups[2].entries.push(entry);
    }
  }

  return groups.filter((group) => group.entries.length > 0);
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HistoryPage() {
  const navigate = useNavigate();
  const { history, clearHistory, setQuestion } = useAppState();
  const groups = useMemo(() => groupHistory(history), [history]);

  function handleSelect(entry: HistoryEntry) {
    setQuestion(entry.question);
    navigate("/dashboard");
  }

  return (
    <div className="page">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">
            Revisit questions you have asked recently.
          </p>
        </div>

        {history.length > 0 ? (
          <button type="button" onClick={clearHistory} className="btn-text">
            Clear history
          </button>
        ) : null}
      </header>

      {groups.length === 0 ? (
        <p className="m-0 text-sm leading-relaxed text-muted">
          No questions yet. Ask something on the Dashboard to build history.
        </p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="section-label">{group.label}</h2>
              <ul className="m-0 list-none p-0">
                {group.entries.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(entry)}
                      className="list-row"
                    >
                      <span className="text-[0.95rem] leading-relaxed">
                        {entry.question}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {formatTime(entry.timestamp)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
