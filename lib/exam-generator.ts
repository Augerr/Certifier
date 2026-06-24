import type { ExamQuestion } from "@/types/question";

export function generateQuestionBank(
  questions: Omit<ExamQuestion, "id">[],
): ExamQuestion[] {
  return questions.map((question, index) => ({
    ...question,
    id: index + 1,
  }));
}

export function generateExam(
  questions: ExamQuestion[],
  size = 70,
): ExamQuestion[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, Math.min(size, questions.length));
}
