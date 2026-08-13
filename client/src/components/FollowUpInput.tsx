import { useState, type FormEvent } from "react";

interface FollowUpInputProps {
  onSubmit: (question: string) => void;
  onNewConversation: () => void;
}

export function FollowUpInput({
  onSubmit,
  onNewConversation,
}: FollowUpInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <p className="section-label">Follow-up</p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label className="sr-only" htmlFor="follow-up">
          Ask a follow-up
        </label>
        <input
          id="follow-up"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask a follow-up..."
          className="input-primary min-w-0 flex-1 px-3.5 py-2.5 text-sm placeholder:text-muted/70"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="btn-primary"
        >
          Ask
        </button>
      </form>

      <button
        type="button"
        onClick={onNewConversation}
        className="btn-text mt-4"
      >
        + New conversation
      </button>
    </div>
  );
}
