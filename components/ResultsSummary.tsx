import type { CSSProperties } from "react";
import {
  CheckCircle2,
  Target,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { difficultyPointValue } from "@/lib/exam-data";
import { passingPercentage } from "@/lib/exam-data";
import { examCategories } from "@/types/question";
import type { ExamCategory, ExamQuestion } from "@/types/question";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatAnswerList,
  getCorrectAnswers,
  isQuestionCorrect,
  type SelectedAnswers,
} from "@/lib/answer-utils";
import type { QuizAnalytics } from "@/types/analytics";

const confettiPieces = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 7) * 90}ms`,
  drift: `${((index % 9) - 4) * 0.85}rem`,
  hue: `${140 + ((index * 47) % 180)}`,
  size: `${6 + (index % 4) * 2}px`,
  duration: `${1850 + (index % 5) * 170}ms`,
}));

type ResultsSummaryProps = {
  questions: ExamQuestion[];
  answers: SelectedAnswers;
  analytics?: QuizAnalytics | null;
  elapsedSeconds?: number;
  onRetake: () => void;
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

export function ResultsSummary({
  questions,
  answers,
  analytics,
  elapsedSeconds,
  onRetake,
}: ResultsSummaryProps) {
  const correctCount = questions.filter(
    (question) =>
      isQuestionCorrect(question, answers[question.id])
  ).length;
  const totalPoints = questions.reduce(
    (sum, question) => sum + difficultyPointValue[question.difficulty],
    0
  );
  const earnedPoints = questions.reduce(
    (sum, question) =>
      isQuestionCorrect(question, answers[question.id])
        ? sum + difficultyPointValue[question.difficulty]
        : sum,
    0
  );
  const percentage =
    totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
  const passed = percentage >= passingPercentage;
  const categoryPerformance = examCategories
    .map((category) => {
      const categoryQuestions = questions.filter(
        (question) => question.category === category
      );
      const categoryCorrect = categoryQuestions.filter(
        (question) =>
          isQuestionCorrect(question, answers[question.id])
      ).length;
      const categoryTotalPoints = categoryQuestions.reduce(
        (sum, question) => sum + difficultyPointValue[question.difficulty],
        0
      );
      const categoryEarnedPoints = categoryQuestions.reduce(
        (sum, question) =>
          isQuestionCorrect(question, answers[question.id])
            ? sum + difficultyPointValue[question.difficulty]
            : sum,
        0
      );
      const categoryPercentage =
        categoryTotalPoints === 0
          ? 0
          : Math.round((categoryEarnedPoints / categoryTotalPoints) * 100);

      return {
        category,
        correct: categoryCorrect,
        total: categoryQuestions.length,
        earnedPoints: categoryEarnedPoints,
        totalPoints: categoryTotalPoints,
        percentage: categoryPercentage,
      };
    })
    .filter(
      (
        result
      ): result is {
        category: ExamCategory;
        correct: number;
        total: number;
        earnedPoints: number;
        totalPoints: number;
        percentage: number;
      } => result.total > 0
    );

  return (
    <div className="space-y-6">
      {passed && (
        <div className="celebration-confetti" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className="celebration-confetti-piece"
              style={
                {
                  "--piece-left": piece.left,
                  "--piece-delay": piece.delay,
                  "--piece-drift": piece.drift,
                  "--piece-hue": piece.hue,
                  "--piece-size": piece.size,
                  "--piece-duration": piece.duration,
                } as CSSProperties &
                  Record<
                    | "--piece-left"
                    | "--piece-delay"
                    | "--piece-drift"
                    | "--piece-hue"
                    | "--piece-size"
                    | "--piece-duration",
                    string
                  >
              }
            />
          ))}
        </div>
      )}

      <Card
        className={`relative border text-neutral-50 ring-0 ${
          passed
            ? "celebration-score-card border-emerald-500/30 bg-neutral-900"
            : "border-white/10 bg-neutral-900"
        }`}
      >
        <CardHeader className="px-6 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="relative z-10">
              <Badge
                variant="outline"
                className={
                  passed
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/50 text-red-400"
                }
              >
                {passed && <Sparkles className="size-3" aria-hidden="true" />}
                {passed ? "Pass" : "Fail"}
              </Badge>
              <CardTitle className="mt-4 flex flex-wrap items-center gap-3 text-3xl text-white">
                {passed && (
                  <span className="celebration-trophy flex size-11 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <Trophy className="size-6" aria-hidden="true" />
                  </span>
                )}
                {earnedPoints}/{totalPoints} points
              </CardTitle>
              <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-md border border-white/10 bg-neutral-950/50 px-3 py-2">
                  <p className="text-xs text-neutral-500">Score</p>
                  <p className="mt-1 font-semibold text-white">{percentage}%</p>
                </div>
                <div className="rounded-md border border-white/10 bg-neutral-950/50 px-3 py-2">
                  <p className="text-xs text-neutral-500">Correct</p>
                  <p className="mt-1 font-semibold text-white">
                    {correctCount}/{questions.length}
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-neutral-950/50 px-3 py-2">
                  <p className="text-xs text-neutral-500">Points</p>
                  <p className="mt-1 font-semibold text-white">
                    {earnedPoints}/{totalPoints}
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-neutral-950/50 px-3 py-2">
                  <p className="text-xs text-neutral-500">Time</p>
                  <p className="mt-1 font-semibold text-white">
                    {elapsedSeconds === undefined
                      ? "Not shown"
                      : formatElapsedTime(elapsedSeconds)}
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-neutral-950/50 px-3 py-2">
                  <p className="text-xs text-neutral-500">Passing</p>
                  <p className="mt-1 font-semibold text-white">
                    {passingPercentage}%
                  </p>
                </div>
              </div>
            </div>
            <div className="relative z-10 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onRetake}
                className="border-white/15 bg-neutral-950 text-neutral-100 hover:bg-neutral-800"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Retake
              </Button>
              <Button asChild className="bg-emerald-500 text-white hover:bg-emerald-400">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {analytics && analytics.totalAttempts > 0 && (
        <Card className="border border-white/10 bg-neutral-900/80 text-neutral-50 ring-0">
          <CardHeader className="px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Target className="size-5 text-red-400" aria-hidden="true" />
                  Weak Areas Over Time
                </CardTitle>
                <p className="mt-2 text-sm text-neutral-400">
                  Lifetime average {analytics.averageScore}% across{" "}
                  {analytics.totalAttempts} attempts
                </p>
              </div>
              <Badge
                variant="outline"
                className="w-fit border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              >
                {analytics.passRate}% pass rate
              </Badge>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {analytics.weakCategories.slice(0, 4).map((result) => (
                <div
                  key={result.label}
                  className="rounded-lg border border-white/10 bg-neutral-950/50 p-4"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <Badge
                      variant="outline"
                      className="border-red-500/40 bg-red-500/10 text-red-400"
                    >
                      {result.label}
                    </Badge>
                    <span className="text-neutral-300">
                      {result.percentage}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    {result.correct}/{result.totalQuestions} correct over time
                  </p>
                  <Progress
                    value={result.percentage}
                    className="mt-3 h-2 bg-neutral-800"
                  />
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>
      )}

      <Card className="border border-white/10 bg-neutral-900/80 text-neutral-50 ring-0">
        <CardHeader className="px-6 py-5">
          <CardTitle className="text-lg text-white">
            Category Performance
          </CardTitle>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {categoryPerformance.map((result) => (
              <div
                key={result.category}
                className="rounded-lg border border-white/10 bg-neutral-950/50 p-4"
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <Badge
                    variant="outline"
                    className="border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                  >
                    {result.category}
                  </Badge>
                  <span className="text-neutral-300">
                    {result.earnedPoints}/{result.totalPoints} pts /{" "}
                    {result.percentage}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  {result.correct}/{result.total} correct
                </p>
                <Progress
                  value={result.percentage}
                  className="mt-3 h-2 bg-neutral-800"
                />
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {questions.map((question, index) => {
          const selectedAnswers = answers[question.id];
          const correctAnswers = getCorrectAnswers(question);
          const isCorrect = isQuestionCorrect(question, selectedAnswers);

          return (
            <Card
              key={question.id}
              className="border border-white/10 bg-neutral-900/80 text-neutral-50 ring-0"
            >
              <CardHeader className="px-5 pt-5">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2
                      className="mt-1 size-5 shrink-0 text-emerald-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="mt-1 size-5 shrink-0 text-red-500"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-3 border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                    >
                      {question.category}
                    </Badge>
                    <CardTitle className="text-base leading-6 text-white">
                      {index + 1}. {question.prompt}
                    </CardTitle>
                    <p className="mt-3 text-sm text-neutral-400">
                      Your answer:{" "}
                      <span className="text-neutral-100">
                        {formatAnswerList(selectedAnswers)}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="mt-2 text-sm text-neutral-400">
                        Correct answer{correctAnswers.length > 1 ? "s" : ""}:{" "}
                        <span className="text-emerald-400">
                          {formatAnswerList(correctAnswers)}
                        </span>
                      </p>
                    )}
                    <p className="mt-3 text-sm leading-6 text-neutral-300">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
