import { useAppState } from "../context/AppProvider";
import type { ResponseStyle, ThemeMode } from "../types/dsa";

function OptionButton({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`option-row ${active ? "option-row-active" : ""}`}
    >
      <span className="option-title">{label}</span>
      <span className="option-desc">{description}</span>
    </button>
  );
}

export function Settings() {
  const { theme, setTheme, responseStyle, setResponseStyle } = useAppState();

  return (
    <div className="page">
      <header className="mb-7">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          Simple preferences for how the instructor looks and answers.
        </p>
      </header>

      <section>
        <h2 className="section-heading">Appearance</h2>
        <div>
          <OptionButton
            active={theme === "dark"}
            label="Dark mode"
            description="Default look for focused reading and coding."
            onClick={() => setTheme("dark" satisfies ThemeMode)}
          />
          <OptionButton
            active={theme === "light"}
            label="Light mode"
            description="A brighter canvas with the same structure."
            onClick={() => setTheme("light" satisfies ThemeMode)}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="section-heading">Instructor</h2>
        <div>
          <OptionButton
            active={responseStyle === "simple"}
            label="Simple"
            description="Shorter, clearer explanations."
            onClick={() => setResponseStyle("simple" satisfies ResponseStyle)}
          />
          <OptionButton
            active={responseStyle === "detailed"}
            label="Detailed"
            description="Richer explanations when more depth helps."
            onClick={() => setResponseStyle("detailed" satisfies ResponseStyle)}
          />
        </div>
      </section>
    </div>
  );
}
