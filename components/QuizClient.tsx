"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ExamProgress } from "@/components/ExamProgress";
import { QuestionCard } from "@/components/QuestionCard";
import { ResultsSummary } from "@/components/ResultsSummary";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { QuizAnalytics } from "@/types/analytics";
import type { ExamQuestion } from "@/types/question";

const minQuestionCount = 10;

type QuizClientProps = {
  questionCount: number;
  requestedCategories: string[];
};


// NOTE: questions are generated and filtered server-side; client does not need
// local category filtering or shuffling. Keep client lightweight.

export function QuizClient({
  questionCount,
  requestedCategories,
}: QuizClientProps) {
  const boundedQuestionCount = Math.max(questionCount, minQuestionCount);
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadExam() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("count", String(boundedQuestionCount));
        for (const c of requestedCategories) {
          params.append("categories", c);
        }

        const res = await fetch(`/api/quiz?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = await res.json();
        setSessionId(json.sessionId || null);
        setActiveQuestions(json.questions || []);
      } catch (err) {
        const e = err as { name?: string };
        if (e.name === "AbortError") return;
      } finally {
        setLoading(false);
      }
    }

    loadExam();

    return () => controller.abort();
  }, [boundedQuestionCount, requestedCategories]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = activeQuestions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = currentQuestion
    ? currentIndex === activeQuestions.length - 1
    : false;

  const answeredCount = useMemo(
    () =>
      activeQuestions.filter((question) => Boolean(answers[question.id]))
        .length,
    [activeQuestions, answers]
  );

  function handleAnswerChange(answer: string) {
    if (!currentQuestion) return;

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: answer,
    }));
  }

  function handleNext() {
    if (isLastQuestion) {
      // grade on the server
      (async () => {
        if (!sessionId) {
          setIsComplete(true);
          return;
        }

        setGrading(true);
        try {
          const res = await fetch(`/api/quiz`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ sessionId, answers }),
          });
          if (!res.ok) {
            setGradingError("Server error while grading. Please try again.");
            setIsComplete(true);
            return;
          }
          const json = await res.json();
          setActiveQuestions(json.gradedQuestions || []);
          setAnalytics(json.analytics || null);
          setIsComplete(true);
        } catch {
          setGradingError("Network error while grading. Please try again.");
          setIsComplete(true);
        } finally {
          setGrading(false);
        }
      })();
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function handleRetake() {
    // trigger reload by updating state that the effect depends on
    setActiveQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setIsComplete(false);
    setSessionId(null);
    setAnalytics(null);
    // re-run effect by setting a micro timeout to refetch
    setTimeout(() => {
      const params = new URLSearchParams();
      params.set("count", String(boundedQuestionCount));
      for (const c of requestedCategories) params.append("categories", c);
      fetch(`/api/quiz?${params.toString()}`)
        .then((r) => r.json())
        .then((json) => {
          setSessionId(json.sessionId || null);
          setActiveQuestions(json.questions || []);
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
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button
              asChild
              variant="ghost"
              className="mb-4 px-0 text-neutral-400 hover:bg-transparent hover:text-white"
            >
              <Link href="/">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back home
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Mock Exam
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              {isComplete
                ? "Review your score and study the explanations."
                : `${answeredCount} of ${activeQuestions.length} answered`}
            </p>
            <div className="sr-only" aria-live="polite">
              {loading
                ? "Preparing your exam."
                : grading
                ? "Grading your answers."
                : ""}
            </div>
            {(loading || grading) && (
              <LoadingSpinner message={grading ? "Grading..." : "Loading exam..."} />
            )}
          </div>
          {!isComplete && (
            <div className="rounded-lg border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-neutral-300">
              Passing score: 70% weighted
            </div>
          )}
        </header>

        {isComplete ? (
          gradingError ? (
            <div className="rounded-lg border border-red-600 bg-neutral-900/60 p-6 text-sm text-red-300">
              <p className="mb-4">{gradingError}</p>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setGradingError(null);
                  handleRetake();
                }}>Retake</Button>
              </div>
            </div>
          ) : (
            <ResultsSummary
              questions={activeQuestions}
              answers={answers}
              analytics={analytics}
              onRetake={handleRetake}
            />
          )
        ) : loading ? (
          <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-6 text-sm text-neutral-300">
            <p>Preparing your exam...</p>
          </div>
        ) : activeQuestions.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-6 text-sm text-neutral-300">
            <p>No questions were available for the selected categories and count.</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleRetake}>Try again</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ExamProgress
              currentQuestion={currentIndex + 1}
              totalQuestions={activeQuestions.length}
            />
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onAnswerChange={handleAnswerChange}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="lg"
                onClick={handleNext}
                disabled={!selectedAnswer || loading || grading}
                className="h-11 bg-emerald-500 px-5 text-white hover:bg-emerald-400"
              >
                {isLastQuestion ? "Finish Exam" : "Next"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
