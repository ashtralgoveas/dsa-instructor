import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2">
        <span className="text-xs text-muted">
          {language?.trim() || "code"}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="btn-text text-xs"
          aria-label="Copy code"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3.5 py-3.5 text-[0.82rem] leading-relaxed">
        <code className="font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
