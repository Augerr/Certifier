import { Progress } from "@/components/ui/progress";

type ExamProgressProps = {
  currentQuestion: number;
  totalQuestions: number;
};

export function ExamProgress({
  currentQuestion,
  totalQuestions,
}: ExamProgressProps) {
  const value = ((currentQuestion - 1) / totalQuestions) * 100;

  return (
    <div className="border-t border-white/10 bg-neutral-900/50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-200">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="text-neutral-400">{Math.round(value)}%</span>
      </div>
      <Progress
        value={value}
        className="h-2 bg-neutral-800 [&_[data-slot=progress-indicator]]:bg-blue-500"
      />
    </div>
  );
}
