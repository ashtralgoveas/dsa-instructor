import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppProvider";
import {
  DSA_TOPICS,
  topicExplainPrompt,
  type DashboardPrefillState,
  type DsaTopic,
} from "../types/dsa";

export function Topics() {
  const navigate = useNavigate();
  const { resetConversation } = useAppState();

  function handleTopicClick(topic: DsaTopic) {
    resetConversation();
    navigate("/dashboard", {
      state: {
        suggestedQuestion: topicExplainPrompt(topic),
      } satisfies DashboardPrefillState,
    });
  }

  return (
    <div className="page">
      <header className="mb-7">
        <h1 className="page-title">DSA Topics</h1>
        <p className="page-subtitle">Explore concepts and start learning.</p>
      </header>

      <ul className="m-0 list-none p-0">
        {DSA_TOPICS.map((topic) => (
          <li key={topic}>
            <button
              type="button"
              onClick={() => handleTopicClick(topic)}
              className="list-row"
            >
              <span className="text-[0.98rem]">{topic}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
