import { Fragment } from "react";
import { POPULAR_TOPICS, type PopularTopic } from "../types/dsa";

interface PopularTopicsProps {
  onSelect: (topic: PopularTopic) => void;
  disabled?: boolean;
}

export function PopularTopics({ onSelect, disabled }: PopularTopicsProps) {
  return (
    <section className="mt-6">
      <p className="section-label">Popular topics</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        {POPULAR_TOPICS.map((topic, index) => (
          <Fragment key={topic}>
            {index > 0 ? <span className="topic-sep">·</span> : null}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(topic)}
              className="topic-link"
            >
              {topic}
            </button>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
