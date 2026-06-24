import type { Difficulty, ExamQuestion } from "@/types/question";

const targetDifficultyRatio: Record<Difficulty, number> = {
  easy: 0.3,
  medium: 0.5,
  hard: 0.2,
};

const difficultyFillOrder: Difficulty[] = ["medium", "easy", "hard"];

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function getTargetDifficultyCounts(size: number): Record<Difficulty, number> {
  const targets = difficultyFillOrder.map((difficulty) => {
    const exactCount = size * targetDifficultyRatio[difficulty];

    return {
      difficulty,
      count: Math.floor(exactCount),
      remainder: exactCount % 1,
    };
  });
  let assignedCount = targets.reduce((sum, target) => sum + target.count, 0);

  for (const target of [...targets].sort((a, b) => b.remainder - a.remainder)) {
    if (assignedCount >= size) {
      break;
    }

    target.count += 1;
    assignedCount += 1;
  }

  return targets.reduce(
    (counts, target) => ({
      ...counts,
      [target.difficulty]: target.count,
    }),
    { easy: 0, medium: 0, hard: 0 } as Record<Difficulty, number>,
  );
}

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
  const examSize = Math.min(size, questions.length);
  const targetCounts = getTargetDifficultyCounts(examSize);
  const selectedQuestions: ExamQuestion[] = [];
  const selectedIds = new Set<number>();

  for (const difficulty of difficultyFillOrder) {
    const questionsForDifficulty = shuffle(
      questions.filter((question) => question.difficulty === difficulty),
    );
    const targetCount = targetCounts[difficulty];

    for (const question of questionsForDifficulty.slice(0, targetCount)) {
      selectedQuestions.push(question);
      selectedIds.add(question.id);
    }
  }

  if (selectedQuestions.length < examSize) {
    const remainingQuestions = shuffle(
      questions.filter((question) => !selectedIds.has(question.id)),
    );
    selectedQuestions.push(
      ...remainingQuestions.slice(0, examSize - selectedQuestions.length),
    );
  }

  return shuffle(selectedQuestions);
}
