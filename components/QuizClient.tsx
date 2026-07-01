"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3, ListChecks } from "lucide-react";

import { ExamProgress } from "@/components/ExamProgress";
import { QuestionCard } from "@/components/QuestionCard";
import { ResultsSummary } from "@/components/ResultsSummary";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { SelectedAnswers } from "@/lib/answer-utils";
import {
  createExamDraftStorageKey,
  readExamDraft,
  removeExamDraft,
  writeExamDraft,
} from "@/lib/quiz-draft-store";
import { quizTheme } from "@/lib/theme-tokens";
import type { QuizAnalytics } from "@/types/analytics";
import type { Difficulty, ExamQuestion, QuestionType } from "@/types/question";

const minQuestionCount = 10;
const secondsPerQuestion = 90;

type QuizClientProps = {
  questionCount: number;
  requestedCategories: string[];
  requestedDifficulties: Difficulty[];
  requestedTypes: QuestionType[];
  timerEnabled: boolean;
  freshStart: boolean;
};

function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function isQuestionAnswered(
  question: ExamQuestion,
  questionAnswers: string[] | undefined,
) {
  if (question.type === "Match") {
    return Boolean(
      question.statements?.length &&
        questionAnswers?.length === question.statements.length &&
        questionAnswers.every(Boolean),
    );
  }

  return Boolean(questionAnswers?.length);
}

function isSequenceQuestion(question: ExamQuestion) {
  return (
    question.type === "Order" ||
    question.type === "Timeline" ||
    question.type === "Workflow"
  );
}

// NOTE: questions are generated and filtered server-side; client does not need
// local category filtering or shuffling. Keep client lightweight.

export function QuizClient({
  questionCount,
  requestedCategories,
  requestedDifficulties,
  requestedTypes,
  timerEnabled,
  freshStart,
}: QuizClientProps) {
  const boundedQuestionCount = Math.max(questionCount, minQuestionCount);
  const examStorageKey = useMemo(() => {
    return createExamDraftStorageKey({
      questionCount: boundedQuestionCount,
      timerEnabled,
      categories: requestedCategories,
      difficulties: requestedDifficulties,
      types: requestedTypes,
    });
  }, [
    boundedQuestionCount,
    requestedCategories,
    requestedDifficulties,
    requestedTypes,
    timerEnabled,
  ]);
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedDurationSeconds, setCompletedDurationSeconds] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SelectedAnswers>({});
  const [isComplete, setIsComplete] = useState(false);
  const finishingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadExam() {
      setLoading(true);
      try {
        if (freshStart) {
          removeExamDraft(examStorageKey);

          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.delete("fresh");
          window.history.replaceState(null, "", currentUrl.toString());
        }

        const savedDraft = freshStart ? null : readExamDraft(examStorageKey);

        if (savedDraft) {
          setSessionId(savedDraft.sessionId);
          setActiveQuestions(savedDraft.questions);
          setAnswers(savedDraft.answers);
          setCurrentIndex(
            Math.min(
              Math.max(savedDraft.currentIndex, 0),
              savedDraft.questions.length - 1,
            ),
          );
          setStartedAt(savedDraft.startedAt);
          setElapsedSeconds(
            savedDraft.startedAt
              ? Math.max(
                  0,
                  Math.floor((Date.now() - savedDraft.startedAt) / 1000),
                )
              : 0,
          );
          return;
        }

        const params = new URLSearchParams();
        params.set("count", String(boundedQuestionCount));
        for (const c of requestedCategories) {
          params.append("categories", c);
        }
        for (const difficulty of requestedDifficulties) {
          params.append("difficulties", difficulty);
        }
        for (const type of requestedTypes) {
          params.append("types", type);
        }

        const res = await fetch(`/api/quiz?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = await res.json();
        const questions = json.questions || [];
        setSessionId(json.sessionId || null);
        setActiveQuestions(questions);
        setStartedAt(questions.length > 0 ? Date.now() : null);
        setElapsedSeconds(0);
      } catch (err) {
        const e = err as { name?: string };
        if (e.name === "AbortError") return;
      } finally {
        setLoading(false);
      }
    }

    loadExam();

    return () => controller.abort();
  }, [
    boundedQuestionCount,
    examStorageKey,
    freshStart,
    requestedCategories,
    requestedDifficulties,
    requestedTypes,
  ]);

  const currentQuestion = activeQuestions[currentIndex];
  const selectedAnswers = currentQuestion
    ? (answers[currentQuestion.id] ?? [])
    : [];
  const isCurrentQuestionAnswered =
    currentQuestion && isSequenceQuestion(currentQuestion)
      ? currentQuestion.choices.length > 0
      : currentQuestion
        ? isQuestionAnswered(currentQuestion, answers[currentQuestion.id])
        : false;
  const isLastQuestion = currentQuestion
    ? currentIndex === activeQuestions.length - 1
    : false;
  const answeredCount = activeQuestions.filter((question) =>
    isQuestionAnswered(question, answers[question.id]),
  ).length;
  const timeLimitSeconds = timerEnabled
    ? activeQuestions.length * secondsPerQuestion
    : null;
  const remainingSeconds =
    timeLimitSeconds === null
      ? 0
      : Math.max(timeLimitSeconds - elapsedSeconds, 0);
  const timerUrgencyClass =
    remainingSeconds <= 60
      ? "border-red-600/50 bg-red-950/40 text-red-200"
      : remainingSeconds <= 300
        ? "border-amber-500/50 bg-amber-950/30 text-amber-200"
        : "border-white/10 bg-neutral-900 text-neutral-300";
  const timerValueClass =
    remainingSeconds <= 60
      ? "text-red-200"
      : remainingSeconds <= 300
        ? "text-amber-200"
        : "text-white";

  useEffect(() => {
    if (loading || isComplete || activeQuestions.length === 0) {
      return;
    }

    writeExamDraft(examStorageKey, {
      version: 1,
      sessionId,
      questions: activeQuestions,
      answers,
      currentIndex,
      startedAt,
    });
  }, [
    activeQuestions,
    answers,
    currentIndex,
    examStorageKey,
    isComplete,
    loading,
    sessionId,
    startedAt,
  ]);

  useEffect(() => {
    if (!startedAt || isComplete || loading) return;

    const startTime = startedAt;

    function updateElapsedTime() {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startTime) / 1000)),
      );
    }

    updateElapsedTime();
    const interval = window.setInterval(updateElapsedTime, 1000);

    return () => window.clearInterval(interval);
  }, [isComplete, loading, startedAt]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (loading || grading || isComplete || !currentQuestion) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "SELECT" ||
        target?.tagName === "TEXTAREA";
      if (isTypingTarget) return;

      const choiceIndex = Number(event.key) - 1;
      const choice = currentQuestion.choices[choiceIndex];
      if (
        !choice ||
        choiceIndex < 0 ||
        choiceIndex > 3 ||
        isSequenceQuestion(currentQuestion) ||
        currentQuestion.type === "Match"
      ) {
        return;
      }

      event.preventDefault();
      setAnswers((currentAnswers) => ({
        ...currentAnswers,
        [currentQuestion.id]:
          currentQuestion.type === "Multiple" ||
          currentQuestion.type === "Scenario" ||
          currentQuestion.type === "Consultant"
            ? currentAnswers[currentQuestion.id]?.includes(choice)
              ? currentAnswers[currentQuestion.id].filter(
                  (answer) => answer !== choice,
                )
              : [...(currentAnswers[currentQuestion.id] ?? []), choice]
            : [choice],
      }));
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentQuestion, grading, isComplete, loading]);

  const finishExam = useCallback(
    async (answersOverride?: SelectedAnswers) => {
      if (finishingRef.current || isComplete) return;
      finishingRef.current = true;
      const answersToSubmit = answersOverride ?? answers;

      const calculatedDurationSeconds = startedAt
        ? Math.max(elapsedSeconds, Math.floor((Date.now() - startedAt) / 1000))
        : elapsedSeconds;
      const durationSeconds =
        timeLimitSeconds === null
          ? calculatedDurationSeconds
          : Math.min(calculatedDurationSeconds, timeLimitSeconds);

      if (!sessionId) {
        setCompletedDurationSeconds(durationSeconds);
        setIsComplete(true);
        removeExamDraft(examStorageKey);
        return;
      }

      setGrading(true);
      try {
        const res = await fetch(`/api/quiz`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sessionId,
            answers: answersToSubmit,
            durationSeconds,
          }),
        });
        if (!res.ok) {
          setGradingError("Server error while grading. Please try again.");
          setCompletedDurationSeconds(durationSeconds);
          setIsComplete(true);
          return;
        }
        const json = await res.json();
        setActiveQuestions(json.gradedQuestions || []);
        setAnalytics(json.analytics || null);
        setCompletedDurationSeconds(json.durationSeconds ?? durationSeconds);
        setIsComplete(true);
        removeExamDraft(examStorageKey);
      } catch {
        setGradingError("Network error while grading. Please try again.");
        setCompletedDurationSeconds(durationSeconds);
        setIsComplete(true);
      } finally {
        setGrading(false);
      }
    },
    [
      answers,
      elapsedSeconds,
      examStorageKey,
      isComplete,
      sessionId,
      startedAt,
      timeLimitSeconds,
    ],
  );

  useEffect(() => {
    if (
      !timerEnabled ||
      !startedAt ||
      loading ||
      grading ||
      isComplete ||
      activeQuestions.length === 0 ||
      remainingSeconds > 0
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void finishExam();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [
    activeQuestions.length,
    finishExam,
    grading,
    isComplete,
    loading,
    remainingSeconds,
    startedAt,
    timerEnabled,
  ]);

  function handleAnswerChange(questionAnswers: string[]) {
    if (!currentQuestion) return;

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: questionAnswers,
    }));
  }

  function handleNext() {
    const nextAnswers =
      currentQuestion &&
      !answers[currentQuestion.id] &&
      isSequenceQuestion(currentQuestion)
        ? {
            ...answers,
            [currentQuestion.id]: currentQuestion.choices,
          }
        : answers;

    if (nextAnswers !== answers) {
      setAnswers(nextAnswers);
    }

    if (isLastQuestion) {
      const unansweredCount = activeQuestions.filter(
        (question) => !isQuestionAnswered(question, nextAnswers[question.id]),
      ).length;

      if (unansweredCount > 0) {
        const confirmed = window.confirm(
          `You still have ${unansweredCount} unanswered question${
            unansweredCount === 1 ? "" : "s"
          }. Finish exam anyway?`,
        );

        if (!confirmed) {
          return;
        }
      }

      void finishExam(nextAnswers);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function handleRetake() {
    // trigger reload by updating state that the effect depends on
    removeExamDraft(examStorageKey);
    setActiveQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setIsComplete(false);
    setSessionId(null);
    setAnalytics(null);
    setStartedAt(null);
    setElapsedSeconds(0);
    setCompletedDurationSeconds(0);
    finishingRef.current = false;
    // re-run effect by setting a micro timeout to refetch
    setTimeout(() => {
      const params = new URLSearchParams();
      params.set("count", String(boundedQuestionCount));
      for (const c of requestedCategories) params.append("categories", c);
      for (const difficulty of requestedDifficulties) {
        params.append("difficulties", difficulty);
      }
      for (const type of requestedTypes) params.append("types", type);
      fetch(`/api/quiz?${params.toString()}`)
        .then((r) => r.json())
        .then((json) => {
          const questions = json.questions || [];
          setSessionId(json.sessionId || null);
          setActiveQuestions(questions);
          setStartedAt(questions.length > 0 ? Date.now() : null);
          setElapsedSeconds(0);
        })
        .catch(() => {});
    }, 50);
  }

  return (
    <main className="relative min-h-screen bg-neutral-950 px-4 py-6 text-neutral-50 sm:px-6 lg:px-8">
      {loading && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 text-center"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="rounded-3xl border border-white/10 bg-neutral-950/95 p-10 shadow-2xl shadow-black/50">
            <LoadingSpinner message="Preparing your exam..." />
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button
              asChild
              variant="ghost"
              className="mb-4 px-0 text-base text-neutral-400 hover:bg-transparent hover:text-white"
            >
              <Link href="/">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back home
              </Link>
            </Button>
            {isComplete && (
              <p className="mt-2 text-base text-neutral-400">
                Review your score and study the explanations.
              </p>
            )}
            <div className="sr-only" aria-live="polite">
              {loading
                ? "Preparing your exam."
                : grading
                  ? "Grading your answers."
                  : ""}
            </div>
            {(loading || grading) && (
              <LoadingSpinner
                message={grading ? "Grading..." : "Loading exam..."}
              />
            )}
          </div>
        </header>

        {isComplete ? (
          gradingError ? (
            <div className="rounded-lg border border-red-600 bg-neutral-900/60 p-6 text-base text-red-300">
              <p className="mb-4">{gradingError}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setGradingError(null);
                    handleRetake();
                  }}
                >
                  Retake
                </Button>
              </div>
            </div>
          ) : (
            <ResultsSummary
              questions={activeQuestions}
              answers={answers}
              analytics={analytics}
              elapsedSeconds={
                timerEnabled ? completedDurationSeconds : undefined
              }
              onRetake={handleRetake}
            />
          )
        ) : loading ? (
          <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-6 text-base text-neutral-300">
            <p>Preparing your exam...</p>
          </div>
        ) : activeQuestions.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-6 text-base text-neutral-300">
            <p>
              No questions were available for the selected categories and count.
            </p>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleRetake}>Try again</Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <div className="min-w-0 space-y-5">
              <div className="sticky top-4 z-20 overflow-hidden rounded-xl border border-white/10 bg-neutral-950/90 shadow-2xl shadow-black/30 backdrop-blur">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg border ${quizTheme.primaryIconSoft}`}
                    >
                      <ListChecks className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-white">
                        Answered {answeredCount} of {activeQuestions.length}
                      </p>
                    </div>
                  </div>
                  {timerEnabled && (
                    <div
                      className={`rounded-lg border px-3 py-2 text-base sm:min-w-36 ${timerUrgencyClass}`}
                    >
                      <p className="flex items-center gap-1 text-sm opacity-70">
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        Remaining
                      </p>
                      <p
                        className={`mt-1 font-mono font-semibold ${timerValueClass}`}
                      >
                        {formatElapsedTime(remainingSeconds)}
                      </p>
                    </div>
                  )}
                </div>
                <ExamProgress
                  completedQuestions={answeredCount}
                  totalQuestions={activeQuestions.length}
                />
              </div>

              <QuestionCard
                question={currentQuestion}
                selectedAnswers={selectedAnswers}
                onAnswerChange={handleAnswerChange}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={handleNext}
                  disabled={
                    (!isLastQuestion && !isCurrentQuestionAnswered) ||
                    loading ||
                    grading
                  }
                  className={`h-11 px-5 text-base ${quizTheme.primaryAction}`}
                >
                  {isLastQuestion ? "Finish Exam" : "Next"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <aside className="rounded-xl border border-white/10 bg-neutral-900/70 p-4 shadow-2xl shadow-black/20 lg:sticky lg:top-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-medium text-white">
                    Question Navigator
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Jump between questions
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-neutral-950 px-2 py-1 text-right">
                  <p className="text-[0.65rem] uppercase tracking-wide text-neutral-500">
                    Completed
                  </p>
                  <p className="text-sm text-neutral-400">
                    {answeredCount}/{activeQuestions.length}
                  </p>
                </div>
              </div>
              <div className="grid max-h-[min(34rem,65vh)] grid-cols-5 gap-2 overflow-y-auto pr-1">
                {activeQuestions.map((question, index) => {
                  const isAnswered = isQuestionAnswered(
                    question,
                    answers[question.id],
                  );
                  const isCurrent = index === currentIndex;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      aria-current={isCurrent ? "step" : undefined}
                      className={`flex aspect-square items-center justify-center rounded-lg border text-base font-medium transition ${
                        isCurrent
                          ? "border-blue-400 bg-blue-500/20 text-blue-100 shadow-lg shadow-blue-950/30 ring-1 ring-blue-400/30"
                          : isAnswered
                            ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200 hover:border-emerald-300/50 hover:bg-emerald-500/25"
                            : "border-white/10 bg-neutral-950/70 text-neutral-400 hover:border-white/25 hover:bg-neutral-900 hover:text-neutral-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
