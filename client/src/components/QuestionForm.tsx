import type { FormEvent } from "react";

interface QuestionFormProps {
  question: string;
  loading: boolean;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
}

export function QuestionForm({
  question,
  loading,
  onQuestionChange,
  onSubmit,
}: QuestionFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="composer">
        <label className="block">
          <span className="sr-only">Ask anything about DSA</span>
          <textarea
            value={question}
            disabled={loading}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="Ask anything about Data Structures & Algorithms..."
            className="composer-input"
          />
        </label>

        <div className="composer-footer">
          <span className="text-xs text-muted">
            Ask a DSA concept, problem, or idea.
          </span>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-primary"
          >
            {loading ? "Thinking..." : "Ask Instructor"}
          </button>
        </div>
      </div>
    </form>
  );
}
