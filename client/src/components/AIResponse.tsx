import type { DsaAskResponse } from "../types/dsa";
import { CodeBlock } from "./CodeBlock";
import { Complexity } from "./Complexity";

interface AIResponseProps {
  response: DsaAskResponse;
}

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function isUsefulComplexity(value: string | undefined): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  const normalized = trimmed.toLowerCase();
  return normalized !== "n/a" && normalized !== "na" && normalized !== "none";
}

export function AIResponse({ response }: AIResponseProps) {
  const showExample = hasText(response.example);
  const showApproach = hasText(response.approach);
  const showCode = hasText(response.code);
  const showComplexity =
    isUsefulComplexity(response.timeComplexity) ||
    isUsefulComplexity(response.spaceComplexity);

  return (
    <section className="space-y-6">
      {hasText(response.explanation) ? (
        <div>
          <h3 className="section-heading">Explanation</h3>
          <p className="body-text">{response.explanation}</p>
        </div>
      ) : null}

      {showExample ? (
        <div>
          <h3 className="section-heading">Example</h3>
          <p className="body-text">{response.example}</p>
        </div>
      ) : null}

      {showApproach ? (
        <div>
          <h3 className="section-heading">Approach</h3>
          <p className="body-text">{response.approach}</p>
        </div>
      ) : null}

      {showCode ? (
        <div>
          <h3 className="section-heading">Code</h3>
          <CodeBlock code={response.code} language={response.language} />
        </div>
      ) : null}

      {showComplexity ? (
        <div>
          <h3 className="section-heading">Complexity</h3>
          <Complexity
            timeComplexity={response.timeComplexity}
            spaceComplexity={response.spaceComplexity}
          />
        </div>
      ) : null}
    </section>
  );
}
