import { Progress } from "@/components/ui/progress";

type ExamProgressProps = {
  currentQuestion: number;
  totalQuestions: number;
};

export function ExamProgress({
  currentQuestion,
  totalQuestions,
}: ExamProgressProps) {
  const value = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-200">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="text-neutral-400">{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-2 bg-neutral-800" />
    </div>
  );
}
