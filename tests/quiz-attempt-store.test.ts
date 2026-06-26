import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import type { ExamQuestion } from "@/types/question";

let store: typeof import("../lib/quiz-attempt-store");

function makeQuestion(
  id: number,
  category: ExamQuestion["category"],
  difficulty: ExamQuestion["difficulty"],
): ExamQuestion {
  return {
    id,
    prompt: `Question ${id}`,
    choices: ["A", "B", "C"],
    correctAnswer: "A",
    explanation: "Because A is correct.",
    category,
    difficulty,
  };
}

beforeAll(async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "saviynt-quiz-store-"));
  process.env.QUIZ_DATABASE_PATH = path.join(directory, "test.sqlite");
  store = await import("../lib/quiz-attempt-store");
});

describe("quiz attempt store", () => {
  it("persists attempts and aggregates weak areas", () => {
    const attemptId = crypto.randomUUID();
    const questions = [
      makeQuestion(1, "Access Requests", "easy"),
      makeQuestion(2, "SoD", "hard"),
    ];

    store.createQuizAttempt({
      attemptId,
      requestedCount: questions.length,
      requestedCategories: ["Access Requests", "SoD"],
      questions,
    });

    const result = store.completeQuizAttempt(attemptId, {
      1: "A",
      2: "B",
    });
    const analytics = store.getQuizAnalytics();

    expect(result?.percentage).toBe(25);
    expect(analytics.totalAttempts).toBe(1);
    expect(analytics.totalQuestionsAnswered).toBe(2);
    expect(analytics.weakCategories[0]).toMatchObject({
      label: "SoD",
      percentage: 0,
    });
    expect(analytics.byDifficulty).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "easy", percentage: 100 }),
        expect.objectContaining({ label: "hard", percentage: 0 }),
      ]),
    );
  });
});
