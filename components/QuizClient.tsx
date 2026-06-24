"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ExamProgress } from "@/components/ExamProgress";
import { QuestionCard } from "@/components/QuestionCard";
import { ResultsSummary } from "@/components/ResultsSummary";
import { Button } from "@/components/ui/button";
import type { ExamCategory, ExamQuestion } from "@/lib/exam-data";
import { examCategories, examQuestions } from "@/lib/exam-data";

const examQuestionCount = 25;

type QuizClientProps = {
  requestedDomains: string[];
};

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function getRandomQuestions(
  questions: ExamQuestion[],
  count: number
): ExamQuestion[] {
  return shuffle(questions)
    .slice(0, Math.min(count, questions.length))
    .map((question) => ({
      ...question,
      choices: shuffle(question.choices),
    }));
}

function getSelectedDomains(requestedDomainList: string[]) {
  const selectedDomains = examCategories.filter((category) =>
    requestedDomainList.includes(category)
  );

  return selectedDomains.length > 0
    ? selectedDomains
    : ([...examCategories] as ExamCategory[]);
}

export function QuizClient({ requestedDomains }: QuizClientProps) {
  const selectedDomains = useMemo(
    () => getSelectedDomains(requestedDomains),
    [requestedDomains]
  );
  const questionPool = useMemo(
    () =>
      examQuestions.filter((question) =>
        selectedDomains.includes(question.category)
      ),
    [selectedDomains]
  );
  const [activeQuestions, setActiveQuestions] = useState(() =>
    getRandomQuestions(questionPool, examQuestionCount)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = activeQuestions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === activeQuestions.length - 1;

  const answeredCount = useMemo(
    () =>
      activeQuestions.filter((question) => Boolean(answers[question.id]))
        .length,
    [activeQuestions, answers]
  );

  function handleAnswerChange(answer: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: answer,
    }));
  }

  function handleNext() {
    if (isLastQuestion) {
      setIsComplete(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function handleRetake() {
    setActiveQuestions(getRandomQuestions(questionPool, examQuestionCount));
    setAnswers({});
    setCurrentIndex(0);
    setIsComplete(false);
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-neutral-50 sm:px-6 lg:px-8">
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
          </div>
          {!isComplete && (
            <div className="rounded-lg border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-neutral-300">
              Passing score: 70%
            </div>
          )}
        </header>

        {isComplete ? (
          <ResultsSummary
            questions={activeQuestions}
            answers={answers}
            onRetake={handleRetake}
          />
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
                disabled={!selectedAnswer}
                className="h-11 bg-emerald-300 px-5 text-neutral-950 hover:bg-emerald-200"
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
