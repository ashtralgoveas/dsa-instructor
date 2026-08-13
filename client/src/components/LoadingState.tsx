interface LoadingStateProps {
  onCancel: () => void;
}

export function LoadingState({ onCancel }: LoadingStateProps) {
  return (
    <div className="mt-5 space-y-2.5">
      <p className="section-label">AI Instructor</p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="thinking-dot" aria-hidden="true" />
          <p className="m-0 text-sm text-muted">AI is thinking...</p>
        </div>
        <button type="button" onClick={onCancel} className="btn-cancel shrink-0">
          Cancel
        </button>
      </div>
    </div>
  );
}
