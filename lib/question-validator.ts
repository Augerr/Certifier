import type { Difficulty, ExamQuestion } from "@/types/question";

export type ValidationIssue = {
  index: number;
  severity: "error" | "warning";
  message: string;
};

const TARGET_DIFFICULTY_RATIO: Record<Difficulty, number> = {
  easy: 0.3,
  medium: 0.5,
  hard: 0.2,
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateQuestions(questions: ExamQuestion[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenPrompts = new Map<string, number>();

  questions.forEach((q, index) => {
    if (!q.prompt?.trim()) {
      issues.push({ index, severity: "error", message: "Missing prompt." });
    }

    const normalizedPrompt = normalize(q.prompt);
    if (seenPrompts.has(normalizedPrompt)) {
      issues.push({
        index,
        severity: "error",
        message: `Duplicate prompt. First seen at index ${seenPrompts.get(
          normalizedPrompt,
        )}.`,
      });
    } else {
      seenPrompts.set(normalizedPrompt, index);
    }

    if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 4) {
      issues.push({
        index,
        severity: "error",
        message: "Question must have between 2 and 4 choices.",
      });
    } else {
      const normalizedChoices = q.choices.map(normalize);
      const uniqueChoices = new Set(normalizedChoices);

      if (uniqueChoices.size !== q.choices.length) {
        issues.push({
          index,
          severity: "error",
          message: "Choices must be unique.",
        });
      }

      if (!q.choices.includes(q.correctAnswer)) {
        issues.push({
          index,
          severity: "error",
          message: "correctAnswer must exactly match one of the choices.",
        });
      }
    }

    if (!q.explanation?.trim()) {
      issues.push({
        index,
        severity: "warning",
        message: "Missing explanation.",
      });
    }

    if (!q.category?.trim()) {
      issues.push({
        index,
        severity: "warning",
        message: "Missing category.",
      });
    }

    if (!["easy", "medium", "hard"].includes(q.difficulty)) {
      issues.push({
        index,
        severity: "error",
        message: "Invalid difficulty.",
      });
    }
  });

  return issues;
}

function getDifficultyDistribution(questions: ExamQuestion[]) {
  const counts: Record<Difficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  for (const q of questions) {
    if (q.difficulty in counts) {
      counts[q.difficulty]++;
    }
  }

  return Object.fromEntries(
    Object.entries(counts).map(([difficulty, count]) => [
      difficulty,
      {
        count,
        percentage: Number(((count / questions.length) * 100).toFixed(1)),
        target: TARGET_DIFFICULTY_RATIO[difficulty as Difficulty] * 100,
      },
    ]),
  );
}

function getCategoryDistribution(questions: ExamQuestion[]) {
  return questions.reduce<Record<string, number>>((acc, q) => {
    const category = q.category || "unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
}

export function analyzeQuestionBank(questions: ExamQuestion[]) {
  const issues = validateQuestions(questions);

  return {
    totalQuestions: questions.length,
    errorCount: issues.filter((i) => i.severity === "error").length,
    warningCount: issues.filter((i) => i.severity === "warning").length,
    difficultyDistribution: getDifficultyDistribution(questions),
    categoryDistribution: getCategoryDistribution(questions),
    issues,
  };
}
