import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ConversationTurnView } from "../components/ConversationTurnView";
import { FollowUpInput } from "../components/FollowUpInput";
import { LoadingState } from "../components/LoadingState";
import { PopularTopics } from "../components/PopularTopics";
import { QuestionForm } from "../components/QuestionForm";
import { useAppState } from "../context/AppProvider";
import {
  askInstructor,
  GENERIC_USER_MESSAGE,
  INVALID_CONVERSATION_USER_MESSAGE,
  QUOTA_USER_MESSAGE,
  RequestCancelledError,
} from "../services/dsaApi";
import type { ConversationTurn, DashboardPrefillState, PopularTopic } from "../types/dsa";
import { topicExplainPrompt } from "../types/dsa";

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    question,
    setQuestion,
    interactionId,
    setInteractionId,
    turns,
    setTurns,
    resetConversation,
    addHistoryEntry,
    responseStyle,
  } = useAppState();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelledNotice, setCancelledNotice] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<{
    question: string;
    mode: "new" | "follow-up";
  } | null>(null);
  const requestInFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const hasConversation = turns.length > 0;
  const showInitialComposer = !hasConversation && !pendingQuestion;

  useEffect(() => {
    const state = location.state as DashboardPrefillState | null;
    const suggested = state?.suggestedQuestion?.trim();
    if (!suggested) return;

    setQuestion(suggested);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, setQuestion]);

  function clearActiveRequest() {
    requestInFlightRef.current = false;
    abortControllerRef.current = null;
    setLoading(false);
  }

  async function submitQuestion(
    nextQuestion: string,
    mode: "new" | "follow-up"
  ) {
    const trimmed = nextQuestion.trim();
    if (!trimmed || loading || requestInFlightRef.current) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    requestInFlightRef.current = true;
    setLoading(true);
    setError(null);
    setCancelledNotice(false);
    setLastAttempt({ question: trimmed, mode });

    if (mode === "new") {
      setPendingQuestion(trimmed);
      setTurns([]);
      setInteractionId(null);
    }

    try {
      const result = await askInstructor(
        {
          question: trimmed,
          previousInteractionId:
            mode === "follow-up" && interactionId ? interactionId : undefined,
          responseStyle,
        },
        controller.signal
      );

      if (controller.signal.aborted) {
        return;
      }

      const turn: ConversationTurn = {
        id: result.interactionId,
        userQuestion: trimmed,
        response: result.response,
      };

      setInteractionId(result.interactionId);
      setTurns((prev) => (mode === "new" ? [turn] : [...prev, turn]));
      addHistoryEntry(trimmed);
      setPendingQuestion(null);
      setQuestion("");
      setCancelledNotice(false);
    } catch (err) {
      if (err instanceof RequestCancelledError || controller.signal.aborted) {
        return;
      }

      const message =
        err instanceof Error ? err.message : GENERIC_USER_MESSAGE;
      setError(message);

      if (message === INVALID_CONVERSATION_USER_MESSAGE) {
        setInteractionId(null);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        clearActiveRequest();
      }
    }
  }

  function handleCancel() {
    const controller = abortControllerRef.current;
    if (!controller) return;

    const cancellingFollowUp = hasConversation;

    controller.abort();
    abortControllerRef.current = null;
    requestInFlightRef.current = false;
    setLoading(false);
    setError(null);

    if (!hasConversation) {
      const cancelledQuestion = pendingQuestion ?? lastAttempt?.question ?? "";
      setPendingQuestion(null);
      setQuestion(cancelledQuestion);
      setCancelledNotice(false);
      return;
    }

    if (cancellingFollowUp) {
      setCancelledNotice(true);
    }
  }

  function handleAsk() {
    void submitQuestion(question, "new");
  }

  function handleFollowUp(followUp: string) {
    void submitQuestion(followUp, "follow-up");
  }

  function handleRetry() {
    if (!lastAttempt || loading || requestInFlightRef.current) return;
    void submitQuestion(lastAttempt.question, lastAttempt.mode);
  }

  function handleNewConversation() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestInFlightRef.current = false;
    setLoading(false);
    resetConversation();
    setPendingQuestion(null);
    setError(null);
    setLastAttempt(null);
    setCancelledNotice(false);
  }

  function handleTopicSelect(topic: PopularTopic) {
    setQuestion(topicExplainPrompt(topic));
  }

  return (
    <div className="page">
      <header className="mb-7">
        <h1 className="page-title">
          <span className="page-title-accent">DSA Instructor</span>
        </h1>
        <p className="page-subtitle">
          Learn Data Structures & Algorithms with your AI instructor.
        </p>
      </header>

      {showInitialComposer ? (
        <>
          <QuestionForm
            question={question}
            loading={loading}
            onQuestionChange={setQuestion}
            onSubmit={handleAsk}
          />
          <PopularTopics disabled={loading} onSelect={handleTopicSelect} />
        </>
      ) : null}

      {pendingQuestion && !hasConversation ? (
        <section className="space-y-5">
          <div>
            <p className="section-label">You asked</p>
            <p className="m-0 text-[1rem] leading-relaxed text-ink">
              {pendingQuestion}
            </p>
          </div>
          {loading ? <LoadingState onCancel={handleCancel} /> : null}
        </section>
      ) : null}

      {hasConversation ? (
        <section className="space-y-8">
          {turns.map((turn) => (
            <ConversationTurnView key={turn.id} turn={turn} />
          ))}
        </section>
      ) : null}

      {loading && hasConversation ? (
        <LoadingState onCancel={handleCancel} />
      ) : null}

      {error ? (
        <div className="mt-7 space-y-3 border-t border-border pt-5">
          <p className="status-error m-0 text-sm leading-relaxed">
            {error === QUOTA_USER_MESSAGE ||
            error === INVALID_CONVERSATION_USER_MESSAGE
              ? error
              : GENERIC_USER_MESSAGE}
          </p>
          {error !== QUOTA_USER_MESSAGE &&
          error !== INVALID_CONVERSATION_USER_MESSAGE &&
          error !== GENERIC_USER_MESSAGE ? (
            <p className="m-0 text-xs text-muted">{error}</p>
          ) : null}
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleRetry}
              disabled={loading || !lastAttempt}
              className="btn-text"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={handleNewConversation}
              disabled={loading}
              className="btn-text"
            >
              + New conversation
            </button>
          </div>
        </div>
      ) : null}

      {hasConversation && !error && !loading ? (
        <>
          {cancelledNotice ? (
            <p className="mt-6 mb-0 text-sm text-muted">Generation cancelled.</p>
          ) : null}
          <FollowUpInput
            onSubmit={handleFollowUp}
            onNewConversation={handleNewConversation}
          />
        </>
      ) : null}
    </div>
  );
}
