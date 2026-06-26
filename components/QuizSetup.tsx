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

const minQuestionCount = 10;
const defaultQuestionCount = 25;

function clampQuestionCount(value: number, max: number) {
  return Math.min(Math.max(value, minQuestionCount), max);
}

export default function QuizSetup() {
  const [selectedCategories, setSelectedCategories] = useState<ExamCategory[]>([
    ...examCategories,
  ]);
  const [questionCount, setQuestionCount] = useState(defaultQuestionCount);
  const allCategoriesSelected =
    selectedCategories.length === examCategories.length;
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts | null>(
    null
  );
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);

  const availableQuestionCount = useMemo(() => {
    if (!categoryCounts) return 0;
    return selectedCategories.reduce((sum, c) => sum + (categoryCounts[c] || 0), 0);
  }, [categoryCounts, selectedCategories]);
  const maxQuestionCount = Math.max(minQuestionCount, availableQuestionCount);
  const displayQuestionCount = clampQuestionCount(questionCount, maxQuestionCount);

  const startHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("count", String(displayQuestionCount));

    if (allCategoriesSelected) {
      return `/quiz?${params.toString()}`;
    }

    selectedCategories.forEach((category) => {
      params.append("categories", category);
    });

    return `/quiz?${params.toString()}`;
  }, [allCategoriesSelected, displayQuestionCount, selectedCategories]);

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

  function toggleCategory(category: ExamCategory) {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter(
            (currentCategory) => currentCategory !== category
          )
        : [...currentCategories, category]
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12">
        <div className="flex">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <p className="mt-4 ml-2 text-sm font-medium uppercase tracking-[0.18em] text-emerald-300">
            Mock certification exam
          </p>
        </div>
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Saviynt IGA 100 Exam Trainer
          </h1>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-medium text-white">
                Exam categories to be included
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                {selectedCategories.length} of {examCategories.length} selected
              </p>
            </div>
            <div className="flex gap-2">
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
                onClick={() => setSelectedCategories([])}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {examCategories.map((category) => {
              const isSelected = selectedCategories.includes(category);

              return (
                <label
                  key={category}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                    isSelected
                      ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100"
                      : "border-white/10 bg-neutral-900/60 text-neutral-300 hover:border-white/25 hover:bg-neutral-900"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCategory(category)}
                    className="size-4 accent-emerald-300"
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
                    maxQuestionCount
                  )
                )
              }
              disabled={selectedCategories.length === 0}
              className="h-2 w-full cursor-pointer accent-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
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
                    maxQuestionCount
                  )
                )
              }
              disabled={selectedCategories.length === 0}
              className="h-11 border-white/15 bg-neutral-950 text-neutral-100"
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {selectedCategories.length === 0 ? (
            <Button
              type="button"
              size="lg"
              className="h-11 bg-emerald-300 px-5 text-neutral-950 hover:bg-emerald-200"
              disabled
            >
              Start Mock Exam
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="h-11 bg-emerald-300 px-5 text-neutral-950 hover:bg-emerald-200"
            >
              <Link href={startHref}>
                Start Mock Exam
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>

        <AnalyticsOverview analytics={analytics} />

        <div className="mt-16 grid gap-3 border-t border-white/10 pt-6 text-sm text-neutral-400 sm:grid-cols-3">
          <div>{questionCount} questions</div>
          <div>Multiple choice</div>
          <div>Weighted scoring</div>
        </div>
      </section>
    </main>
  );
}
