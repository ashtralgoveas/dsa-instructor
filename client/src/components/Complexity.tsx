interface ComplexityProps {
  timeComplexity: string;
  spaceComplexity: string;
}

function isUseful(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== "n/a" && normalized !== "na" && normalized !== "none";
}

export function Complexity({ timeComplexity, spaceComplexity }: ComplexityProps) {
  const showTime = isUseful(timeComplexity);
  const showSpace = isUseful(spaceComplexity);

  if (!showTime && !showSpace) return null;

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {showTime ? (
        <p className="m-0 text-muted">
          Time: <span className="font-mono text-ink">{timeComplexity}</span>
        </p>
      ) : null}
      {showSpace ? (
        <p className="m-0 text-muted">
          Space: <span className="font-mono text-ink">{spaceComplexity}</span>
        </p>
      ) : null}
    </div>
  );
}
