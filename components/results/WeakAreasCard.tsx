import { Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { QuizAnalytics } from "@/types/analytics";

type WeakAreasCardProps = {
  analytics: QuizAnalytics | null | undefined;
};

export function WeakAreasCard({ analytics }: WeakAreasCardProps) {
  if (!analytics || analytics.totalAttempts === 0) {
    return null;
  }

  return (
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
                <span className="text-neutral-300">{result.percentage}%</span>
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
  );
}
