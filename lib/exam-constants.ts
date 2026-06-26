import type { ExamQuestion } from "@/types/question";

export const passingPercentage = 70;

export const difficultyPointValue: Record<ExamQuestion["difficulty"], number> =
  {
    easy: 1,
    medium: 2,
    hard: 3,
  };
