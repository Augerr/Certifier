"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { AnalyticsOverview } from "@/components/AnalyticsOverview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuizAnalytics } from "@/types/analytics";
import { examCategories, type ExamCategory } from "@/types/question";

type CategoryCounts = Record<string, number>;
type ContinueAttempt = {
  href: string;
  updatedAt: number;
};

const minQuestionCount = 10;
const defaultQuestionCount = 25;
const secondsPerQuestion = 90;
const weakCategoryThreshold = 80;
const weakCategoryFallbackCount = 3;
const examDraftStoragePrefix = "saviynt-exam-draft:v1:";

function clampQuestionCount(value: number, max: number) {
  return Math.min(Math.max(value, minQuestionCount), max);
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getContinueAttemptFromStorage(): ContinueAttempt | null {
  if (typeof window === "undefined") {
    return null;
  }

  let latestAttempt: ContinueAttempt | null = null;

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key?.startsWith(examDraftStoragePrefix)) {
      continue;
    }

    try {
      const rawDraft = window.localStorage.getItem(key);

      if (!rawDraft) {
        continue;
      }

      const draft = JSON.parse(rawDraft) as {
        version?: unknown;
        questions?: unknown;
        currentIndex?: unknown;
        startedAt?: unknown;
        updatedAt?: unknown;
      };

      if (
        draft.version !== 1 ||
        !Array.isArray(draft.questions) ||
        draft.questions.length === 0 ||
        typeof draft.currentIndex !== "number"
      ) {
        continue;
      }

      const [, , count, timer, categoriesKey = "all"] = key.split(":");
      const questionCount = Number(count);

      if (!Number.isFinite(questionCount) || questionCount < minQuestionCount) {
        continue;
      }

      const params = new URLSearchParams();
      params.set("count", String(questionCount));
      params.set("timer", timer === "timed" ? "1" : "0");

      if (categoriesKey !== "all") {
        categoriesKey.split("|").forEach((category) => {
          if (category) {
            params.append("categories", category);
          }
        });
      }

      const updatedAt =
        typeof draft.updatedAt === "number"
          ? draft.updatedAt
          : typeof draft.startedAt === "number"
            ? draft.startedAt
            : 0;

      if (!latestAttempt || updatedAt > latestAttempt.updatedAt) {
        latestAttempt = {
          href: `/quiz?${params.toString()}`,
          updatedAt,
        };
      }
    } catch {
      // Ignore malformed drafts; the quiz page owns cleanup when it sees them.
    }
  }

  return latestAttempt;
}

export default function QuizSetup() {
  const [selectedCategories, setSelectedCategories] = useState<ExamCategory[]>([
    ...examCategories,
  ]);
  const [questionCount, setQuestionCount] = useState(defaultQuestionCount);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const allCategoriesSelected =
    selectedCategories.length === examCategories.length;
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts | null>(
    null,
  );
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [resettingAnalytics, setResettingAnalytics] = useState(false);
  const [continueAttempt, setContinueAttempt] =
    useState<ContinueAttempt | null>(null);
  const sortedExamCategories = useMemo(
    () => [...examCategories].sort((a, b) => a.localeCompare(b)),
    [],
  );
  const weakAndUntestedCategories = useMemo<ExamCategory[] | null>(() => {
    if (!analytics) {
      return null;
    }

    const categoryPerformance = new Map(
      analytics.byCategory.map((bucket) => [bucket.label, bucket.percentage]),
    );

    return sortedExamCategories.filter((category) => {
      const percentage = categoryPerformance.get(category);

      return percentage === undefined || percentage < weakCategoryThreshold;
    });
  }, [analytics, sortedExamCategories]);

  const availableQuestionCount = useMemo(() => {
    if (!categoryCounts) return 0;
    return selectedCategories.reduce(
      (sum, c) => sum + (categoryCounts[c] || 0),
      0,
    );
  }, [categoryCounts, selectedCategories]);
  const maxQuestionCount = Math.max(minQuestionCount, availableQuestionCount);
  const displayQuestionCount = clampQuestionCount(
    questionCount,
    maxQuestionCount,
  );
  const timeLimitSeconds = displayQuestionCount * secondsPerQuestion;

  const startHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("count", String(displayQuestionCount));
    params.set("fresh", "1");
    params.set("timer", timerEnabled ? "1" : "0");

    if (allCategoriesSelected) {
      return `/quiz?${params.toString()}`;
    }

    selectedCategories.forEach((category) => {
      params.append("categories", category);
    });

    return `/quiz?${params.toString()}`;
  }, [
    allCategoriesSelected,
    displayQuestionCount,
    selectedCategories,
    timerEnabled,
  ]);

  const weakCategoryExam = useMemo(() => {
    if (!analytics || analytics.weakCategories.length === 0) {
      return null;
    }

    const belowThreshold = analytics.weakCategories.filter(
      (bucket) => bucket.percentage < weakCategoryThreshold,
    );
    const focusBuckets =
      belowThreshold.length > 0
        ? belowThreshold
        : analytics.weakCategories.slice(0, weakCategoryFallbackCount);
    const focusCategories = focusBuckets.map((bucket) => bucket.label);

    if (focusCategories.length === 0) {
      return null;
    }

    const availableWeakQuestionCount = categoryCounts
      ? focusCategories.reduce(
          (sum, category) => sum + (categoryCounts[category] || 0),
          0,
        )
      : 0;
    const weakMaxQuestionCount =
      availableWeakQuestionCount > 0
        ? Math.max(minQuestionCount, availableWeakQuestionCount)
        : defaultQuestionCount;
    const weakQuestionCount = clampQuestionCount(
      questionCount,
      weakMaxQuestionCount,
    );
    const params = new URLSearchParams();

    params.set("count", String(weakQuestionCount));
    params.set("fresh", "1");
    params.set("timer", timerEnabled ? "1" : "0");
    focusCategories.forEach((category) => {
      params.append("categories", category);
    });

    return {
      href: `/quiz?${params.toString()}`,
    };
  }, [analytics, categoryCounts, questionCount, timerEnabled]);

  useEffect(() => {
    let mounted = true;

    async function loadMeta() {
      try {
        const [metaResponse, analyticsResponse] = await Promise.all([
          fetch(`/api/quiz?meta=1`),
          fetch(`/api/analytics`),
        ]);
        if (!mounted) return;
        if (metaResponse.ok) {
          const json = await metaResponse.json();
          setCategoryCounts(json.categoryCounts || {});
        }
        if (analyticsResponse.ok) {
          const json = (await analyticsResponse.json()) as QuizAnalytics;
          setAnalytics(json);
        }
      } catch {
        // ignore
      }
    }

    loadMeta();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function updateContinueAttempt() {
      setContinueAttempt(getContinueAttemptFromStorage());
    }

    const timeout = window.setTimeout(updateContinueAttempt, 0);
    window.addEventListener("storage", updateContinueAttempt);
    window.addEventListener("focus", updateContinueAttempt);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("storage", updateContinueAttempt);
      window.removeEventListener("focus", updateContinueAttempt);
    };
  }, []);

  function toggleCategory(category: ExamCategory) {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter(
            (currentCategory) => currentCategory !== category,
          )
        : [...currentCategories, category],
    );
  }

  function randomizeCategories() {
    const randomizedCategories = examCategories.filter(
      () => Math.random() >= 0.5,
    );

    setSelectedCategories(
      randomizedCategories.length > 0
        ? randomizedCategories
        : [examCategories[Math.floor(Math.random() * examCategories.length)]],
    );
  }

  function selectWeakAndUntestedCategories() {
    if (!weakAndUntestedCategories) {
      return;
    }

    setSelectedCategories(weakAndUntestedCategories);
  }

  async function resetScoreHistory() {
    const confirmed = window.confirm(
      "Reset all score history? This cannot be undone.",
    );

    if (!confirmed) return;

    setResettingAnalytics(true);
    try {
      const response = await fetch("/api/analytics", {
        method: "DELETE",
      });

      if (!response.ok) return;

      const json = (await response.json()) as QuizAnalytics;
      setAnalytics(json);
    } finally {
      setResettingAnalytics(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-4xl items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-blue-600/30 bg-blue-600/10 text-blue-500 sm:h-14 sm:w-14">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              SCIP Mock Exam Generator
            </h1>
          </div>
          {continueAttempt && (
            <Button
              asChild
              variant="outline"
              className="h-10 border-blue-600/40 bg-blue-600/10 text-blue-200 hover:bg-blue-600/20 hover:text-blue-100"
            >
              <Link href={continueAttempt.href}>
                Continue Last Attempt
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-medium text-white">
                Categories to be included
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                {selectedCategories.length} of {examCategories.length} selected
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-neutral-950 text-neutral-100 hover:bg-neutral-900"
                onClick={() => setSelectedCategories([...examCategories])}
              >
                All
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-neutral-950 text-neutral-100 hover:bg-neutral-900"
                onClick={randomizeCategories}
              >
                Randomize
              </Button>
              {analytics && analytics.totalAttempts > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/15 bg-neutral-950 text-neutral-100 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={selectWeakAndUntestedCategories}
                  disabled={
                    !weakAndUntestedCategories ||
                    weakAndUntestedCategories.length === 0
                  }
                >
                  Least successful
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-neutral-950 text-neutral-100 hover:bg-neutral-900"
                onClick={() => setSelectedCategories([])}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {sortedExamCategories.map((category) => {
              const isSelected = selectedCategories.includes(category);

              return (
                <label
                  key={category}
                  className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs leading-5 transition ${
                    isSelected
                      ? "border-blue-600/50 bg-blue-600/10 text-blue-300"
                      : "border-white/10 bg-neutral-900/50 text-neutral-300 opacity-45 hover:border-white/25 hover:bg-neutral-900 hover:opacity-80"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCategory(category)}
                    className="size-3.5 shrink-0 accent-blue-600"
                  />
                  <span>{category}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-medium text-white">
                Number of questions
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                {selectedCategories.length === 0
                  ? "Select at least one category to choose an exam length"
                  : `Choose between ${minQuestionCount} and ${availableQuestionCount} questions`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <span>{displayQuestionCount}</span>
              <span>questions</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_7rem] sm:items-center">
            <input
              type="range"
              min={minQuestionCount}
              max={maxQuestionCount}
              value={displayQuestionCount}
              onChange={(event) =>
                setQuestionCount(
                  clampQuestionCount(
                    Number(event.currentTarget.value),
                    maxQuestionCount,
                  ),
                )
              }
              disabled={selectedCategories.length === 0}
              className="h-2 w-full cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            />
            <Input
              type="number"
              min={minQuestionCount}
              max={maxQuestionCount}
              value={displayQuestionCount}
              onChange={(event) =>
                setQuestionCount(
                  clampQuestionCount(
                    Number(event.currentTarget.value),
                    maxQuestionCount,
                  ),
                )
              }
              disabled={selectedCategories.length === 0}
              className="h-11 border-white/15 bg-neutral-950 text-neutral-100"
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          {selectedCategories.length === 0 ? (
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-11 border-blue-600/40 bg-blue-600/10 px-5 text-blue-200 hover:bg-blue-600/20 hover:text-blue-100"
              disabled
            >
              Start New Exam
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 border-blue-600/40 bg-blue-600/10 px-5 text-blue-200 hover:bg-blue-600/20 hover:text-blue-100"
            >
              <Link href={startHref}>
                Start New Exam
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
          <label className="flex h-11 cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-neutral-900/60 px-4 text-sm text-neutral-300 transition hover:border-white/25 hover:bg-neutral-900">
            <input
              type="checkbox"
              checked={timerEnabled}
              onChange={(event) => setTimerEnabled(event.currentTarget.checked)}
              className="sr-only"
            />
            <span
              className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                timerEnabled ? "bg-blue-600" : "bg-neutral-700"
              }`}
              aria-hidden="true"
            >
              <span
                className={`size-4 rounded-full bg-white transition ${
                  timerEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-neutral-100">Time limit</span>
              <span className="mt-1 text-xs text-neutral-500">
                {timerEnabled
                  ? `${formatDuration(timeLimitSeconds)} total (90 seconds/question)`
                  : "90 seconds/question"}
              </span>
            </span>
          </label>
        </div>

        <AnalyticsOverview
          analytics={analytics}
          weakCategoriesExamHref={weakCategoryExam?.href}
        />

        {analytics && analytics.totalAttempts > 0 && (
          <div className="mt-16 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={resetScoreHistory}
              disabled={resettingAnalytics}
              className="border-red-500/30 bg-neutral-950 text-red-300 hover:bg-red-950/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {resettingAnalytics ? "Resetting..." : "Reset Score History"}
            </Button>
          </div>
        )}

        <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 text-sm text-neutral-400 sm:grid-cols-3">
          <div>{questionCount} questions</div>
          <div>Multiple choice</div>
          <div>
            {timerEnabled
              ? `Time limit: ${formatDuration(timeLimitSeconds)}`
              : "No time limit"}
          </div>
        </div>
      </section>
    </main>
  );
}
