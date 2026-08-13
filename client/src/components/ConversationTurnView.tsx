import type { ConversationTurn } from "../types/dsa";
import { AIResponse } from "./AIResponse";

interface ConversationTurnViewProps {
  turn: ConversationTurn;
}

export function ConversationTurnView({ turn }: ConversationTurnViewProps) {
  return (
    <article className="space-y-6 border-t border-border pt-7 first:border-t-0 first:pt-0">
      <div>
        <p className="section-label">You asked</p>
        <p className="m-0 text-[1rem] leading-relaxed text-ink">
          {turn.userQuestion}
        </p>
      </div>

      <div>
        <p className="section-label">AI Instructor</p>
        <AIResponse response={turn.response} />
      </div>
    </article>
  );
}
