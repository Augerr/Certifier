import { generateQuestionBank } from "@/lib/exam-generator";
import { analyzeQuestionBank } from "@/lib/question-validator";
import { examCategories } from "@/types/question";
import type { ExamCategory, ExamQuestion } from "@/types/question";

export { examCategories };
export type { ExamCategory, ExamQuestion };

export const passingPercentage = 70;

export const difficultyPointValue: Record<ExamQuestion["difficulty"], number> =
  {
    easy: 1,
    medium: 2,
    hard: 3,
  };

import examQuestionBank from "@/data/exam-question-bank.json";

export const examQuestions = generateQuestionBank(
  examQuestionBank as unknown as Omit<import("@/types/question").ExamQuestion, "id">[],
);

export const questionBankAnalysis = analyzeQuestionBank(examQuestions);

if (questionBankAnalysis.errorCount > 0) {
  console.error("Question bank validation failed", questionBankAnalysis.issues);
}
